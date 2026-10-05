'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';

export interface FollowResult {
  success?: boolean;
  error?: string;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

/**
 * Follow a user
 */
export async function followUser(followingId: string): Promise<FollowResult> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { error: 'Database connection failed' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to follow users' };
    }

    // Prevent self-follow
    if (user.id === followingId) {
      return { error: 'You cannot follow yourself' };
    }

    // Check if target user has a public profile
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('profile_visibility')
      .eq('user_id', followingId)
      .single();

    if (!targetProfile || targetProfile.profile_visibility !== 'public') {
      return { error: 'This profile is not available' };
    }

    // Insert follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId,
      });

    if (error) {
      // Check for unique constraint violation (already following)
      if (error.code === '23505') {
        return { error: 'You are already following this user' };
      }
      console.error('Follow error:', error);
      return { error: 'Failed to follow user' };
    }

    // Revalidate paths to update UI
    revalidatePath('/profiles');
    revalidatePath('/following');

    return { success: true };
  } catch (error) {
    console.error('Follow user error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followingId: string): Promise<FollowResult> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { error: 'Database connection failed' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to unfollow users' };
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) {
      console.error('Unfollow error:', error);
      return { error: 'Failed to unfollow user' };
    }

    // Revalidate paths to update UI
    revalidatePath('/profiles');
    revalidatePath('/following');

    return { success: true };
  } catch (error) {
    console.error('Unfollow user error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get follow stats for a user
 */
export async function getFollowStats(userId: string): Promise<FollowStats> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { followerCount: 0, followingCount: 0, isFollowing: false };
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Get follower count
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Check if current user is following this user
    let isFollowing = false;
    if (user) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      isFollowing = !!data;
    }

    return {
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      isFollowing,
    };
  } catch (error) {
    console.error('Get follow stats error:', error);
    return { followerCount: 0, followingCount: 0, isFollowing: false };
  }
}

/**
 * Get users that the current user is following
 */
export async function getFollowingUsers() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { users: [] };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { users: [] };
    }

    // Get following IDs - gracefully handle if table doesn't exist
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false });

    // If there's an error or no data, just return empty array (table might not exist yet)
    if (followError || !followData || followData.length === 0) {
      return { users: [] };
    }

    // Get profiles for the following IDs
    const followingIds = followData.map(f => f.following_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, city, profile_visibility')
      .in('user_id', followingIds)
      .eq('profile_visibility', 'public');

    if (profilesError || !profiles) {
      return { users: [] };
    }

    // Get listing counts for each profile
    const usersWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        // Get active listing count
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', profile.user_id)
          .eq('status', 'published');

        return {
          ...profile,
          listingCount: count || 0,
        };
      })
    );

    return { users: usersWithCounts };
  } catch (error) {
    // Silently fail and return empty array
    return { users: [] };
  }
}

/**
 * Get followers of a user
 */
export async function getFollowers(userId: string) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { users: [], error: 'Database connection failed' };
    }

    // Get follower IDs
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (followError) {
      console.error('Get followers error:', followError);
      return { users: [], error: 'Failed to fetch followers' };
    }

    if (!followData || followData.length === 0) {
      return { users: [] };
    }

    // Get profiles for the follower IDs
    const followerIds = followData.map(f => f.follower_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, city, profile_visibility')
      .in('user_id', followerIds)
      .eq('profile_visibility', 'public');

    if (profilesError) {
      console.error('Get follower profiles error:', profilesError);
      return { users: [], error: 'Failed to fetch profiles' };
    }

    return { users: profiles || [] };
  } catch (error) {
    console.error('Get followers error:', error);
    return { users: [], error: 'An unexpected error occurred' };
  }
}

/**
 * Get users that a specific user is following
 */
export async function getFollowingForUser(userId: string) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { users: [], error: 'Database connection failed' };
    }

    // Get following IDs
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (followError) {
      console.error('Get following for user error:', followError);
      return { users: [], error: 'Failed to fetch following' };
    }

    if (!followData || followData.length === 0) {
      return { users: [] };
    }

    // Get profiles for the following IDs
    const followingIds = followData.map(f => f.following_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, city, profile_visibility')
      .in('user_id', followingIds)
      .eq('profile_visibility', 'public');

    if (profilesError) {
      console.error('Get following profiles error:', profilesError);
      return { users: [], error: 'Failed to fetch profiles' };
    }

    return { users: profiles || [] };
  } catch (error) {
    console.error('Get following for user error:', error);
    return { users: [], error: 'An unexpected error occurred' };
  }
}
