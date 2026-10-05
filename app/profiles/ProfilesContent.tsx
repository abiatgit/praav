'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Users as UsersIcon, Heart, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SellerProfileCard } from '@/components/profiles/SellerProfileCard';
import { CartIcon } from '@/components/cart/CartIcon';
import type { SellerProfile } from '@/lib/supabase/seller-discovery-actions';

interface ProfilesContentProps {
  sellers: SellerProfile[];
  initialSearch: string;
  followingUserIds: Set<string>;
}

export function ProfilesContent({ sellers, initialSearch, followingUserIds }: ProfilesContentProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }
    router.push(`/profiles${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearSearch = () => {
    setSearchValue('');
    router.push('/profiles');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">SELLERS</div>
          <div className="flex-1 md:flex-none text-center">DISCOVER SELLERS ACROSS THE UK</div>
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
                  placeholder="Search sellers..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
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
              placeholder="Search sellers..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-none h-9 text-sm"
            />
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4 text-xs tracking-widest overflow-x-auto">
            <Link href="/marketplace" className="hover:text-gray-600 transition-colors whitespace-nowrap">MARKETPLACE</Link>
            <Link href="/profiles" className="text-black font-medium whitespace-nowrap">SELLERS</Link>
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

      {/* Results Count */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600">
            {sellers.length} seller{sellers.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {sellers.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6">
              <UsersIcon className="h-12 w-12 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-light tracking-wide mb-3">
              {searchValue ? 'NO SELLERS FOUND' : 'NO SELLERS YET'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchValue
                ? 'Try adjusting your search or browse all sellers'
                : 'Be the first to list items and become a seller!'}
            </p>
            {searchValue && (
              <Button onClick={clearSearch} className="rounded-none h-12 px-8 text-sm tracking-wider bg-black hover:bg-gray-800 text-white">
                CLEAR SEARCH
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellers.map((seller) => (
              <SellerProfileCard
                key={seller.user_id}
                seller={seller}
                isFollowing={followingUserIds.has(seller.user_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
