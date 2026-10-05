import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { getProfile, getCategories } from '@/lib/supabase/profile-actions';
import SellContent from './SellContent';

export const metadata = {
  title: 'Sell an Item | praav.uk',
  description: 'List your pre-loved Indian ethnic fashion for sale',
};

export default async function SellPage() {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Check onboarding completion
  const { profile } = await getProfile();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  // Load categories for the form
  const { categories } = await getCategories();

  return <SellContent categories={categories || []} />;
}
