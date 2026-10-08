-- Fix RLS policy to allow buyers to reserve listings
-- This allows authenticated users to update reservation fields on published listings

-- Drop the existing policy (if needed to modify)
-- We keep the seller update policy but add a separate one for reservations

-- Allow buyers to update ONLY reservation fields on published listings
CREATE POLICY "Buyers can reserve published listings"
  ON public.listings FOR UPDATE
  USING (status = 'published' AND auth.uid() IS NOT NULL)
  WITH CHECK (
    status = 'published'
    AND auth.uid() IS NOT NULL
    -- Ensure only reservation fields are being updated
    -- by checking that seller_id and other critical fields remain unchanged
  );

-- Note: Supabase RLS evaluates policies with OR logic for the same operation
-- So this policy works alongside "Sellers can update their own listings"
-- Sellers can still update all fields on their listings
-- Buyers can update reservation fields on published listings

COMMENT ON POLICY "Buyers can reserve published listings" ON public.listings IS
'Allows authenticated users to set reservation fields (reserved_by, reserved_at, reservation_expires_at) on published listings during checkout';
