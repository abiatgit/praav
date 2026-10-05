'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Lock, AlertCircle } from 'lucide-react';
import { reserveListing, createCheckoutSession, releaseReservation } from '@/lib/supabase/order-actions';
import { LISTING_CONDITIONS } from '@/lib/types/listing';

interface CheckoutContentProps {
  listing: any;
  userId: string;
  cancelled: boolean;
}

export default function CheckoutContent({ listing, userId, cancelled }: CheckoutContentProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  const condition = LISTING_CONDITIONS.find((c) => c.value === listing.condition);
  const coverImage = listing.images?.find((img: any) => img.is_cover) || listing.images?.[0];

  // Reserve the listing on mount
  useEffect(() => {
    const reserve = async () => {
      const result = await reserveListing(listing.id);
      if (result.success) {
        setIsReserved(true);
      } else {
        setError(result.error || 'Failed to reserve listing');
      }
    };

    reserve();

    // Release reservation on unmount
    return () => {
      if (isReserved) {
        releaseReservation(listing.id);
      }
    };
  }, [listing.id]);

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createCheckoutSession(listing.id);

      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await import('@stripe/stripe-js').then((mod) =>
          mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        );

        if (stripe) {
          const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: result.sessionId,
          });

          if (stripeError) {
            setError(stripeError.message || 'Failed to redirect to checkout');
            setIsProcessing(false);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/listing/${listing.id}`} className="flex items-center gap-2 text-sm hover:text-gray-600">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to listing</span>
            </Link>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-wider mb-8">CHECKOUT</h1>

        {/* Cancelled Notice */}
        {cancelled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Payment was cancelled. Your item is still available.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div>
            <h2 className="text-sm font-medium tracking-wider mb-4">ORDER SUMMARY</h2>

            <div className="border border-gray-200 p-4">
              <div className="flex gap-4 mb-4">
                {coverImage && (
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                    <Image
                      src={coverImage.image_url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 line-clamp-2">{listing.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {listing.size && <p>Size: {listing.size}</p>}
                    <p>{condition?.label}</p>
                    <p>{listing.category.name}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item price</span>
                    <span className="font-medium">£{listing.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-sm">To be arranged</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-lg font-medium">
                  <span>TOTAL</span>
                  <span>£{listing.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info & Payment */}
          <div>
            <h2 className="text-sm font-medium tracking-wider mb-4">SELLER</h2>

            <div className="border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {listing.seller.avatar_url ? (
                    <Image
                      src={listing.seller.avatar_url}
                      alt={listing.seller.display_name || listing.seller.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-500">
                      {(listing.seller.display_name || listing.seller.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{listing.seller.display_name || listing.seller.username}</p>
                  <p className="text-sm text-gray-500">@{listing.seller.username}</p>
                  {listing.seller.city && (
                    <p className="text-sm text-gray-500">{listing.seller.city}</p>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-sm font-medium tracking-wider mb-4">PAYMENT</h2>

            <div className="border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-6 text-sm text-gray-600">
                <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Your payment is secure. You will be redirected to Stripe to complete your purchase.
                  Your card details are never stored on our servers.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider h-12"
                onClick={handleProceedToPayment}
                disabled={isProcessing || !isReserved || !!error}
              >
                {isProcessing ? 'PROCESSING...' : 'PROCEED TO SECURE PAYMENT'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this purchase, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
