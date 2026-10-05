import type { Metadata } from 'next';
import { browseListings, getBrowseCategories, getTotalListingsCount } from '@/lib/supabase/browse-actions';
import BrowseContent from './BrowseContent';

export const metadata: Metadata = {
  title: 'Browse Pre-Loved Indian Ethnic Wear in the UK | praav',
  description:
    'Discover pre-loved sarees, lehengas, salwar kameez, sherwanis and more from sellers across the UK. Shop beautiful Indian ethnic fashion at great prices.',
  keywords: [
    'Indian ethnic wear UK',
    'pre-loved sarees',
    'second hand lehengas',
    'buy salwar kameez online',
    'Indian fashion marketplace',
    'ethnic wear resale',
  ],
};

interface BrowsePageProps {
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

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
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
  };

  // Fetch data in parallel
  const [{ listings, total, totalPages }, { categories }, { count: totalCount }] = await Promise.all([
    browseListings(filters),
    getBrowseCategories(),
    getTotalListingsCount(),
  ]);

  return (
    <BrowseContent
      initialListings={listings}
      initialTotal={total}
      initialPage={filters.page}
      totalPages={totalPages}
      categories={categories}
      totalCount={totalCount}
      initialFilters={filters}
    />
  );
}
