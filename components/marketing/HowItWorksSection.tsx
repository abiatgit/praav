import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
import { Upload, Search, ShoppingBag } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'List your outfit',
    description: 'Upload photos and add basic information.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Find your buyer',
    description: 'People across the UK discover your item.',
  },
  {
    number: '03',
    icon: ShoppingBag,
    title: 'Sell securely',
    description: 'Complete the sale and arrange delivery.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Start selling your pre-loved Indian ethnic wear in three simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-12 md:mb-16 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center text-black">
                  <Icon className="h-7 w-7 stroke-[1.5]" />
                </div>
                <div className="text-xs tracking-widest text-gray-400 mb-3">{step.number}</div>
                <h3 className="font-medium text-lg mb-3 tracking-wide">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/sell">
            <Button
              size="lg"
              className="rounded-none h-12 px-8 text-xs tracking-wider bg-black hover:bg-gray-800 text-white"
            >
              START SELLING
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
