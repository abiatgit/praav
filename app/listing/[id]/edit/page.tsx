import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getListing } from '@/lib/supabase/listing-actions';
import { getCategories } from '@/lib/supabase/profile-actions';
import EditListingContent from './EditListingContent';

interface EditListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  if (!supabase) {
    redirect('/login');
  }

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get listing
  const { listing, error } = await getListing(id);

  if (error || !listing) {
    notFound();
  }

  // Check if user owns this listing
  if (listing.seller_id !== user.id) {
    redirect(`/listing/${id}`);
  }

  // Get categories
  const { categories } = await getCategories();

  return <EditListingContent listing={listing} categories={categories || []} />;
}
