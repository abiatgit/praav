import { notFound, redirect } from 'next/navigation';
import { getPublicProfile } from '@/lib/supabase/profile-actions';
import { getFollowers } from '@/lib/supabase/follow-actions';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FollowersPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

  const { profile, error } = await getPublicProfile(cleanUsername);

  if (error || !profile) {
    notFound();
  }

  const { users } = await getFollowers(profile.user_id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/@${username}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <h1 className="text-2xl font-bold mb-6">Followers</h1>

        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => {
              const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=random`;

              return (
                <Link
                  key={user.user_id}
                  href={`/@${user.username}`}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={user.display_name || user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.display_name || user.username}</h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.city && (
                      <p className="text-sm text-muted-foreground">{user.city}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No followers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
