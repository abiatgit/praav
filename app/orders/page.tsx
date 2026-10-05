import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Heart, User, Plus } from 'lucide-react';
import { getBuyerOrders } from '@/lib/supabase/order-actions';
import { CartIcon } from '@/components/cart/CartIcon';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/orders');
  }

  const { orders, error } = await getBuyerOrders();

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">MY PURCHASES</div>
          <div className="flex-1 md:flex-none text-center">YOUR ORDERS</div>
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
            <Link href="/orders" className="text-black font-medium whitespace-nowrap">ORDERS</Link>
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

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-light tracking-wide">MY PURCHASES</h1>
          {orders.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
          )}
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-light tracking-wide mb-3">NO ORDERS YET</h3>
            <p className="text-gray-600 mb-8">Start shopping to see your purchases here</p>
            <Link href="/marketplace">
              <Button className="rounded-none h-12 px-8 text-xs tracking-wider bg-black hover:bg-gray-800 text-white">
                BROWSE MARKETPLACE
              </Button>
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const coverImage = order.listing?.images?.find((img: any) => img.is_cover) || order.listing?.images?.[0];

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
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
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-medium line-clamp-1">{order.listing.title}</h3>
                        <p className="font-medium whitespace-nowrap">£{order.amount.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>Seller: {order.seller.display_name || order.seller.username}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                          {order.payment_status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
