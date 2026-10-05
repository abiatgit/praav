-- ============================================
-- LISTINGS SCHEMA
-- ============================================

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Basic Information
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
  description TEXT CHECK (char_length(description) <= 2000),
  category_id UUID NOT NULL REFERENCES categories(id),

  -- Item Details
  size TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair')),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'USD', 'EUR')),

  -- Optional Details
  brand TEXT CHECK (char_length(brand) <= 50),
  colour TEXT CHECK (char_length(colour) <= 50),
  fabric TEXT CHECK (char_length(fabric) <= 100),
  occasion TEXT CHECK (char_length(occasion) <= 100),

  -- Damage & History
  damage_description TEXT CHECK (char_length(damage_description) <= 500),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  purchase_year INTEGER CHECK (purchase_year >= 1900 AND purchase_year <= EXTRACT(YEAR FROM CURRENT_DATE)),

  -- Measurements
  measurement_unit TEXT CHECK (measurement_unit IN ('cm', 'inches')),
  bust DECIMAL(5,2) CHECK (bust >= 0),
  waist DECIMAL(5,2) CHECK (waist >= 0),
  hip DECIMAL(5,2) CHECK (hip >= 0),
  length DECIMAL(5,2) CHECK (length >= 0),
  sleeve_length DECIMAL(5,2) CHECK (sleeve_length >= 0),

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT valid_published_at CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR
    (status != 'published')
  )
);

-- Create listing_images table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure only one cover image per listing
  CONSTRAINT unique_cover_per_listing UNIQUE (listing_id, is_cover)
    DEFERRABLE INITIALLY DEFERRED
);

-- ============================================
-- INDEXES
-- ============================================

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_published_at ON listings(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- Listing images indexes
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_display_order ON listing_images(listing_id, display_order);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listings_updated_at();

-- Set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_listings_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_published_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION set_listings_published_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Listings Policies

-- Public can view published listings
CREATE POLICY "Published listings are publicly viewable"
  ON listings FOR SELECT
  USING (status = 'published');

-- Sellers can view their own listings (any status)
CREATE POLICY "Sellers can view their own listings"
  ON listings FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can insert their own listings
CREATE POLICY "Sellers can create their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own listings
CREATE POLICY "Sellers can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = seller_id);

-- Listing Images Policies

-- Public can view images of published listings
CREATE POLICY "Images of published listings are publicly viewable"
  ON listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.status = 'published'
    )
  );

-- Sellers can view images of their own listings
CREATE POLICY "Sellers can view their own listing images"
  ON listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can insert images for their own listings
CREATE POLICY "Sellers can add images to their own listings"
  ON listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can update images of their own listings
CREATE POLICY "Sellers can update their own listing images"
  ON listing_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can delete images of their own listings
CREATE POLICY "Sellers can delete their own listing images"
  ON listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.seller_id = auth.uid()
    )
  );
