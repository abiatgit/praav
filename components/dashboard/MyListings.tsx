'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Sparkles, Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteListing } from '@/lib/supabase/listing-actions';
import type { ListingWithImages } from '@/lib/types/listing';

interface MyListingsProps {
  listings: ListingWithImages[];
}

export function MyListings({ listings }: MyListingsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const hasListings = listings && listings.length > 0;

  const handleDelete = async (listingId: string, listingTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listingTitle}"?\n\nThis action cannot be undone and will permanently delete the listing and all associated images.`
    );

    if (!confirmed) return;

    setDeletingId(listingId);
    const result = await deleteListing(listingId);

    if (result.error) {
      alert('Failed to delete listing: ' + result.error);
    } else {
      router.refresh();
    }

    setDeletingId(null);
  };

  if (!hasListings) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold mb-1">No listings yet</h3>

          <p className="text-sm text-muted-foreground mb-4">
            Start selling by creating your first listing
          </p>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/sell" className="w-full sm:w-auto">
              <Button size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </Link>
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Browse
              </Button>
            </Link>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 w-full">
            <h4 className="font-medium text-xs mb-1.5 text-accent">
              Quick tips:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-0.5 text-left">
              <li>• Clear photos</li>
              <li>• Detailed descriptions</li>
              <li>• Competitive pricing</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'sold':
        return <Badge variant="outline">Sold</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {listings.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {listings.map((listing) => {
          const coverImage = listing.images.find((img) => img.is_cover) || listing.images[0];

          return (
            <div
              key={listing.id}
              className="group rounded-lg border bg-card overflow-hidden"
            >
              {/* Image */}
              <Link href={`/listing/${listing.id}`} className="block">
                <div className="relative aspect-square bg-muted">
                  {coverImage && (
                    <Image
                      src={coverImage.image_url}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute top-1.5 right-1.5">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>
              </Link>

              {/* Details */}
              <div className="p-2.5 sm:p-3 space-y-2">
                <div>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="text-sm font-semibold line-clamp-1 hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-base font-bold text-primary mt-0.5">
                    £{listing.price.toFixed(2)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <Link href={`/listing/${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs px-2">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/listing/${listing.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs px-2">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(listing.id, listing.title)}
                    disabled={deletingId === listing.id}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
