export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  postcode: string | null;
  country: string;
  address_line_1: string | null;
  address_line_2: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  profile_visibility: 'public' | 'private';
  preferred_communication: string;
  seller_introduction: string | null;
  total_sales: number;
  total_listings: number;
  profile_views: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface SellerCategory {
  id: string;
  seller_id: string;
  category_id: string;
  created_at: string;
}

export interface SellerSize {
  id: string;
  seller_id: string;
  size: string;
  size_type: 'uk_womens' | 'uk_mens' | 'free_size' | 'one_size' | 'custom';
  created_at: string;
}

export interface OnboardingData {
  // Step 1
  avatar_url?: string | null;
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;

  // Step 2
  city?: string | null;
  postcode?: string | null;
  country?: string;
  address_line_1?: string | null;
  address_line_2?: string | null;

  // Step 3
  categories?: string[];
  sizes?: string[];

  // Step 4
  seller_introduction?: string | null;
  preferred_communication?: string;
  profile_visibility?: 'public' | 'private';
}
