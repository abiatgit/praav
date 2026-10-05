import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { getFollowingUsers } from '@/lib/supabase/follow-actions';
import { FollowingContent } from './FollowingContent';

export const metadata = {
  title: 'Following | praav.uk',
  description: 'Sellers you follow',
};

export default async function FollowingPage() {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get following users
  const { users } = await getFollowingUsers();

  return <FollowingContent users={users} />;
}
