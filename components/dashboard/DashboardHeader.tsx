import Link from 'next/link';
import Image from 'next/image';
import { User, Settings, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase/auth-actions';

interface DashboardHeaderProps {
  profile: {
    avatar_url?: string | null;
    display_name?: string | null;
    username?: string | null;
  };
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8">
            <Image
              src="/praavlogo.png"
              alt="Praav Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-xl">praav</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l">
            <Link
              href={`/@${profile.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted border">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden md:inline">
                {profile.display_name}
              </span>
            </Link>

            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
