'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Card className={cn('overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow', className)}>
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">👗</div>
            <div className="text-sm">{product.category}</div>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background z-10"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-semibold text-base line-clamp-2 mb-2">{product.title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{product.size}</span>
          <span>•</span>
          <span>{product.condition}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">£{product.price}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{product.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
