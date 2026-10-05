-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Sarees', 'sarees', 'Traditional Indian draped garment'),
  ('Lehengas', 'lehengas', 'Long skirt with blouse and dupatta'),
  ('Salwar Kameez', 'salwar-kameez', 'Traditional outfit with pants and tunic'),
  ('Anarkali', 'anarkali', 'Long frock-style dress'),
  ('Kurtas & Kurtis', 'kurtas-kurtis', 'Traditional tunic tops'),
  ('Sherwanis', 'sherwanis', 'Traditional men''s coat'),
  ('Mens Ethnic Wear', 'mens-ethnic-wear', 'Traditional men''s clothing'),
  ('Kidswear', 'kidswear', 'Children''s ethnic clothing'),
  ('Bridal Wear', 'bridal-wear', 'Wedding and bridal outfits'),
  ('Jewellery & Accessories', 'jewellery-accessories', 'Traditional jewelry and accessories'),
  ('Other', 'other', 'Other ethnic wear items')
ON CONFLICT (slug) DO NOTHING;

-- Seller profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  
  -- Location info
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'United Kingdom',
  address_line_1 TEXT,
  address_line_2 TEXT,
  
  -- Onboarding & settings
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  preferred_communication TEXT DEFAULT 'platform_only',
  seller_introduction TEXT,
  
  -- Stats
  total_sales INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller categories (many-to-many)
CREATE TABLE IF NOT EXISTS seller_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id, category_id)
);

-- Seller sizes
CREATE TABLE IF NOT EXISTS seller_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  size_type TEXT DEFAULT 'uk_womens' CHECK (size_type IN ('uk_womens', 'uk_mens', 'free_size', 'one_size', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id, size, size_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_seller_categories_seller_id ON seller_categories(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sizes_seller_id ON seller_sizes(seller_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (profile_visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Seller categories policies
CREATE POLICY "Anyone can view seller categories"
  ON seller_categories FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their own categories"
  ON seller_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = seller_categories.seller_id AND profiles.user_id = auth.uid()
  ));

-- Seller sizes policies
CREATE POLICY "Anyone can view seller sizes"
  ON seller_sizes FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their own sizes"
  ON seller_sizes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = seller_sizes.seller_id AND profiles.user_id = auth.uid()
  ));

-- Categories policies (read-only for all)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for avatars (run this in Supabase dashboard separately)
-- This is a reminder - you'll need to create the bucket in the UI or via SQL:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policy for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/
