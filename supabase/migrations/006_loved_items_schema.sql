-- Create loved_items table for wishlist/favorites functionality
CREATE TABLE IF NOT EXISTS public.loved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate loved items
  CONSTRAINT unique_loved_item UNIQUE (user_id, listing_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loved_items_user_id ON public.loved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_listing_id ON public.loved_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_created_at ON public.loved_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.loved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loved_items table

-- Policy: Users can view their own loved items
CREATE POLICY "Users can view their own loved items"
  ON public.loved_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own loved items
CREATE POLICY "Users can create their own loved items"
  ON public.loved_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own loved items
CREATE POLICY "Users can delete their own loved items"
  ON public.loved_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Helper function to get loved items count for a user
CREATE OR REPLACE FUNCTION public.get_loved_items_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.loved_items
  WHERE user_id = user_uuid;
$$;

-- Helper function to check if a user loves a specific listing
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
