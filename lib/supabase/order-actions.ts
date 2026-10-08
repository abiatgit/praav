'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe, RESERVATION_TIMEOUT_MINUTES } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import type { Order, OrderWithDetails } from '@/lib/types/order';

/**
 * Reserve a listing for checkout
 * This prevents other buyers from purchasing while this buyer is checking out
 */
export async function reserveListing(listingId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: 'You must be logged in to purchase' };
  }

  // Get the listing with seller info
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(user_id)')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return { success: false, error: 'Listing not found' };
  }

  // Check if seller is trying to buy their own item
  if (listing.seller_id === user.id) {
    return { success: false, error: 'You cannot purchase your own listing' };
  }

  // Check if listing is published
  if (listing.status !== 'published') {
    return { success: false, error: 'This listing is no longer available' };
  }

  // Check if already reserved by someone else
  if (listing.reserved_by && listing.reserved_by !== user.id) {
    if (listing.reservation_expires_at && new Date(listing.reservation_expires_at) > new Date()) {
      return { success: false, error: 'This listing is currently being purchased by someone else' };
    }
  }

  // Reserve the listing
  const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000);

  const { error: reserveError } = await supabase
    .from('listings')
    .update({
      reserved_by: user.id,
      reserved_at: new Date().toISOString(),
      reservation_expires_at: expiresAt.toISOString(),
    })
    .eq('id', listingId)
    .eq('status', 'published'); // Only update if still published

  if (reserveError) {
    return { success: false, error: 'Failed to reserve listing' };
  }

  revalidatePath(`/listing/${listingId}`);
  return { success: true };
}

/**
 * Release a listing reservation
 */
export async function releaseReservation(listingId: string): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('listings')
    .update({
      reserved_by: null,
      reserved_at: null,
      reservation_expires_at: null,
    })
    .eq('id', listingId)
    .eq('reserved_by', user.id);

  revalidatePath(`/listing/${listingId}`);
}

/**
 * Create a Stripe Checkout Session for a listing
 */
export async function createCheckoutSession(listingId: string): Promise<{
  sessionId?: string;
  url?: string;
  error?: string;
}> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'You must be logged in to purchase' };
  }

  // Get the listing from database (source of truth for price)
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      images:listing_images(id, image_url, is_cover, display_order),
      category:categories(id, name),
      seller:profiles!seller_id(user_id, username, display_name, city)
    `)
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return { error: 'Listing not found' };
  }

  // Verify the listing is reserved by this user
  if (listing.reserved_by !== user.id) {
    return { error: 'Listing must be reserved before creating checkout session' };
  }

  // Verify the listing is still published
  if (listing.status !== 'published') {
    return { error: 'Listing is no longer available' };
  }

  // Prevent seller from buying their own item
  if (listing.seller_id === user.id) {
    return { error: 'You cannot purchase your own listing' };
  }

  // Create a pending order in database
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: user.id,
      seller_id: listing.seller_id,
      listing_id: listing.id,
      amount: listing.price,
      currency: 'GBP',
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: 'Failed to create order' };
  }

  // Get the cover image
  const coverImage = listing.images?.find((img: any) => img.is_cover) || listing.images?.[0];

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: listing.title,
              description: `${listing.category.name} • ${listing.condition}${listing.size ? ` • Size ${listing.size}` : ''}`,
              images: coverImage?.image_url ? [coverImage.image_url] : undefined,
              metadata: {
                listing_id: listing.id,
                seller_id: listing.seller_id,
              },
            },
            unit_amount: Math.round(listing.price * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        receipt_email: user.email, // Send Stripe receipt to buyer's email
      },
      metadata: {
        order_id: order.id,
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${listingId}?cancelled=true`,
      customer_email: user.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes (Stripe minimum)
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);

    // Delete the order if session creation failed
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);

    return { error: 'Failed to create checkout session' };
  }
}

/**
 * Get buyer's orders
 */
export async function getBuyerOrders(): Promise<{
  orders: OrderWithDetails[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { orders: [], error: 'You must be logged in' };
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        size,
        condition,
        images:listing_images(id, image_url, is_cover),
        category:categories(id, name)
      ),
      seller:profiles!seller_id(user_id, username, display_name, avatar_url, city)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { orders: [], error: 'Failed to fetch orders' };
  }

  return { orders: orders as unknown as OrderWithDetails[] };
}

/**
 * Get seller's orders
 */
export async function getSellerOrders(): Promise<{
  orders: OrderWithDetails[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { orders: [], error: 'You must be logged in' };
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        size,
        condition,
        images:listing_images(id, image_url, is_cover),
        category:categories(id, name)
      ),
      buyer:profiles!buyer_id(user_id, username, display_name)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { orders: [], error: 'Failed to fetch orders' };
  }

  return { orders: orders as unknown as OrderWithDetails[] };
}

/**
 * Get order by Stripe Checkout Session ID
 * Used on success page to fetch order details
 */
export async function getOrderBySessionId(sessionId: string): Promise<{
  order: OrderWithDetails | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { order: null, error: 'You must be logged in' };
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        size,
        condition,
        images:listing_images(id, image_url, is_cover),
        category:categories(id, name)
      ),
      seller:profiles!seller_id(user_id, username, display_name, avatar_url, city),
      buyer:profiles!buyer_id(user_id, username, display_name)
    `)
    .eq('stripe_checkout_session_id', sessionId)
    .single();

  if (error) {
    return { order: null, error: 'Order not found' };
  }

  // Verify user has access to this order (buyer or seller)
  if (order.buyer_id !== user.id && order.seller_id !== user.id) {
    return { order: null, error: 'You do not have access to this order' };
  }

  return { order: order as unknown as OrderWithDetails };
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<{
  order: OrderWithDetails | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { order: null, error: 'You must be logged in' };
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        size,
        condition,
        images:listing_images(id, image_url, is_cover),
        category:categories(id, name)
      ),
      seller:profiles!seller_id(user_id, username, display_name, avatar_url, city),
      buyer:profiles!buyer_id(user_id, username, display_name)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    return { order: null, error: 'Order not found' };
  }

  // Verify user has access to this order (buyer or seller)
  if (order.buyer_id !== user.id && order.seller_id !== user.id) {
    return { order: null, error: 'You do not have access to this order' };
  }

  return { order: order as unknown as OrderWithDetails };
}
