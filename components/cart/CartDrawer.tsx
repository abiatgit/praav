'use client';

import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-wider">
            YOUR CART ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6">
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/listing/${item.id}`}
                      onClick={onClose}
                      className="text-sm font-medium hover:text-gray-600 line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">by {item.sellerName}</p>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
                    )}
                    <p className="text-sm font-medium mt-2">£{item.price.toFixed(2)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">£{totalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full rounded-none bg-black hover:bg-gray-800 text-white text-xs tracking-wider h-12"
              asChild
            >
              <Link href="/checkout" onClick={onClose}>
                PROCEED TO CHECKOUT
              </Link>
            </Button>

            {/* Continue Shopping */}
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-none border-gray-300 text-xs tracking-wider h-12"
              onClick={onClose}
            >
              CONTINUE SHOPPING
            </Button>

            {/* Clear Cart */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
              className="w-full text-xs text-red-600 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
