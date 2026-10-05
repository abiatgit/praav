'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users as UsersIcon, Heart, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/cart/CartIcon';

interface Follower {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
  profile_visibility: string;
}

interface FollowersContentProps {
  users: Follower[];
}

export function FollowersContent({ users }: FollowersContentProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider">
          <div className="hidden md:block">FOLLOWERS</div>
          <div className="flex-1 md:flex-none text-center">YOUR FOLLOWER COMMUNITY</div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left - Empty on this page */}
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
            <Link href="/followers" className="text-black font-medium whitespace-nowrap">FOLLOWERS</Link>
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
      {users.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-sm text-gray-600">
              {users.length} follower{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {users.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center mb-6">
              <UsersIcon className="h-12 w-12 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-light tracking-wide mb-3">NO FOLLOWERS YET</h3>
            <p className="text-gray-600 mb-8">
              Share your profile to get more followers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=random`;

              return (
                <Link
                  key={user.user_id}
                  href={`/@${user.username}`}
                  className="group"
                >
                  <div className="border border-gray-200 bg-white hover:shadow-md transition-all p-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={avatarUrl}
                          alt={user.display_name || user.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors truncate">
                          {user.display_name || user.username}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                      </div>
                    </div>
                    {/* City */}
                    {user.city && (
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-400">·</span> {user.city}
                      </p>
                    )}
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
