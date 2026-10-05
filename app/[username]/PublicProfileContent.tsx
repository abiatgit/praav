'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Package, Star, Edit, Heart, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from '@/components/profiles/FollowButton';
import { CartIcon } from '@/components/cart/CartIcon';

const CONDITION_OPTIONS = [
  { value: 'new_with_tags', label: 'New with Tags' },
  { value: 'new_without_tags', label: 'New without Tags' },
  { value: 'excellent', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

interface PublicProfileContentProps {
  profile: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    city: string | null;
    postcode?: string | null;
    bio: string | null;
    rating?: number | null;
    total_sales?: number | null;
    activeListings: number;
    soldListings: number;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
    isOwnProfile: boolean;
  };
  listings: Array<{
    id: string;
    title: string;
    price: number;
    size: string | null;
    condition?: string | null;
    category: { name: string };
    images: Array<{
      image_url: string;
      is_cover: boolean;
      display_order: number;
    }>;
  }>;
}

export default function PublicProfileContent({ profile, listings }: PublicProfileContentProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">SELLER PROFILE</div>
          <div className="flex-1 md:flex-none text-center">{profile.display_name || `@${profile.username}`}</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Empty */}
            <div className="hidden md:block"></div>

            {/* Logo - Center */}
            <div className="col-span-3 md:col-span-1 text-center">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="relative w-7 h-7">
                  <Image
                    src="/praavlogo.png"
                    alt="praav"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-light tracking-wider">PRAAV</span>
              </Link>
            </div>

            {/* Actions - Right */}
            <div className="hidden md:flex items-center justify-end gap-3">
              <CartIcon />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-9 px-3">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/loved">
                <Button variant="ghost" size="sm" className="h-9 px-3">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="sm" className="h-9 px-4 rounded-none bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  SELL
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4 text-xs tracking-widest overflow-x-auto">
            <Link href="/marketplace" className="hover:text-gray-600 transition-colors whitespace-nowrap">MARKETPLACE</Link>
            <Link href="/profiles" className="hover:text-gray-600 transition-colors whitespace-nowrap">SELLERS</Link>
            <Link href="/loved" className="hover:text-gray-600 transition-colors whitespace-nowrap">SAVED</Link>
            <Link href="/followers" className="hover:text-gray-600 transition-colors whitespace-nowrap">FOLLOWERS</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Actions Bar */}
      <div className="md:hidden border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-none">
              <User className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <Link href="/loved" className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-none">
              <Heart className="h-4 w-4 mr-1" />
              Saved
            </Button>
          </Link>
          <Link href="/sell" className="flex-1">
            <Button size="sm" className="w-full rounded-none bg-black hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Sell
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Section */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-gray-500">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-light tracking-wide mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                {profile.city && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}</span>
                  </div>
                )}

                {profile.rating && profile.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    New seller
                  </Badge>
                )}

                {profile.total_sales && profile.total_sales > 0 && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{profile.total_sales} sales</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-700 mb-6">
                <div>
                  <span className="font-semibold text-black">{profile.activeListings}</span>
                  <span className="ml-1">
                    {profile.activeListings === 1 ? 'listing' : 'listings'}
                  </span>
                </div>
                {profile.soldListings > 0 && (
                  <div>
                    <span className="font-semibold text-black">{profile.soldListings}</span>
                    <span className="ml-1">sold</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-black">{profile.followerCount}</span>
                  <span className="ml-1">
                    {profile.followerCount === 1 ? 'follower' : 'followers'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-black">{profile.followingCount}</span>
                  <span className="ml-1">following</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {profile.isOwnProfile ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-none text-xs tracking-wider">
                        <Edit className="mr-2 h-3 w-3" />
                        EDIT PROFILE
                      </Button>
                    </Link>
                    <Link href="/sell">
                      <Button size="sm" className="h-9 px-4 rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider">
                        SELL AN ITEM
                      </Button>
                    </Link>
                  </>
                ) : (
                  <FollowButton
                    userId={profile.user_id}
                    initialIsFollowing={profile.isFollowing}
                    variant="default"
                    size="default"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-light tracking-wide">
            ITEMS FOR SALE
            {listings.length > 0 && (
              <span className="ml-2 text-gray-500">
                ({listings.length})
              </span>
            )}
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6">
              <Package className="h-12 w-12 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-light tracking-wide mb-3">NO ACTIVE LISTINGS</h3>
            <p className="text-gray-600 mb-8">
              {profile.isOwnProfile
                ? 'Start selling by listing your first item'
                : `${profile.display_name || profile.username} currently has no active listings`
              }
            </p>
            {profile.isOwnProfile && (
              <Link href="/sell">
                <Button className="rounded-none h-12 px-8 text-xs tracking-wider bg-black hover:bg-gray-800 text-white">
                  SELL AN ITEM
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {listings.map((listing) => {
              const coverImage = listing.images.find((img) => img.is_cover) || listing.images[0];
              const conditionLabel = CONDITION_OPTIONS.find(c => c.value === listing.condition)?.label;

              return (
                <div key={listing.id} className="group">
                  {/* Product Image */}
                  <Link
                    href={`/listing/${listing.id}`}
                    className="block relative aspect-[4/5] bg-gray-100 mb-3 overflow-hidden"
                  >
                    {coverImage && (
                      <Image
                        src={coverImage.image_url}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <Link href={`/listing/${listing.id}`}>
                      <h3 className="text-sm font-normal text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-base font-medium text-black">
                      £{listing.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {listing.size && <span>{listing.size}</span>}
                      {listing.size && listing.condition && <span>·</span>}
                      {listing.condition && (
                        <span className="capitalize">
                          {conditionLabel || listing.condition}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
