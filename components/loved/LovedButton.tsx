'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { loveItem, unloveItem } from '@/lib/supabase/loved-actions';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface LovedButtonProps {
  listingId: string;
  initialIsLoved: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'button';
  className?: string;
  showLabel?: boolean;
}

export function LovedButton({
  listingId,
  initialIsLoved,
  size = 'md',
  variant = 'overlay',
  className,
  showLabel = false,
}: LovedButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoved, setIsLoved] = useState(initialIsLoved);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent event from bubbling to parent links
    e.preventDefault();
    e.stopPropagation();

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Prevent rapid clicking
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLoved) {
        const result = await unloveItem(listingId);
        if (result.success) {
          setIsLoved(false);
          router.refresh();
        } else if (result.error) {
          console.error('Unlove error:', result.error);
          // Silently fail for better UX - could use toast notification instead
        }
      } else {
        const result = await loveItem(listingId);
        if (result.success) {
          setIsLoved(true);
          router.refresh();
        } else if (result.error) {
          console.error('Love error:', result.error);
          // Silently fail for better UX - could use toast notification instead
        }
      }
    } catch (error) {
      console.error('Love/unlove error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes for icon
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Base classes for overlay variant (used on product cards)
  const overlayClasses = cn(
    'rounded-full transition-all duration-200',
    'flex items-center justify-center',
    'hover:scale-110 active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
    {
      'bg-white/90 hover:bg-white text-foreground': !isLoved,
      'bg-red-500 hover:bg-red-600 text-white': isLoved,
      'p-1.5': size === 'sm',
      'p-2': size === 'md',
      'p-2.5': size === 'lg',
    },
    className
  );

  // Base classes for button variant (used on detail pages)
  const buttonClasses = cn(
    'rounded-md border transition-all duration-200',
    'flex items-center justify-center gap-2',
    'hover:scale-105 active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
    {
      'bg-background hover:bg-accent text-foreground border-input': !isLoved,
      'bg-red-500 hover:bg-red-600 text-white border-red-500': isLoved,
      'px-2 py-1.5 text-sm': size === 'sm',
      'px-3 py-2': size === 'md',
      'px-4 py-2.5 text-lg': size === 'lg',
    },
    className
  );

  if (variant === 'overlay') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={overlayClasses}
        aria-label={isLoved ? 'Remove from loved items' : 'Add to loved items'}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
        ) : (
          <Heart
            className={cn(iconSizeClasses[size], {
              'fill-current': isLoved,
            })}
          />
        )}
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={buttonClasses}
      aria-label={isLoved ? 'Remove from loved items' : 'Add to loved items'}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
          {showLabel && <span>{isLoved ? 'Removing...' : 'Adding...'}</span>}
        </>
      ) : (
        <>
          <Heart
            className={cn(iconSizeClasses[size], {
              'fill-current': isLoved,
            })}
          />
          {showLabel && <span>{isLoved ? 'Loved' : 'Love'}</span>}
        </>
      )}
    </button>
  );
}
