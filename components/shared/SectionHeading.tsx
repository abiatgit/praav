import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  className,
  centered = false
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-8 md:mb-10 lg:mb-12', centered && 'text-center', className)}>
      <h2
        className="font-bold tracking-tight text-foreground"
        style={{
          fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 2.5rem)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-3 md:mt-4 text-muted-foreground max-w-2xl"
          style={{
            fontSize: 'clamp(1rem, 1.2vw + 0.25rem, 1.125rem)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
