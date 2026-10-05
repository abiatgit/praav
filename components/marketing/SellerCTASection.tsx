import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';

export function SellerCTASection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50 border-y border-gray-100">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-6 leading-tight">
            Your wardrobe might be someone else's perfect outfit
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
            List the Indian ethnic clothing you no longer wear and give them a new life.
          </p>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed">
            Listing is simple — upload photos, add a few details, and set your price.
          </p>
          <Link href="/sell">
            <Button
              size="lg"
              className="rounded-none h-12 px-8 text-xs tracking-wider bg-black hover:bg-gray-800 text-white border-2 border-black hover:border-gray-800"
            >
              SELL YOUR FIRST ITEM
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
