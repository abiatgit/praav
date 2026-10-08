import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { stripe } from '@/lib/stripe';

export default async function CheckoutSuccessPage({ searchParams }: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (!session_id) {
    redirect('/marketplace');
  }

  // Get the session from Stripe to verify it's real
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (error) {
    redirect('/marketplace');
  }

  // Get the order details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        size,
        condition,
        images:listing_images(id, image_url, is_cover),
        category:categories(id, name)
      ),
      seller:profiles!seller_id(user_id, username, display_name, avatar_url, city)
    `)
    .eq('stripe_checkout_session_id', session_id)
    .eq('buyer_id', user.id)
    .single();

  if (!order) {
    redirect('/marketplace');
  }

  const coverImage = order.listing.images?.find((img: any) => img.is_cover) || order.listing.images?.[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 mx-auto w-fit">
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
      </header>

      {/* Success Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wider mb-2">Thank you for your purchase!</h1>
          <p className="text-gray-600 mb-2">Your order has been successfully placed.</p>
          <p className="text-sm text-gray-500">Thank you for choosing pre-loved fashion with Praav.</p>
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-medium tracking-wider mb-4">ORDER CONFIRMATION</h2>

          <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
            {coverImage && (
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                <Image
                  src={coverImage.image_url}
                  alt={order.listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-2">{order.listing.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {order.listing.size && <p>Size: {order.listing.size}</p>}
                <p>{order.listing.category.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">£{order.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seller</span>
              <span>{order.seller.display_name || order.seller.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status === 'paid' ? 'Paid' : 'Processing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span>{new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="font-medium mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• A payment receipt has been sent to your email address</li>
            <li>• You will receive a confirmation email shortly</li>
            <li>• The seller has been notified of your purchase</li>
            <li>• Arrange delivery details with the seller</li>
            <li>• You can view this order anytime in your orders page</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-1 rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider h-12"
            asChild
          >
            <Link href="/orders">VIEW MY ORDERS</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-none border-gray-300 text-xs tracking-wider h-12"
            asChild
          >
            <Link href="/marketplace">CONTINUE SHOPPING</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
