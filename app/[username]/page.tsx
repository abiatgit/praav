import { notFound } from 'next/navigation';
import { getPublicSellerProfile, getSellerListings } from '@/lib/supabase/seller-discovery-actions';
import PublicProfileContent from './PublicProfileContent';

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  // Decode URL-encoded username and remove @ symbol if present
  const decodedUsername = decodeURIComponent(username);
  const cleanUsername = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername;

  // Get profile with follow stats
  const { profile, error } = await getPublicSellerProfile(cleanUsername);

  if (error || !profile) {
    notFound();
  }

  // Get seller's published listings
  const { listings } = await getSellerListings(profile.user_id);

  return <PublicProfileContent profile={profile} listings={listings || []} />;
}
