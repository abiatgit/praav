-- Add Stripe Connect fields to profiles for marketplace payouts
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Create index for Stripe account lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON public.profiles(stripe_account_id);

-- Add comments
COMMENT ON COLUMN public.profiles.stripe_account_id IS 'Stripe Connect account ID for seller payouts';
COMMENT ON COLUMN public.profiles.stripe_onboarding_completed IS 'Whether seller has completed Stripe onboarding';
COMMENT ON COLUMN public.profiles.stripe_charges_enabled IS 'Whether Stripe account can accept charges';
COMMENT ON COLUMN public.profiles.stripe_payouts_enabled IS 'Whether Stripe account can receive payouts';
