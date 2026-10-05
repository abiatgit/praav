'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cart-context';
import { CartDrawer } from './CartDrawer';

export function CartIcon() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 relative"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingBag className="h-4 w-4" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </Button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
