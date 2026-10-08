import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// This needs to be a Service Role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        // Additional confirmation - optional
        console.log('PaymentIntent succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id);

  const orderId = session.metadata?.order_id;
  const listingId = session.metadata?.listing_id;
  const buyerId = session.metadata?.buyer_id;
  const sellerId = session.metadata?.seller_id;

  if (!orderId || !listingId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Check if we've already processed this session (idempotency)
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status')
    .eq('stripe_checkout_session_id', session.id)
    .single();

  if (existingOrder?.payment_status === 'paid') {
    console.log('Order already marked as paid, skipping');
    return;
  }

  // Get the payment intent from the session
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Update the order
  const { error: orderError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (orderError) {
    console.error('Failed to update order:', orderError);
    throw orderError;
  }

  // Mark listing as sold and clear reservation
  const { error: listingError } = await supabaseAdmin
    .from('listings')
    .update({
      status: 'sold',
      reserved_by: null,
      reserved_at: null,
      reservation_expires_at: null,
    })
    .eq('id', listingId);

  if (listingError) {
    console.error('Failed to update listing:', listingError);
    throw listingError;
  }

  console.log(`✅ Order ${orderId} marked as paid, listing ${listingId} marked as sold`);

  // Revalidate paths to update UI
  revalidatePath('/marketplace');
  revalidatePath('/browse');
  revalidatePath(`/listing/${listingId}`);
  revalidatePath('/orders');
  revalidatePath('/dashboard/orders');

  // TODO: Send confirmation emails to buyer and seller
  // TODO: Create notification for seller
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⏱️  Checkout session expired:', session.id);

  const orderId = session.metadata?.order_id;
  const listingId = session.metadata?.listing_id;

  if (!orderId || !listingId) {
    return;
  }

  // Mark order as cancelled
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
    })
    .eq('id', orderId);

  // Release the listing reservation
  await supabaseAdmin
    .from('listings')
    .update({
      status: 'published',
      reserved_by: null,
      reserved_at: null,
      reservation_expires_at: null,
    })
    .eq('id', listingId)
    .eq('status', 'reserved');

  console.log(`⏱️  Order ${orderId} cancelled, listing ${listingId} released`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  // Find order by payment intent
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, listing_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (!order) {
    return;
  }

  // Mark order as failed
  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
    })
    .eq('id', order.id);

  // Release listing
  await supabaseAdmin
    .from('listings')
    .update({
      status: 'published',
      reserved_by: null,
      reserved_at: null,
      reservation_expires_at: null,
    })
    .eq('id', order.listing_id)
    .eq('status', 'reserved');

  console.log(`❌ Order ${order.id} marked as failed`);
}
