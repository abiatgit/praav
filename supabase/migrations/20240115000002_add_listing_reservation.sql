-- Add reservation fields to listings for checkout flow
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;

-- Create index for reservation queries
CREATE INDEX IF NOT EXISTS idx_listings_reserved_by ON public.listings(reserved_by);
CREATE INDEX IF NOT EXISTS idx_listings_reservation_expires_at ON public.listings(reservation_expires_at);

-- Function to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET
    reserved_by = NULL,
    reserved_at = NULL,
    reservation_expires_at = NULL
  WHERE
    reserved_by IS NOT NULL
    AND reservation_expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON COLUMN public.listings.reserved_by IS 'User who has temporarily reserved this listing for checkout';
COMMENT ON COLUMN public.listings.reserved_at IS 'When the listing was reserved';
COMMENT ON COLUMN public.listings.reservation_expires_at IS 'When the reservation expires (typically 15 minutes)';
