'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';

export async function getProfile() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile };
}

export async function checkUsernameAvailable(username: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { available: false };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('profiles')
    .select('username, user_id')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (error) {
    return { available: false };
  }

  // Available if no match, or if the match is the current user
  const available = !data || (user && data.user_id === user.id);

  return { available };
}

export async function updateProfile(updates: any) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Lowercase username if provided
  if (updates.username) {
    updates.username = updates.username.toLowerCase();
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  return { profile: data };
}

export async function updateOnboardingStep(step: number) {
  return updateProfile({ onboarding_step: step });
}

export async function completeOnboarding() {
  return updateProfile({
    onboarding_completed: true,
    onboarding_step: 5
  });
}

export async function getCategories() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    return { error: error.message };
  }

  return { categories: data };
}

export async function updateSellerCategories(categoryIds: string[]) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // Delete existing categories
  await supabase
    .from('seller_categories')
    .delete()
    .eq('seller_id', profile.id);

  // Insert new categories
  if (categoryIds.length > 0) {
    const { error } = await supabase
      .from('seller_categories')
      .insert(
        categoryIds.map(categoryId => ({
          seller_id: profile.id,
          category_id: categoryId,
        }))
      );

    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
}

export async function updateSellerSizes(sizes: string[]) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // Delete existing sizes
  await supabase
    .from('seller_sizes')
    .delete()
    .eq('seller_id', profile.id);

  // Insert new sizes
  if (sizes.length > 0) {
    const { error } = await supabase
      .from('seller_sizes')
      .insert(
        sizes.map(size => ({
          seller_id: profile.id,
          size: size,
          size_type: 'uk_womens', // Default, can be enhanced later
        }))
      );

    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
}

export async function getSellerCategories() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { categories: [] };
  }

  const { data, error } = await supabase
    .from('seller_categories')
    .select('category_id, categories(*)')
    .eq('seller_id', profile.id);

  if (error) {
    return { error: error.message };
  }

  return { categories: data };
}

export async function getSellerSizes() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { sizes: [] };
  }

  const { data, error } = await supabase
    .from('seller_sizes')
    .select('*')
    .eq('seller_id', profile.id);

  if (error) {
    return { error: error.message };
  }

  return { sizes: data };
}

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile };
}
