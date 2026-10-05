import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { getDiscoverySellers } from '@/lib/supabase/seller-discovery-actions';
import { getFollowingUsers } from '@/lib/supabase/follow-actions';
import { ProfilesContent } from './ProfilesContent';

export const metadata = {
  title: 'Discover Sellers | praav.uk',
  description: 'Find sellers, explore their collections and discover more pre-loved fashion',
};

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const searchQuery = params.search || '';

  // Get sellers for discovery (exclude current user)
  const { sellers } = await getDiscoverySellers({
    searchQuery,
    limit: 50,
    excludeUserId: user.id,
  });

  // Get users that current user is following
  const { users: followingUsers } = await getFollowingUsers();
  const followingUserIds = new Set(followingUsers?.map(u => u.user_id) || []);

  return <ProfilesContent sellers={sellers} initialSearch={searchQuery} followingUserIds={followingUserIds} />;
}
