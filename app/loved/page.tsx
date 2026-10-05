import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { getLovedItems, getLovedListingIds } from '@/lib/supabase/loved-actions';
import { LovedContent } from './LovedContent';

export const metadata = {
  title: 'Loved Items | praav.uk',
  description: 'Your saved items',
};

export default async function LovedPage() {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get loved items with full listing details
  const { listings } = await getLovedItems();

  // Get loved listing IDs for state management
  const { listingIds } = await getLovedListingIds();

  return <LovedContent listings={listings} lovedListingIds={listingIds} />;
}
