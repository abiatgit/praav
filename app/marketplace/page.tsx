import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth-actions';
import { browseListings, getBrowseCategories, getTotalListingsCount } from '@/lib/supabase/browse-actions';
import { getLovedListingIds } from '@/lib/supabase/loved-actions';
import MarketplaceContent from './MarketplaceContent';

export const metadata = {
  title: 'Marketplace | praav.uk',
  description: 'Browse pre-loved Indian ethnic fashion',
};

interface MarketplacePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sizes?: string;
    minPrice?: string;
    maxPrice?: string;
    conditions?: string;
    colours?: string;
    fabrics?: string;
    occasions?: string;
    locations?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  // Check authentication
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;

  // Parse filters from URL
  const filters = {
    query: params.q,
    category: params.category,
    sizes: params.sizes?.split(',').filter(Boolean),
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    conditions: params.conditions?.split(',').filter(Boolean),
    colours: params.colours?.split(',').filter(Boolean),
    fabrics: params.fabrics?.split(',').filter(Boolean),
    occasions: params.occasions?.split(',').filter(Boolean),
    locations: params.locations?.split(',').filter(Boolean),
    sortBy: (params.sort as 'recommended' | 'newest' | 'price_low' | 'price_high') || 'recommended',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 24,
    excludeUserId: user.id, // Exclude user's own listings
  };

  // Fetch data in parallel
  const [{ listings, total, totalPages }, { categories }, { count: totalCount }, { listingIds: lovedListingIds }] = await Promise.all([
    browseListings(filters),
    getBrowseCategories(),
    getTotalListingsCount(),
    getLovedListingIds(),
  ]);

  return (
    <MarketplaceContent
      initialListings={listings}
      initialTotal={total}
      initialPage={filters.page}
      totalPages={totalPages}
      categories={categories}
      totalCount={totalCount}
      initialFilters={filters}
      lovedListingIds={lovedListingIds}
    />
  );
}
