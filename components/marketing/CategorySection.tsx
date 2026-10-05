import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { CategoryCard } from './CategoryCard';
import { CATEGORIES } from '@/lib/constants/categories';

export function CategorySection() {
  return (
    <Section>
      <SectionHeading
        title="Shop by category"
        subtitle="Explore our curated collection of pre-loved Indian ethnic fashion"
        centered
        className="mx-auto"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}
