import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/profile-actions';
import { getSellerListings } from '@/lib/supabase/listing-actions';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { MyListings } from '@/components/dashboard/MyListings';

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/signup');
  }

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get profile
  const profileResult = await getProfile();

  if (profileResult.error || !profileResult.profile) {
    redirect('/login');
  }

  const profile = profileResult.profile;

  // If onboarding not completed, redirect to onboarding
  if (!profile.onboarding_completed) {
    redirect('/onboarding');
  }

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 6;

    if (profile.avatar_url) completed++;
    if (profile.display_name) completed++;
    if (profile.username) completed++;
    if (profile.bio) completed++;
    if (profile.city) completed++;
    if (profile.postcode) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isProfileComplete = completionPercentage === 100;

  // Get seller listings
  const listingsResult = await getSellerListings();
  const listings = listingsResult.listings || [];
  const totalListings = listings.length;
  const publishedListings = listings.filter((l) => l.status === 'published').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">
              Welcome, {profile.display_name || 'Seller'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your listings
            </p>
          </div>

          {/* Profile Completion Card */}
          {!isProfileComplete && (
            <ProfileCompletionCard
              percentage={completionPercentage}
              profile={profile}
            />
          )}

          {/* Stats Cards */}
          <StatsCards
            totalListings={publishedListings}
            totalSales={profile.total_sales || 0}
            profileViews={profile.profile_views || 0}
            rating={profile.rating || 0}
          />

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">My Listings</h2>
            <div className="flex gap-2">
              <Link href="/marketplace" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Browse</span>
                  <span className="sm:hidden">Marketplace</span>
                </Button>
              </Link>
              <Link href="/sell" className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Sell
                </Button>
              </Link>
            </div>
          </div>

          {/* My Listings */}
          <MyListings listings={listings} />
        </div>
      </main>
    </div>
  );
}
