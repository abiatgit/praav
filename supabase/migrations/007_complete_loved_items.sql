-- Complete loved_items setup (safe to re-run)
-- This handles cases where the migration was partially applied

-- Create loved_items table (IF NOT EXISTS makes it safe to re-run)
CREATE TABLE IF NOT EXISTS public.loved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_loved_item UNIQUE (user_id, listing_id)
);

-- Create indexes (IF NOT EXISTS makes it safe to re-run)
CREATE INDEX IF NOT EXISTS idx_loved_items_user_id ON public.loved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_listing_id ON public.loved_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_created_at ON public.loved_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.loved_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can create their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can delete their own loved items" ON public.loved_items;

-- Create policies
CREATE POLICY "Users can view their own loved items"
  ON public.loved_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loved items"
  ON public.loved_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loved items"
  ON public.loved_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace helper functions
CREATE OR REPLACE FUNCTION public.get_loved_items_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.loved_items
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_listing_loved(user_uuid UUID, listing_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.loved_items
    WHERE user_id = user_uuid
    AND listing_id = listing_uuid
  );
$$;
