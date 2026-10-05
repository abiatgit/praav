'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from './FollowButton';
import type { SellerProfile } from '@/lib/supabase/seller-discovery-actions';

interface SellerProfileCardProps {
  seller: SellerProfile;
  isFollowing?: boolean;
}

export function SellerProfileCard({ seller, isFollowing = false }: SellerProfileCardProps) {
  const avatarUrl = seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.display_name || seller.username)}&background=random`;

  return (
    <div className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-200">
      <Link href={`/@${seller.username}`} className="block">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-3">
            <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-border group-hover:border-primary/40 transition-colors">
              <Image
                src={avatarUrl}
                alt={seller.display_name || seller.username}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {seller.display_name || seller.username}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{seller.username}
              </p>
              {seller.city && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{seller.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {seller.bio && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {seller.bio}
            </p>
          )}

          {/* Stats and Rating */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="font-medium">{seller.listingCount} {seller.listingCount === 1 ? 'item' : 'items'}</span>
              <span>{seller.followerCount} {seller.followerCount === 1 ? 'follower' : 'followers'}</span>
            </div>
            {/* Rating or New Seller Badge */}
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                New seller
              </Badge>
            </div>
          </div>

          {/* Preview Images */}
          {seller.previewImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {seller.previewImages.slice(0, 4).map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded overflow-hidden bg-muted group-hover:ring-2 group-hover:ring-primary/10 transition-all"
                >
                  <Image
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
              {/* Fill empty slots */}
              {Array.from({ length: Math.max(0, 4 - seller.previewImages.length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="relative aspect-square rounded bg-muted/50"
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Follow Button */}
      <div className="px-6 pb-6 pt-0">
        <FollowButton
          userId={seller.user_id}
          initialIsFollowing={isFollowing}
          variant="default"
          size="default"
          className="w-full"
        />
      </div>
    </div>
  );
}
