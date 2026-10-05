'use server';

import { createClient } from './server';
import type { ListingWithDetails } from '@/lib/types/listing';

// ============================================
// BROWSE FILTERS INTERFACE
// ============================================

export interface BrowseFilters {
  query?: string;
  category?: string;
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
  colours?: string[];
  fabrics?: string[];
  occasions?: string[];
  locations?: string[];
  sortBy?: 'recommended' | 'newest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
  excludeUserId?: string;
}

// ============================================
// BROWSE LISTINGS
// ============================================

export async function browseListings(filters: BrowseFilters = {}) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured', listings: [], total: 0 };
  }

  const {
    query,
    category,
    sizes,
    minPrice,
    maxPrice,
    conditions,
    colours,
    fabrics,
    occasions,
    locations,
    sortBy = 'recommended',
    page = 1,
    limit = 24,
    excludeUserId,
  } = filters;

  // Start building the query
  let listingsQuery = supabase
    .from('listings')
    .select(
      `
      *,
      images:listing_images(*),
      category:categories(id, name, slug),
      seller:profiles(user_id, username, display_name, avatar_url, city)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published');

  // Exclude user's own listings if excludeUserId is provided
  if (excludeUserId) {
    listingsQuery = listingsQuery.neq('seller_id', excludeUserId);
  }

  // Apply filters
  if (category) {
    listingsQuery = listingsQuery.eq('category_id', category);
  }

  if (minPrice !== undefined && minPrice >= 0) {
    listingsQuery = listingsQuery.gte('price', minPrice);
  }

  if (maxPrice !== undefined && maxPrice >= 0) {
    listingsQuery = listingsQuery.lte('price', maxPrice);
  }

  if (sizes && sizes.length > 0) {
    listingsQuery = listingsQuery.in('size', sizes);
  }

  if (conditions && conditions.length > 0) {
    listingsQuery = listingsQuery.in('condition', conditions);
  }

  if (colours && colours.length > 0) {
    listingsQuery = listingsQuery.in('colour', colours);
  }

  if (fabrics && fabrics.length > 0) {
    listingsQuery = listingsQuery.in('fabric', fabrics);
  }

  if (occasions && occasions.length > 0) {
    listingsQuery = listingsQuery.in('occasion', occasions);
  }

  // Apply search query (simple text search across multiple fields)
  if (query && query.trim()) {
    const searchTerm = `%${query.trim()}%`;
    listingsQuery = listingsQuery.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm},brand.ilike.${searchTerm},colour.ilike.${searchTerm},fabric.ilike.${searchTerm},occasion.ilike.${searchTerm}`
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      listingsQuery = listingsQuery.order('published_at', { ascending: false });
      break;
    case 'price_low':
      listingsQuery = listingsQuery.order('price', { ascending: true });
      break;
    case 'price_high':
      listingsQuery = listingsQuery.order('price', { ascending: false });
      break;
    case 'recommended':
    default:
      listingsQuery = listingsQuery.order('published_at', { ascending: false });
      break;
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  listingsQuery = listingsQuery.range(from, to);

  const { data: listings, error, count } = await listingsQuery;

  if (error) {
    console.error('Error fetching browse listings:', error);
    return { error: error.message, listings: [], total: 0 };
  }

  // Filter by location if needed (at application level since seller city is in joined table)
  let filteredListings = listings as unknown as ListingWithDetails[];

  if (locations && locations.length > 0) {
    filteredListings = filteredListings.filter((listing) =>
      locations.some((loc) =>
        listing.seller.city?.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  return {
    listings: filteredListings,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// ============================================
// GET CATEGORIES FOR FILTER
// ============================================

export async function getBrowseCategories() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Supabase is not configured', categories: [] };
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return { error: error.message, categories: [] };
  }

  return { categories };
}

// ============================================
// GET TOTAL COUNT
// ============================================

export async function getTotalListingsCount() {
  const supabase = await createClient();

  if (!supabase) {
    return { count: 0 };
  }

  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching total count:', error);
    return { count: 0 };
  }

  return { count: count || 0 };
}
