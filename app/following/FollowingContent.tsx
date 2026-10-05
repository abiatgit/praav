'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users as UsersIcon, LayoutDashboard, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/profiles/FollowButton';

interface FollowingUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
  listingCount: number;
}

interface FollowingContentProps {
  users: FollowingUser[];
}

export function FollowingContent({ users }: FollowingContentProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Title and Navigation */}
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold">Following</h1>
              </div>
              <Link href="/marketplace" className="hidden md:block">
                <Button variant="ghost">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Marketplace
                </Button>
              </Link>
            </div>

            {/* Right side - Dashboard */}
            <Link href="/dashboard">
              <Button variant="outline">
                <LayoutDashboard className="mr-2 h-4 w-4 hidden sm:inline" />
                <span className="hidden sm:inline">Dashboard</span>
                <LayoutDashboard className="h-4 w-4 sm:hidden" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden mt-3 pt-3 border-t">
            <Link href="/marketplace" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                <UsersIcon className="mr-2 h-4 w-4" />
                Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Not following anyone yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Discover sellers and follow them to stay updated with their latest listings
            </p>
            <Link href="/profiles">
              <Button>
                Discover Sellers
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Following {users.length} seller{users.length !== 1 ? 's' : ''}
              </p>
              <Link href="/profiles">
                <Button variant="outline" size="sm">
                  Discover more
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => {
                const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=random`;

                return (
                  <div
                    key={user.user_id}
                    className="border rounded-lg bg-card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/@${user.username}`} className="block p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                          <Image
                            src={avatarUrl}
                            alt={user.display_name || user.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {user.display_name || user.username}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            @{user.username}
                          </p>
                          {user.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{user.city}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Package className="h-4 w-4" />
                        <span>{user.listingCount} listing{user.listingCount !== 1 ? 's' : ''}</span>
                      </div>
                    </Link>

                    <div className="px-6 pb-6">
                      <FollowButton
                        userId={user.user_id}
                        initialIsFollowing={true}
                        variant="outline"
                        size="default"
                        className="w-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
