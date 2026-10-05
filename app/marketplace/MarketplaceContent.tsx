'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, Package, Heart, User, ChevronDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LovedButton } from '@/components/loved/LovedButton';
import { CartIcon } from '@/components/cart/CartIcon';
import type { ListingWithDetails } from '@/lib/types/listing';
import type { BrowseFilters } from '@/lib/supabase/browse-actions';

// Filter options
const SIZE_OPTIONS = [
  'UK 4', 'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18', 'UK 20', 'UK 22', 'UK 24+',
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size', 'Custom'
];

const CONDITION_OPTIONS = [
  { value: 'new_with_tags', label: 'New with Tags' },
  { value: 'new_without_tags', label: 'New without Tags' },
  { value: 'excellent', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const COLOUR_OPTIONS = [
  'Red', 'Pink', 'Green', 'Blue', 'Gold', 'Silver', 'Black', 'White', 'Cream',
  'Orange', 'Yellow', 'Purple', 'Brown', 'Multicolour'
];

const FABRIC_OPTIONS = [
  'Silk', 'Cotton', 'Georgette', 'Chiffon', 'Velvet', 'Linen', 'Net', 'Satin', 'Other'
];

const OCCASION_OPTIONS = [
  'Wedding', 'Reception', 'Engagement', 'Diwali', 'Eid', 'Onam', 'Vishu', 'Party', 'Casual', 'Other'
];

const PRICE_RANGES = [
  { label: 'Under £25', min: 0, max: 25 },
  { label: '£25 - £50', min: 25, max: 50 },
  { label: '£50 - £100', min: 50, max: 100 },
  { label: '£100 - £200', min: 100, max: 200 },
  { label: '£200 - £500', min: 200, max: 500 },
  { label: '£500+', min: 500, max: undefined },
];

interface MarketplaceContentProps {
  initialListings: ListingWithDetails[];
  initialTotal: number;
  initialPage: number;
  totalPages: number;
  categories: Array<{ id: string; name: string; slug: string }>;
  totalCount: number;
  initialFilters: BrowseFilters;
  lovedListingIds: string[];
}

export default function MarketplaceContent({
  initialListings,
  initialTotal,
  initialPage,
  totalPages,
  categories,
  totalCount,
  initialFilters,
  lovedListingIds,
}: MarketplaceContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');

  // Build URL with filters
  const buildFilterUrl = (updates: Partial<BrowseFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...initialFilters, ...updates };

    Array.from(params.keys()).forEach((key) => params.delete(key));

    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.sizes && newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','));
    if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.conditions && newFilters.conditions.length > 0) params.set('conditions', newFilters.conditions.join(','));
    if (newFilters.colours && newFilters.colours.length > 0) params.set('colours', newFilters.colours.join(','));
    if (newFilters.fabrics && newFilters.fabrics.length > 0) params.set('fabrics', newFilters.fabrics.join(','));
    if (newFilters.occasions && newFilters.occasions.length > 0) params.set('occasions', newFilters.occasions.join(','));
    if (newFilters.locations && newFilters.locations.length > 0) params.set('locations', newFilters.locations.join(','));
    if (newFilters.sortBy && newFilters.sortBy !== 'recommended') params.set('sort', newFilters.sortBy);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());

    return `/marketplace?${params.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(buildFilterUrl({ query: searchQuery, page: 1 }));
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    startTransition(() => {
      router.push('/marketplace');
    });
  };

  const toggleFilter = (filterKey: keyof BrowseFilters, value: string) => {
    const currentValues = (initialFilters[filterKey] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    startTransition(() => {
      router.push(buildFilterUrl({ [filterKey]: newValues.length > 0 ? newValues : undefined, page: 1 }));
    });
  };

  const setFilter = (filterKey: keyof BrowseFilters, value: any) => {
    startTransition(() => {
      router.push(buildFilterUrl({ [filterKey]: value, page: 1 }));
    });
  };

  const removeFilterChip = (filterKey: keyof BrowseFilters, value?: string) => {
    if (value && Array.isArray(initialFilters[filterKey])) {
      const currentValues = initialFilters[filterKey] as string[];
      const newValues = currentValues.filter((v) => v !== value);
      startTransition(() => {
        router.push(buildFilterUrl({ [filterKey]: newValues.length > 0 ? newValues : undefined }));
      });
    } else {
      startTransition(() => {
        router.push(buildFilterUrl({ [filterKey]: undefined }));
      });
    }
  };

  const changePage = (newPage: number) => {
    startTransition(() => {
      router.push(buildFilterUrl({ page: newPage }));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (initialFilters.query) count++;
    if (initialFilters.category) count++;
    if (initialFilters.sizes && initialFilters.sizes.length > 0) count += initialFilters.sizes.length;
    if (initialFilters.minPrice !== undefined || initialFilters.maxPrice !== undefined) count++;
    if (initialFilters.conditions && initialFilters.conditions.length > 0) count += initialFilters.conditions.length;
    if (initialFilters.colours && initialFilters.colours.length > 0) count += initialFilters.colours.length;
    if (initialFilters.fabrics && initialFilters.fabrics.length > 0) count += initialFilters.fabrics.length;
    if (initialFilters.occasions && initialFilters.occasions.length > 0) count += initialFilters.occasions.length;
    if (initialFilters.locations && initialFilters.locations.length > 0) count += initialFilters.locations.length;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">MARKETPLACE</div>
          <div className="flex-1 md:flex-none text-center">DISCOVER PRE-LOVED INDIAN ETHNIC WEAR</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search ethnic wear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 rounded-none h-9 text-sm"
                />
              </form>
            </div>

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

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search ethnic wear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-none h-9 text-sm"
            />
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4 text-xs tracking-widest overflow-x-auto">
            <Link href="/marketplace" className="text-black font-medium whitespace-nowrap">MARKETPLACE</Link>
            <Link href="/profiles" className="hover:text-gray-600 transition-colors whitespace-nowrap">SELLERS</Link>
            <Link href="/loved" className="hover:text-gray-600 transition-colors whitespace-nowrap">SAVED</Link>
            <Link href="/followers" className="hover:text-gray-600 transition-colors whitespace-nowrap">FOLLOWERS</Link>
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

      {/* Results + Sort */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Showing {initialListings.length} of {totalCount} items
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Filters Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden rounded-none h-8 text-xs">
                    <SlidersHorizontal className="h-3 w-3 mr-2" />
                    FILTERS
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your search</SheetDescription>
                  </SheetHeader>
                  <FilterSidebar
                    categories={categories}
                    initialFilters={initialFilters}
                    toggleFilter={toggleFilter}
                    setFilter={setFilter}
                  />
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={initialFilters.sortBy || 'recommended'} onValueChange={(value) => setFilter('sortBy', value)}>
                <SelectTrigger className="w-[160px] h-8 rounded-none text-xs border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pb-2">
              {initialFilters.query && (
                <Badge variant="outline" className="gap-1 rounded-full">
                  {initialFilters.query}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('query')} />
                </Badge>
              )}
              {initialFilters.category && (
                <Badge variant="outline" className="gap-1 rounded-full">
                  {categories.find((c) => c.id === initialFilters.category)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('category')} />
                </Badge>
              )}
              {initialFilters.sizes?.map((size) => (
                <Badge key={size} variant="outline" className="gap-1 rounded-full">
                  {size}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('sizes', size)} />
                </Badge>
              ))}
              {(initialFilters.minPrice !== undefined || initialFilters.maxPrice !== undefined) && (
                <Badge variant="outline" className="gap-1 rounded-full">
                  £{initialFilters.minPrice || 0} - £{initialFilters.maxPrice || '∞'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    startTransition(() => {
                      router.push(buildFilterUrl({ minPrice: undefined, maxPrice: undefined }));
                    });
                  }} />
                </Badge>
              )}
              {initialFilters.conditions?.map((condition) => (
                <Badge key={condition} variant="outline" className="gap-1 rounded-full">
                  {CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('conditions', condition)} />
                </Badge>
              ))}
              {initialFilters.colours?.map((colour) => (
                <Badge key={colour} variant="outline" className="gap-1 rounded-full">
                  {colour}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('colours', colour)} />
                </Badge>
              ))}
              {initialFilters.fabrics?.map((fabric) => (
                <Badge key={fabric} variant="outline" className="gap-1 rounded-full">
                  {fabric}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('fabrics', fabric)} />
                </Badge>
              ))}
              {initialFilters.occasions?.map((occasion) => (
                <Badge key={occasion} variant="outline" className="gap-1 rounded-full">
                  {occasion}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilterChip('occasions', occasion)} />
                </Badge>
              ))}
              {activeFilterCount > 1 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <FilterPopover
              label="CATEGORY"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              selected={initialFilters.category ? [initialFilters.category] : []}
              onToggle={(value) => setFilter('category', initialFilters.category === value ? undefined : value)}
              single
            />
            <FilterPopover
              label="SIZE"
              options={SIZE_OPTIONS.map(s => ({ value: s, label: s }))}
              selected={initialFilters.sizes || []}
              onToggle={(value) => toggleFilter('sizes', value)}
            />
            <FilterPopover
              label="PRICE"
              options={PRICE_RANGES.map(r => ({ value: r.label, label: r.label, min: r.min, max: r.max }))}
              selected={initialFilters.minPrice !== undefined ? [`£${initialFilters.minPrice} - £${initialFilters.maxPrice || '∞'}`] : []}
              onToggle={(value, min, max) => {
                if (initialFilters.minPrice === min && initialFilters.maxPrice === max) {
                  setFilter('minPrice', undefined);
                  setFilter('maxPrice', undefined);
                } else {
                  setFilter('minPrice', min);
                  setFilter('maxPrice', max);
                }
              }}
              price
            />
            <FilterPopover
              label="CONDITION"
              options={CONDITION_OPTIONS.map(c => ({ value: c.value, label: c.label }))}
              selected={initialFilters.conditions || []}
              onToggle={(value) => toggleFilter('conditions', value)}
            />
            <FilterPopover
              label="COLOUR"
              options={COLOUR_OPTIONS.map(c => ({ value: c, label: c }))}
              selected={initialFilters.colours || []}
              onToggle={(value) => toggleFilter('colours', value)}
            />
            <FilterPopover
              label="FABRIC"
              options={FABRIC_OPTIONS.map(f => ({ value: f, label: f }))}
              selected={initialFilters.fabrics || []}
              onToggle={(value) => toggleFilter('fabrics', value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {isPending && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {!isPending && initialListings.length === 0 && (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6">
              <Package className="h-12 w-12 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-light tracking-wide mb-3">NO ITEMS FOUND</h3>
            <p className="text-gray-600 mb-8">
              {activeFilterCount > 0 ? 'Try adjusting your search or filters' : 'Be the first to list an item on the marketplace'}
            </p>
            {activeFilterCount > 0 ? (
              <Button onClick={clearFilters} className="rounded-none h-12 px-8 text-sm tracking-wider bg-black hover:bg-gray-800 text-white">
                CLEAR FILTERS
              </Button>
            ) : (
              <Link href="/sell">
                <Button className="rounded-none h-12 px-8 text-sm tracking-wider bg-black hover:bg-gray-800 text-white">
                  START SELLING
                </Button>
              </Link>
            )}
          </div>
        )}

        {!isPending && initialListings.length > 0 && (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {initialListings.map((listing) => {
                const coverImage = listing.images?.find((img) => img.is_cover) || listing.images?.[0];
                const isLoved = lovedListingIds.includes(listing.id);
                const conditionLabel = CONDITION_OPTIONS.find(c => c.value === listing.condition)?.label;

                return (
                  <div key={listing.id} className="group">
                    {/* Product Image */}
                    <Link
                      href={`/listing/${listing.id}`}
                      className="block relative aspect-[4/5] bg-gray-100 mb-3 overflow-hidden"
                    >
                      {coverImage && (
                        <Image
                          src={coverImage.image_url}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                      {/* Loved button overlay */}
                      <div className="absolute top-3 right-3 z-10">
                        <LovedButton
                          listingId={listing.id}
                          initialIsLoved={isLoved}
                          size="md"
                          variant="overlay"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <Link href={`/listing/${listing.id}`}>
                        <h3 className="text-sm font-normal text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors">
                          {listing.title}
                        </h3>
                      </Link>
                      <p className="text-base font-medium text-black">
                        £{listing.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {listing.size && <span>{listing.size}</span>}
                        {listing.size && listing.condition && <span>·</span>}
                        {listing.condition && (
                          <span className="capitalize">
                            {conditionLabel || listing.condition}
                          </span>
                        )}
                      </div>
                      {/* Seller info */}
                      <Link
                        href={`/@${listing.seller.username}`}
                        className="flex items-center gap-2 pt-1 group/seller"
                      >
                        <div className="relative h-5 w-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {listing.seller.avatar_url ? (
                            <Image
                              src={listing.seller.avatar_url}
                              alt={listing.seller.display_name || listing.seller.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-gray-500">
                              {(listing.seller.display_name || listing.seller.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 group-hover/seller:text-black transition-colors">
                          {listing.seller.display_name || listing.seller.username}
                          {listing.seller.city && (
                            <span className="text-gray-400"> · {listing.seller.city}</span>
                          )}
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={initialPage <= 1}
                  onClick={() => changePage(initialPage - 1)}
                  className="rounded-none h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  PREVIOUS
                </Button>
                <span className="text-sm text-gray-600">
                  Page {initialPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={initialPage >= totalPages}
                  onClick={() => changePage(initialPage + 1)}
                  className="rounded-none h-9"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Filter Popover Component
function FilterPopover({
  label,
  options,
  selected,
  onToggle,
  single = false,
  price = false,
}: {
  label: string;
  options: Array<{ value: string; label: string; min?: number; max?: number }>;
  selected: string[];
  onToggle: (value: string, min?: number, max?: number) => void;
  single?: boolean;
  price?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-none h-8 text-xs border-gray-300 hover:bg-gray-50">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-4 px-1">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${option.value}`}
                checked={single ? selected.includes(option.value) : selected.includes(option.value)}
                onCheckedChange={() => price ? onToggle(option.value, option.min, option.max) : onToggle(option.value)}
              />
              <label
                htmlFor={`filter-${option.value}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Filter Sidebar for Mobile
function FilterSidebar({
  categories,
  initialFilters,
  toggleFilter,
  setFilter,
}: {
  categories: Array<{ id: string; name: string; slug: string }>;
  initialFilters: BrowseFilters;
  toggleFilter: (filterKey: keyof BrowseFilters, value: string) => void;
  setFilter: (filterKey: keyof BrowseFilters, value: any) => void;
}) {
  return (
    <div className="space-y-6 mt-6">
      {/* Category */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">CATEGORY</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-mobile-${category.id}`}
                checked={initialFilters.category === category.id}
                onCheckedChange={() => setFilter('category', initialFilters.category === category.id ? undefined : category.id)}
              />
              <label htmlFor={`cat-mobile-${category.id}`} className="text-sm cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">SIZE</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {SIZE_OPTIONS.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-mobile-${size}`}
                checked={initialFilters.sizes?.includes(size) || false}
                onCheckedChange={() => toggleFilter('sizes', size)}
              />
              <label htmlFor={`size-mobile-${size}`} className="text-sm cursor-pointer">
                {size}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">PRICE</Label>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <div key={range.label} className="flex items-center space-x-2">
              <Checkbox
                id={`price-mobile-${range.label}`}
                checked={
                  initialFilters.minPrice === range.min &&
                  initialFilters.maxPrice === range.max
                }
                onCheckedChange={() => {
                  if (initialFilters.minPrice === range.min && initialFilters.maxPrice === range.max) {
                    setFilter('minPrice', undefined);
                    setFilter('maxPrice', undefined);
                  } else {
                    setFilter('minPrice', range.min);
                    setFilter('maxPrice', range.max);
                  }
                }}
              />
              <label htmlFor={`price-mobile-${range.label}`} className="text-sm cursor-pointer">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">CONDITION</Label>
        <div className="space-y-2">
          {CONDITION_OPTIONS.map((condition) => (
            <div key={condition.value} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-mobile-${condition.value}`}
                checked={initialFilters.conditions?.includes(condition.value) || false}
                onCheckedChange={() => toggleFilter('conditions', condition.value)}
              />
              <label htmlFor={`condition-mobile-${condition.value}`} className="text-sm cursor-pointer">
                {condition.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Colour */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">COLOUR</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {COLOUR_OPTIONS.map((colour) => (
            <div key={colour} className="flex items-center space-x-2">
              <Checkbox
                id={`colour-mobile-${colour}`}
                checked={initialFilters.colours?.includes(colour) || false}
                onCheckedChange={() => toggleFilter('colours', colour)}
              />
              <label htmlFor={`colour-mobile-${colour}`} className="text-sm cursor-pointer">
                {colour}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <Label className="text-xs font-semibold tracking-wider mb-3 block">FABRIC</Label>
        <div className="space-y-2">
          {FABRIC_OPTIONS.map((fabric) => (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox
                id={`fabric-mobile-${fabric}`}
                checked={initialFilters.fabrics?.includes(fabric) || false}
                onCheckedChange={() => toggleFilter('fabrics', fabric)}
              />
              <label htmlFor={`fabric-mobile-${fabric}`} className="text-sm cursor-pointer">
                {fabric}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
