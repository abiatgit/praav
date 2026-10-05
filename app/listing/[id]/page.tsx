import { notFound } from 'next/navigation';
import { getListing } from '@/lib/supabase/listing-actions';
import { isListingLoved } from '@/lib/supabase/loved-actions';
import { createClient } from '@/lib/supabase/server';
import ListingDetail from './ListingDetail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { listing } = await getListing(id);

  if (!listing) {
    return {
      title: 'Listing Not Found | praav.uk',
    };
  }

  return {
    title: `${listing.title} | praav.uk`,
    description: listing.description || `${listing.title} for sale on praav.uk`,
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const { listing, error } = await getListing(id);

  if (error || !listing) {
    notFound();
  }

  // Check if the listing is loved by the current user
  const initialIsLoved = await isListingLoved(id);

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ListingDetail
      listing={listing}
      initialIsLoved={initialIsLoved}
      currentUserId={user?.id}
    />
  );
}
