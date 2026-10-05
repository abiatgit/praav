import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { getFollowers } from '@/lib/supabase/follow-actions';
import { FollowersContent } from './FollowersContent';

export const metadata = {
  title: 'Followers | praav.uk',
  description: 'People who follow you',
};

export default async function FollowersPage() {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get followers
  const { users } = await getFollowers(user.id);

  return <FollowersContent users={users} />;
}
