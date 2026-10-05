'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/Container';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/components/providers/AuthProvider';

const navLinks = [
  { href: '/browse', label: 'BROWSE' },
];

export function Navbar() {
  const { user, loading } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  // Authenticated user actions
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-xs tracking-wider">
                        DASHBOARD
                      </Button>
                    </Link>
                    <Link href="/sell">
                      <Button size="sm" className="h-9 px-4 rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider">
                        SELL
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Unauthenticated user actions
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-xs tracking-wider">
                        LOG IN
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="h-9 px-4 rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider">
                        SIGN UP
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left tracking-wide">MENU</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm tracking-widest font-medium hover:text-gray-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                  {!loading && (
                    <>
                      {user ? (
                        // Authenticated user mobile actions
                        <>
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full rounded-none text-xs tracking-wider">
                              DASHBOARD
                            </Button>
                          </Link>
                          <Link href="/sell">
                            <Button className="w-full rounded-none bg-black hover:bg-gray-800 text-xs tracking-wider">
                              SELL
                            </Button>
                          </Link>
                        </>
                      ) : (
                        // Unauthenticated user mobile actions
                        <>
                          <Link href="/login">
                            <Button variant="outline" className="w-full rounded-none text-xs tracking-wider">
                              LOG IN
                            </Button>
                          </Link>
                          <Link href="/signup">
                            <Button className="w-full rounded-none bg-black hover:bg-gray-800 text-xs tracking-wider">
                              SIGN UP
                            </Button>
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
