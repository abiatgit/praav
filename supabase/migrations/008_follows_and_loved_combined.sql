-- ============================================
-- COMBINED MIGRATION: Follows + Loved Items
-- Run this single file to set up both features
-- ============================================

-- ============================================
-- PART 1: FOLLOWS SYSTEM
-- ============================================

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- Enable RLS for follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles follow counts are viewable" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
DROP POLICY IF EXISTS "Users can view their own follows" ON public.follows;

-- Create RLS policies for follows
CREATE POLICY "Public profiles follow counts are viewable"
  ON public.follows
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id != following_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = following_id
      AND profiles.profile_visibility = 'public'
    )
  );

CREATE POLICY "Users can unfollow others"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can view their own follows"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Create helper functions for follows
CREATE OR REPLACE FUNCTION public.get_follower_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE following_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_following_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE follower_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = follower_uuid
    AND following_id = following_uuid
  );
$$;

-- ============================================
-- PART 2: LOVED ITEMS SYSTEM
-- ============================================

-- Create loved_items table
CREATE TABLE IF NOT EXISTS public.loved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicates
  CONSTRAINT unique_loved_item UNIQUE (user_id, listing_id)
);

-- Create indexes for loved_items
CREATE INDEX IF NOT EXISTS idx_loved_items_user_id ON public.loved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_listing_id ON public.loved_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_loved_items_created_at ON public.loved_items(created_at DESC);

-- Enable RLS for loved_items
ALTER TABLE public.loved_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can create their own loved items" ON public.loved_items;
DROP POLICY IF EXISTS "Users can delete their own loved items" ON public.loved_items;

-- Create RLS policies for loved_items
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

-- Create helper functions for loved_items
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
