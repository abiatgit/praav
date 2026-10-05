'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/Container';
import { browseListings } from '@/lib/supabase/browse-actions';
import type { ListingWithDetails } from '@/lib/types/listing';
import { Heart } from 'lucide-react';

const CONDITION_OPTIONS = [
  { value: 'new_with_tags', label: 'New with Tags' },
  { value: 'new_without_tags', label: 'New without Tags' },
  { value: 'excellent', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export function BrowsePreviewSection() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const { listings: data } = await browseListings({
          sortBy: 'newest',
          limit: 8,
        });
        setListings(data);
      } catch (error) {
        console.error('Failed to fetch preview listings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center text-gray-500">Loading...</div>
        </Container>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-4">
            EXPLORE PRE-LOVED
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover unique Indian ethnic wear from sellers across the UK
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
          {listings.map((listing) => {
            const coverImage = listing.images?.find((img) => img.is_cover) || listing.images?.[0];
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
                  {/* Heart overlay - not functional on homepage */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                      <Heart className="h-4 w-4 text-gray-700" />
                    </div>
                  </div>
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

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/browse">
            <Button
              size="lg"
              variant="outline"
              className="rounded-none h-12 px-8 text-xs tracking-wider border-black hover:bg-black hover:text-white transition-colors"
            >
              VIEW ALL ITEMS
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
