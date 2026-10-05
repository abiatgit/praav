import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { getSellerOrders } from '@/lib/supabase/order-actions';
import { getProfile } from '@/lib/supabase/profile-actions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function SellerOrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/orders');
  }

  // Get profile
  const profileResult = await getProfile();

  if (profileResult.error || !profileResult.profile) {
    redirect('/login');
  }

  const profile = profileResult.profile;

  const { orders, error } = await getSellerOrders();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">My Sales</h1>
            {orders.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            )}
          </div>

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!error && orders.length === 0 && (
            <div className="text-center py-16 border rounded-lg bg-card">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">No Sales Yet</h3>
              <p className="text-muted-foreground mb-8">
                When someone purchases your items, they'll appear here
              </p>
              <Link href="/sell">
                <Button className="h-12 px-8">
                  Create Your First Listing
                </Button>
              </Link>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const coverImage = order.listing?.images?.find((img: any) => img.is_cover) || order.listing?.images?.[0];

                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="flex gap-4">
                      {coverImage && (
                        <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-1">{order.listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Buyer: {order.buyer.display_name || order.buyer.username}
                            </p>
                          </div>
                          <p className="font-medium whitespace-nowrap text-lg">£{order.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span>{new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}</span>
                          <span>•</span>
                          <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
