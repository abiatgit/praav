-- ============================================
-- OPTION 1: Just verify everything is set up
-- Run this first to check current state
-- ============================================

-- Check if table exists
SELECT
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'loved_items'
  ) as "loved_items_table_exists";

-- Check policies
SELECT count(*) as "policy_count",
       string_agg(policyname, ', ') as "policies"
FROM pg_policies
WHERE tablename = 'loved_items';

-- Check functions
SELECT count(*) as "function_count",
       string_agg(routine_name, ', ') as "functions"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_loved_items_count', 'is_listing_loved');

-- If everything shows up, you're good to go!
-- Expected results:
-- loved_items_table_exists: true
-- policy_count: 3
-- function_count: 2


-- ============================================
-- OPTION 2: If something is missing, run this
-- This drops everything and recreates it
-- ============================================

-- Uncomment below to drop and recreate everything:

/*
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can create their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can delete their own loved items" ON public.loved_items;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.get_loved_items_count(UUID);
DROP FUNCTION IF EXISTS public.is_listing_loved(UUID, UUID);

-- Drop table if it exists (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS public.loved_items CASCADE;

-- Now run the full migration again:

-- Create loved_items table
CREATE TABLE IF NOT EXISTS public.loved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_loved_item UNIQUE (user_id, listing_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loved_items_user_id ON public.loved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_listing_id ON public.loved_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_created_at ON public.loved_items(created_at DESC);

-- Enable RLS
ALTER TABLE public.loved_items ENABLE ROW LEVEL SECURITY;

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

-- Create helper functions
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
*/
