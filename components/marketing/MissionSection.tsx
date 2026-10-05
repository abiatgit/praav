import { Container } from '@/components/shared/Container';

export function MissionSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-8 md:mb-12 leading-tight">
            Keeping beautiful clothing in use for longer
          </h2>
          <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed">
            <p>
              Indian ethnic clothing is often worn only a handful of times, especially wedding and
              occasion wear. Beautiful outfits sit unused in wardrobes across the UK.
            </p>
            <p>
              Our marketplace helps keep these stunning pieces in circulation for longer, giving
              buyers access to unique, quality fashion and sellers a way to recover value from
              items they no longer wear.
            </p>
            <p>
              We're building a trusted community where people can confidently buy and sell
              pre-loved Indian ethnic wear across the UK.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
