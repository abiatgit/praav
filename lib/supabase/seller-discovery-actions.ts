'use server';

import { createClient } from './server';

export interface SellerProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  listingCount: number;
  followerCount: number;
  previewImages: string[];
}

/**
 * Get sellers for discovery page
 * Only shows sellers with completed onboarding, public profiles, and at least one active listing
 */
export async function getDiscoverySellers(options: {
  searchQuery?: string;
  limit?: number;
  offset?: number;
  excludeUserId?: string;
} = {}) {
  try {
    const { searchQuery, limit = 20, offset = 0, excludeUserId } = options;
    const supabase = await createClient();

    if (!supabase) {
      return { sellers: [], total: 0, error: 'Database connection failed' };
    }

    // Build query for profiles with public visibility and completed onboarding
    let query = supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, city, bio', { count: 'exact' })
      .eq('onboarding_completed', true)
      .eq('profile_visibility', 'public');

    // Exclude current user from discovery results
    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`;
      query = query.or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm},city.ilike.${searchTerm}`);
    }

    const { data: profiles, error: profilesError, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Get discovery sellers error:', profilesError);
      return { sellers: [], total: 0, error: 'Failed to fetch sellers' };
    }

    if (!profiles || profiles.length === 0) {
      return { sellers: [], total: 0 };
    }

    // For each profile, get listing count and preview images
    const sellersWithData = await Promise.all(
      profiles.map(async (profile) => {
        // Get active listing count
        const { count: listingCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', profile.user_id)
          .eq('status', 'published');

        // Get preview images (first 4 listing images)
        const { data: listings } = await supabase
          .from('listings')
          .select('id')
          .eq('seller_id', profile.user_id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(4);

        let previewImages: string[] = [];
        if (listings && listings.length > 0) {
          const { data: images } = await supabase
            .from('listing_images')
            .select('image_url')
            .in('listing_id', listings.map(l => l.id))
            .eq('is_cover', true);

          previewImages = (images || []).map(img => img.image_url).slice(0, 4);
        }

        // Get follower count
        const { count: followerCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profile.user_id);

        return {
          ...profile,
          listingCount: listingCount || 0,
          followerCount: followerCount || 0,
          previewImages,
        };
      })
    );

    // Filter out sellers with no active listings
    const sellersWithListings = sellersWithData.filter(seller => seller.listingCount > 0);

    return {
      sellers: sellersWithListings,
      total: count || 0,
    };
  } catch (error) {
    console.error('Get discovery sellers error:', error);
    return { sellers: [], total: 0, error: 'An unexpected error occurred' };
  }
}

/**
 * Get public seller profile by username
 */
export async function getPublicSellerProfile(username: string) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { profile: null, error: 'Database connection failed' };
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('profile_visibility', 'public')
      .single();

    if (profileError || !profile) {
      return { profile: null, error: 'Profile not found' };
    }

    // Get active listing count
    const { count: activeListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', profile.user_id)
      .eq('status', 'published');

    // Get sold listing count
    const { count: soldListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', profile.user_id)
      .eq('status', 'sold');

    // Get follower count
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.user_id);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.user_id);

    // Check if current user is following this profile
    const { data: { user } } = await supabase.auth.getUser();
    let isFollowing = false;
    let isOwnProfile = false;

    if (user) {
      isOwnProfile = user.id === profile.user_id;

      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id)
          .maybeSingle();

        isFollowing = !!followData;
      }
    }

    return {
      profile: {
        ...profile,
        activeListings: activeListings || 0,
        soldListings: soldListings || 0,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        isFollowing,
        isOwnProfile,
      },
    };
  } catch (error) {
    console.error('Get public seller profile error:', error);
    return { profile: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Get active listings for a seller
 */
export async function getSellerListings(userId: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const { limit = 20, offset = 0 } = options;
    const supabase = await createClient();

    if (!supabase) {
      return { listings: [], total: 0, error: 'Database connection failed' };
    }

    // Get listings
    const { data: listings, error: listingsError, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('seller_id', userId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listingsError) {
      console.error('Get seller listings error:', listingsError);
      return { listings: [], total: 0, error: 'Failed to fetch listings' };
    }

    if (!listings || listings.length === 0) {
      return { listings: [], total: count || 0 };
    }

    // Get images and categories for each listing
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        // Get images for this listing
        const { data: images } = await supabase
          .from('listing_images')
          .select('image_url, is_cover, display_order')
          .eq('listing_id', listing.id)
          .order('display_order', { ascending: true });

        // Get category for this listing
        const { data: category } = await supabase
          .from('categories')
          .select('name')
          .eq('id', listing.category_id)
          .single();

        return {
          ...listing,
          images: images || [],
          category: category || { name: 'Uncategorized' },
        };
      })
    );

    return {
      listings: listingsWithDetails,
      total: count || 0,
    };
  } catch (error) {
    console.error('Get seller listings error:', error);
    return { listings: [], total: 0, error: 'An unexpected error occurred' };
  }
}
