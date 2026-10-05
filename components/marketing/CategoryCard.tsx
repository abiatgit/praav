import { Card } from '@/components/ui/card';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const categoryEmojis: Record<string, string> = {
  'sarees': '🥻',
  'lehengas': '👘',
  'salwar-kameez': '👗',
  'anarkali': '💃',
  'kurtas-kurtis': '👔',
  'sherwanis': '🤵',
  'kidswear': '👶',
  'accessories': '💍',
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  const emoji = categoryEmojis[category.slug] || '👗';

  return (
    <Card className={cn(
      'overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:scale-105',
      className
    )}>
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
          {emoji}
        </div>
        <h3 className="font-semibold text-lg text-center">{category.name}</h3>
      </div>
    </Card>
  );
}
