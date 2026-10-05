-- Create orders table for marketplace transactions
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',

  -- Order status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'disputed'
  )),

  -- Payment status
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  )),

  -- Stripe references
  stripe_checkout_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT buyer_not_seller CHECK (buyer_id != seller_id),
  CONSTRAINT unique_stripe_session UNIQUE (stripe_checkout_session_id)
);

-- Create indexes for performance
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_listing_id ON public.orders(listing_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_stripe_checkout_session_id ON public.orders(stripe_checkout_session_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view orders for their listings
CREATE POLICY "Sellers can view orders for their listings"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Only authenticated users can create orders (enforced by server)
CREATE POLICY "Authenticated users can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Add comment
COMMENT ON TABLE public.orders IS 'Marketplace orders and transactions';
