import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckoutContent from './CheckoutContent';

export default async function CheckoutPage({ params, searchParams }: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { listingId } = await params;
  const { cancelled } = await searchParams;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/checkout/${listingId}`);
  }

  // Get the listing with all details
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      images:listing_images(id, image_url, is_cover, display_order),
      category:categories(id, name),
      seller:profiles!seller_id(user_id, username, display_name, avatar_url, city)
    `)
    .eq('id', listingId)
    .single();

  if (error || !listing) {
    redirect('/marketplace');
  }

  // Prevent seller from buying their own item
  if (listing.seller_id === user.id) {
    redirect(`/listing/${listingId}`);
  }

  // Check if listing is available
  if (listing.status === 'sold') {
    redirect(`/listing/${listingId}`);
  }

  return (
    <CheckoutContent
      listing={listing}
      userId={user.id}
      cancelled={cancelled === 'true'}
    />
  );
}
