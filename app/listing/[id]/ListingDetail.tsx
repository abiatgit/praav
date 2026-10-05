'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LovedButton } from '@/components/loved/LovedButton';
import { CartIcon } from '@/components/cart/CartIcon';
import { useCart } from '@/lib/cart/cart-context';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Heart,
  User,
  Plus,
  Share2,
} from 'lucide-react';
import { LISTING_CONDITIONS } from '@/lib/types/listing';
import type { ListingWithDetails } from '@/lib/types/listing';

interface ListingDetailProps {
  listing: ListingWithDetails;
  initialIsLoved: boolean;
  currentUserId?: string;
}

export default function ListingDetail({ listing, initialIsLoved, currentUserId }: ListingDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const router = useRouter();
  const { addItem } = useCart();

  const condition = LISTING_CONDITIONS.find((c) => c.value === listing.condition);
  const currentImage = listing.images[currentImageIndex] || listing.images[0];

  // Check if current user is the seller
  const isOwnListing = currentUserId === listing.seller.user_id;
  const isSold = listing.status === 'sold';
  const isActive = listing.status === 'published';

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddToCart = () => {
    const coverImage = listing.images.find((img) => img.is_cover) || listing.images[0];
    addItem({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      size: listing.size,
      image: coverImage.image_url,
      sellerId: listing.seller.user_id,
      sellerName: listing.seller.display_name || listing.seller.username,
    });
  };

  const handleBuyNow = () => {
    // Redirect to checkout page for this listing
    router.push(`/checkout/${listing.id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.title} on PRAAV`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
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

            {/* Actions */}
            <div className="flex items-center gap-3">
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

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Link href="/" className="hover:text-black flex items-center gap-0.5">
              <Home className="h-3 w-3" />
              <span>home</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/marketplace" className="hover:text-black">marketplace</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/marketplace?category=${listing.category.id}`} className="hover:text-black">
              {listing.category.name.toLowerCase()}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-400 truncate max-w-[200px]">{listing.title.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-zoom-in">
              {currentImage && (
                <Image
                  src={currentImage.image_url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5">
                {listing.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden border transition-all ${
                      index === currentImageIndex
                        ? 'border-black border-2'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${listing.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-normal leading-tight">{listing.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <p className="text-2xl md:text-3xl font-normal">
                £{listing.price.toFixed(2)}
              </p>
              {listing.original_price && listing.original_price > listing.price && (
                <p className="text-base text-gray-400 line-through">
                  £{listing.original_price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Condition & Category */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-none border-black px-2 py-0.5 text-[10px] tracking-wide">
                {condition?.label.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="rounded-none border-gray-300 px-2 py-0.5 text-[10px] tracking-wide">
                {listing.category.name.toUpperCase()}
              </Badge>
            </div>

            {/* Size */}
            {listing.size && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">SIZE</label>
                <div className="flex gap-2">
                  <div className="border border-black px-3 py-1.5 text-xs font-medium">
                    {listing.size}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {isOwnListing ? (
                <div className="border border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">This is your listing</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-none text-[11px] tracking-wider h-9"
                    asChild
                  >
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      MANAGE LISTING
                    </Link>
                  </Button>
                </div>
              ) : isSold ? (
                <div className="border border-gray-300 p-4 text-center">
                  <p className="text-sm font-medium text-red-600">This item has been sold</p>
                </div>
              ) : !isActive ? (
                <div className="border border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-600">This item is not available</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-none bg-black hover:bg-gray-800 text-white text-[11px] tracking-wider h-9"
                      onClick={handleBuyNow}
                    >
                      BUY NOW
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-none border-gray-300 text-[11px] tracking-wider h-9 hover:bg-gray-50"
                      onClick={handleAddToCart}
                    >
                      ADD TO CART
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <LovedButton
                      listingId={listing.id}
                      initialIsLoved={initialIsLoved}
                      variant="button"
                      size="sm"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-none border-gray-300 text-[11px] tracking-wider h-9 hover:bg-gray-50"
                      onClick={handleShare}
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      SHARE
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-gray-200 pt-4 space-y-0 divide-y divide-gray-200">
              {/* Product Details */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium">Product Details</span>
                  {expandedSection === 'details' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSection === 'details' && (
                  <div className="mt-3 space-y-2 text-xs text-gray-700">
                    {listing.description && (
                      <p className="whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {listing.brand && (
                        <>
                          <span className="text-gray-500">Brand:</span>
                          <span className="font-medium">{listing.brand}</span>
                        </>
                      )}
                      {listing.colour && (
                        <>
                          <span className="text-gray-500">Colour:</span>
                          <span>{listing.colour}</span>
                        </>
                      )}
                      {listing.fabric && (
                        <>
                          <span className="text-gray-500">Fabric:</span>
                          <span>{listing.fabric}</span>
                        </>
                      )}
                      {listing.occasion && (
                        <>
                          <span className="text-gray-500">Occasion:</span>
                          <span>{listing.occasion}</span>
                        </>
                      )}
                      {listing.purchase_year && (
                        <>
                          <span className="text-gray-500">Purchase Year:</span>
                          <span>{listing.purchase_year}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Measurements */}
              {listing.measurement_unit && (listing.bust || listing.waist || listing.hip || listing.length || listing.sleeve_length) && (
                <div className="py-3">
                  <button
                    onClick={() => toggleSection('measurements')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium">Measurements ({listing.measurement_unit})</span>
                    {expandedSection === 'measurements' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSection === 'measurements' && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                      {listing.bust && (
                        <>
                          <span className="text-gray-500">Bust:</span>
                          <span>{listing.bust} {listing.measurement_unit}</span>
                        </>
                      )}
                      {listing.waist && (
                        <>
                          <span className="text-gray-500">Waist:</span>
                          <span>{listing.waist} {listing.measurement_unit}</span>
                        </>
                      )}
                      {listing.hip && (
                        <>
                          <span className="text-gray-500">Hip:</span>
                          <span>{listing.hip} {listing.measurement_unit}</span>
                        </>
                      )}
                      {listing.length && (
                        <>
                          <span className="text-gray-500">Length:</span>
                          <span>{listing.length} {listing.measurement_unit}</span>
                        </>
                      )}
                      {listing.sleeve_length && (
                        <>
                          <span className="text-gray-500">Sleeve:</span>
                          <span>{listing.sleeve_length} {listing.measurement_unit}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Condition & Wear */}
              {listing.damage_description && (
                <div className="py-3">
                  <button
                    onClick={() => toggleSection('condition')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium">Condition & Wear</span>
                    {expandedSection === 'condition' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSection === 'condition' && (
                    <div className="mt-3 text-xs text-gray-700">
                      <p className="leading-relaxed">{listing.damage_description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('seller')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium">Meet the Seller</span>
                  {expandedSection === 'seller' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSection === 'seller' && (
                  <Link
                    href={`/@${listing.seller.username}`}
                    className="mt-3 flex items-center gap-2.5 hover:bg-gray-50 p-2 -m-2 transition-colors group rounded"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                      {listing.seller.avatar_url ? (
                        <Image
                          src={listing.seller.avatar_url}
                          alt={listing.seller.display_name || listing.seller.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                          {(listing.seller.display_name || listing.seller.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:underline truncate">
                        {listing.seller.display_name || listing.seller.username}
                      </p>
                      <p className="text-xs text-gray-500">@{listing.seller.username}</p>
                      {listing.seller.city && (
                        <p className="text-xs text-gray-500">{listing.seller.city}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </Link>
                )}
              </div>
            </div>

            {/* Listed Date */}
            <p className="text-[10px] text-gray-500 text-center">
              Listed on {new Date(listing.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
