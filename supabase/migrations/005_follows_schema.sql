-- Create follows table for seller following functionality
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate follows
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),

  -- Constraint to prevent self-follows
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows table

-- Policy: Anyone can view follow relationships for public profiles
CREATE POLICY "Public profiles follow counts are viewable"
  ON public.follows
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = follows.following_id
      AND profiles.profile_visibility = 'public'
    )
  );

-- Policy: Authenticated users can follow others (insert)
CREATE POLICY "Users can follow others"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only create follows where they are the follower
    auth.uid() = follower_id
    -- Cannot follow themselves (also enforced by CHECK constraint)
    AND follower_id != following_id
    -- Can only follow users with public profiles
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = following_id
      AND profiles.profile_visibility = 'public'
    )
  );

-- Policy: Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow others"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Policy: Users can view their own following relationships
CREATE POLICY "Users can view their own follows"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Add helper functions for follower/following counts

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION public.get_follower_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE following_id = user_uuid;
$$;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION public.get_following_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE follower_id = user_uuid;
$$;

-- Function to check if user A follows user B
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
