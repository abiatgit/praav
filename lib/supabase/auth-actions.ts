'use server';

import { createClient } from './server';
import { redirect } from 'next/navigation';

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if profile exists and onboarding status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', data.user.id)
      .single();

    console.log('Profile check after signup:', { profile, profileError });

    // If profile exists, check onboarding status
    if (profile) {
      if (profile.onboarding_completed) {
        redirect('/marketplace');
      } else {
        redirect('/onboarding');
      }
    } else {
      // Profile doesn't exist yet, redirect to onboarding anyway
      redirect('/onboarding');
    }
  }

  return { success: true, message: 'Check your email to confirm your account' };
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if profile exists and onboarding status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', data.user.id)
      .single();

    console.log('Profile check:', { profile, profileError });

    // If profile exists, check onboarding status
    if (profile) {
      if (profile.onboarding_completed) {
        redirect('/marketplace');
      } else {
        redirect('/onboarding');
      }
    } else {
      // Profile doesn't exist yet, redirect to onboarding
      redirect('/onboarding');
    }
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured' };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

export async function getUser() {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
