import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/constants/mockProducts';

export function FeaturedProductsSection() {
  return (
    <Section>
      <SectionHeading
        title="Beautiful pieces, waiting for their next occasion"
        subtitle="Explore our collection of pre-loved Indian ethnic wear"
        centered
        className="mx-auto"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
