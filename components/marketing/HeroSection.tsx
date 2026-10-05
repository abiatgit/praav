import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/Container';

export function HeroSection() {
  return (
    <section
      className="relative min-h-[calc(100svh-3.5rem)] md:min-h-[calc(100svh-4rem)] flex items-center bg-gradient-to-b from-muted/30 to-background"
      style={{
        paddingTop: 'clamp(1.25rem, 3vh, 2.5rem)',
        paddingBottom: 'clamp(1.25rem, 3vh, 2.5rem)',
      }}
    >
      <Container className="w-full">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Content */}
          <div className="text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6">
            <h1
              className="font-bold tracking-tight leading-[1.1]"
              style={{
                fontSize: 'clamp(2rem, 5vw + 0.5rem, 3.5rem)',
              }}
            >
              Give your Indian ethnic wear a{' '}
              <span className="text-accent">second life</span>
            </h1>
            <p
              className="text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.5vw + 0.25rem, 1.25rem)',
              }}
            >
              Buy and sell beautiful pre-loved Indian ethnic wear across the UK from sarees and lehengas to sherwanis and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link href="/browse" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[44px] px-6 rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider">
                  BROWSE COLLECTION
                </Button>
              </Link>
              <Link href="/sell" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[44px] px-6 rounded-none border-black hover:bg-black hover:text-white text-xs tracking-wider">
                  SELL YOUR ETHNIC WEAR
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Area */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{
              aspectRatio: '4 / 5',
              maxHeight: 'min(600px, 60vh)',
            }}
          >
            <Image
              src="/hero-saree.png"
              alt="Golden hour saree portrait at Tower Bridge - Beautiful Indian ethnic fashion"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </Container>
    </section>
  );
}
