'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/marketing/Navbar';
import { HeroSection } from '@/components/marketing/HeroSection';
import { BrowsePreviewSection } from '@/components/marketing/BrowsePreviewSection';
import { ValuePropositionSection } from '@/components/marketing/ValuePropositionSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { SellerCTASection } from '@/components/marketing/SellerCTASection';
import { MissionSection } from '@/components/marketing/MissionSection';
import { NewsletterSection } from '@/components/marketing/NewsletterSection';
import { Footer } from '@/components/marketing/Footer';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to marketplace
    if (!loading && user) {
      router.push('/marketplace');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render landing page if user is authenticated (redirect will happen)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BrowsePreviewSection />
        <ValuePropositionSection />
        <HowItWorksSection />
        <SellerCTASection />
        <MissionSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
