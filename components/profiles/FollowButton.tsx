'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '@/lib/supabase/follow-actions';
import { useAuth } from '@/components/providers/AuthProvider';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function FollowButton({
  userId,
  initialIsFollowing,
  variant = 'default',
  size = 'default',
  className,
}: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        const result = await unfollowUser(userId);
        if (result.success) {
          setIsFollowing(false);
          router.refresh();
        } else if (result.error) {
          console.error('Unfollow error:', result.error);
          alert(result.error);
        }
      } else {
        const result = await followUser(userId);
        if (result.success) {
          setIsFollowing(true);
          router.refresh();
        } else if (result.error) {
          console.error('Follow error:', result.error);
          alert(result.error);
        }
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        isFollowing ? 'Following' : 'Follow'
      )}
    </Button>
  );
}
