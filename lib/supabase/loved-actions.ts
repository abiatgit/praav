'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';
import type { ListingWithDetails } from '@/lib/types/listing';

export interface LovedResult {
  success?: boolean;
  error?: string;
}

/**
 * Add a listing to user's loved items
 */
export async function loveItem(listingId: string): Promise<LovedResult> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { error: 'Database connection failed' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to love items' };
    }

    // Check if listing exists and is published
    const { data: listing } = await supabase
      .from('listings')
      .select('id, status')
      .eq('id', listingId)
      .single();

    if (!listing) {
      return { error: 'This listing does not exist' };
    }

    if (listing.status !== 'published') {
      return { error: 'This listing is not available' };
    }

    // Insert loved item relationship
    const { error } = await supabase
      .from('loved_items')
      .insert({
        user_id: user.id,
        listing_id: listingId,
      });

    if (error) {
      // Check for unique constraint violation (already loved)
      if (error.code === '23505') {
        return { error: 'You have already loved this item' };
      }
      console.error('Love item error:', error);
      return { error: 'Failed to love item' };
    }

    // Revalidate paths to update UI
    revalidatePath('/marketplace');
    revalidatePath('/loved');
    revalidatePath(`/listing/${listingId}`);

    return { success: true };
  } catch (error) {
    console.error('Love item error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Remove a listing from user's loved items
 */
export async function unloveItem(listingId: string): Promise<LovedResult> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { error: 'Database connection failed' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to unlove items' };
    }

    // Delete loved item relationship
    const { error } = await supabase
      .from('loved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      console.error('Unlove item error:', error);
      return { error: 'Failed to unlove item' };
    }

    // Revalidate paths to update UI
    revalidatePath('/marketplace');
    revalidatePath('/loved');
    revalidatePath(`/listing/${listingId}`);

    return { success: true };
  } catch (error) {
    console.error('Unlove item error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get all loved items for the current user with full listing details
 */
export async function getLovedItems(): Promise<{
  listings: ListingWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { listings: [], error: 'Database connection failed' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { listings: [], error: 'You must be logged in' };
    }

    // Get loved items with full listing details
    const { data, error } = await supabase
      .from('loved_items')
      .select(`
        listing_id,
        created_at,
        listings:listing_id (
          id,
          seller_id,
          title,
          description,
          category_id,
          size,
          condition,
          price,
          currency,
          brand,
          colour,
          fabric,
          occasion,
          damage_description,
          original_price,
          purchase_year,
          measurement_unit,
          bust,
          waist,
          hip,
          length,
          sleeve_length,
          status,
          created_at,
          updated_at,
          published_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get loved items error:', error);
      return { listings: [], error: 'Failed to fetch loved items' };
    }

    // Process listings to add images, category, and seller info
    const listingsWithDetails = await Promise.all(
      (data || [])
        .filter(item => item.listings) // Filter out any deleted listings
        .map(async (item) => {
          const listing = item.listings as unknown as Omit<ListingWithDetails, 'images' | 'category' | 'seller'>;

          // Get listing images
          const { data: images } = await supabase
            .from('listing_images')
            .select('*')
            .eq('listing_id', listing.id)
            .order('display_order', { ascending: true });

          // Get category details
          const { data: category } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('id', listing.category_id)
            .single();

          // Get seller details
          const { data: seller } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, avatar_url')
            .eq('user_id', listing.seller_id)
            .single();

          return {
            ...listing,
            images: images || [],
            category: category || { id: listing.category_id, name: 'Unknown', slug: 'unknown' },
            seller: seller || {
              user_id: listing.seller_id,
              username: 'unknown',
              display_name: 'Unknown Seller',
              avatar_url: null,
            },
          } as ListingWithDetails;
        })
    );

    return { listings: listingsWithDetails };
  } catch (error) {
    console.error('Get loved items error:', error);
    return { listings: [], error: 'An unexpected error occurred' };
  }
}

/**
 * Get listing IDs that the current user has loved (for efficient state checking)
 */
export async function getLovedListingIds(): Promise<{
  listingIds: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { listingIds: [] };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { listingIds: [] };
    }

    const { data, error } = await supabase
      .from('loved_items')
      .select('listing_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Get loved listing IDs error:', error);
      return { listingIds: [], error: 'Failed to fetch loved items' };
    }

    const listingIds = (data || []).map(item => item.listing_id);

    return { listingIds };
  } catch (error) {
    console.error('Get loved listing IDs error:', error);
    return { listingIds: [], error: 'An unexpected error occurred' };
  }
}

/**
 * Get count of loved items for the current user
 */
export async function getLovedCount(): Promise<number> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return 0;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { count } = await supabase
      .from('loved_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return count || 0;
  } catch (error) {
    console.error('Get loved count error:', error);
    return 0;
  }
}

/**
 * Check if a specific listing is loved by the current user
 */
export async function isListingLoved(listingId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from('loved_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Check if listing is loved error:', error);
    return false;
  }
}
