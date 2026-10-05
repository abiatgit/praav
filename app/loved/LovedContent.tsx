'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, User, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LovedButton } from '@/components/loved/LovedButton';
import { CartIcon } from '@/components/cart/CartIcon';
import type { ListingWithDetails } from '@/lib/types/listing';

const CONDITION_OPTIONS = [
  { value: 'new_with_tags', label: 'New with Tags' },
  { value: 'new_without_tags', label: 'New without Tags' },
  { value: 'excellent', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

interface LovedContentProps {
  listings: ListingWithDetails[];
  lovedListingIds: string[];
}

export function LovedContent({ listings, lovedListingIds }: LovedContentProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">SAVED ITEMS</div>
          <div className="flex-1 md:flex-none text-center">YOUR LOVED COLLECTION</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Empty on this page */}
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
            <Link href="/loved" className="text-black font-medium whitespace-nowrap">SAVED</Link>
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

      {/* Results Count */}
      {listings.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-sm text-gray-600">
              {listings.length} {listings.length === 1 ? 'item' : 'items'} saved
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {listings.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-light tracking-wide mb-3">NO LOVED ITEMS YET</h3>
            <p className="text-gray-600 mb-8">
              Browse the marketplace and save items you love to find them easily later
            </p>
            <Link href="/marketplace">
              <Button className="rounded-none h-12 px-8 text-sm tracking-wider bg-black hover:bg-gray-800 text-white">
                BROWSE MARKETPLACE
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {listings.map((listing) => {
              const coverImage = listing.images.find((img) => img.is_cover) || listing.images[0];
              const isLoved = lovedListingIds.includes(listing.id);
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
                    {/* Loved button overlay */}
                    <div className="absolute top-3 right-3 z-10">
                      <LovedButton
                        listingId={listing.id}
                        initialIsLoved={isLoved}
                        size="md"
                        variant="overlay"
                      />
                    </div>
                    {/* Show if sold or archived */}
                    {(listing.status === 'sold' || listing.status === 'archived') && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge className="text-white bg-black/40 backdrop-blur-sm border-white/20">
                          {listing.status === 'sold' ? 'Sold' : 'No longer available'}
                        </Badge>
                      </div>
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
                    {/* Seller info */}
                    <Link
                      href={`/@${listing.seller.username}`}
                      className="flex items-center gap-2 pt-1 group/seller"
                    >
                      <div className="relative h-5 w-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {listing.seller.avatar_url ? (
                          <Image
                            src={listing.seller.avatar_url}
                            alt={listing.seller.display_name || listing.seller.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-gray-500">
                            {(listing.seller.display_name || listing.seller.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 group-hover/seller:text-black transition-colors">
                        {listing.seller.display_name || listing.seller.username}
                        {listing.seller.city && (
                          <span className="text-gray-400"> · {listing.seller.city}</span>
                        )}
                      </span>
                    </Link>
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
