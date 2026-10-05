import { Container } from '@/components/shared/Container';
import { Heart, PoundSterling, Sparkles, MapPin } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Pre-loved, not forgotten',
    description: 'Give beautiful outfits another occasion.',
  },
  {
    icon: PoundSterling,
    title: 'Buy for less',
    description: 'Discover quality Indian ethnic wear at more accessible prices.',
  },
  {
    icon: Sparkles,
    title: 'Sell what you no longer wear',
    description: 'Turn unused outfits into money.',
  },
  {
    icon: MapPin,
    title: 'Built for the UK community',
    description: 'A marketplace created specifically for people buying and selling Indian ethnic fashion in the UK.',
  },
];

export function ValuePropositionSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="text-center">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center text-black">
                  <Icon className="h-6 w-6 stroke-[1.5]" />
                </div>
                <h3 className="font-medium mb-2 text-base tracking-wide">{value.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
