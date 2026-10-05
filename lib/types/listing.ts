// ============================================
// LISTING TYPES
// ============================================

export interface Listing {
  id: string;
  seller_id: string;

  // Basic Information
  title: string;
  description?: string;
  category_id: string;

  // Item Details
  size?: string;
  condition: ListingCondition;
  price: number;
  currency: Currency;

  // Optional Details
  brand?: string;
  colour?: string;
  fabric?: string;
  occasion?: string;

  // Damage & History
  damage_description?: string;
  original_price?: number;
  purchase_year?: number;

  // Measurements
  measurement_unit?: MeasurementUnit;
  bust?: number;
  waist?: number;
  hip?: number;
  length?: number;
  sleeve_length?: number;

  // Status
  status: ListingStatus;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  image_url: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface ListingWithImages extends Listing {
  images: ListingImage[];
}

export interface ListingWithDetails extends ListingWithImages {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type ListingStatus = 'draft' | 'published' | 'sold' | 'archived';

export type ListingCondition =
  | 'new_with_tags'
  | 'new_without_tags'
  | 'excellent'
  | 'good'
  | 'fair';

export type Currency = 'GBP' | 'USD' | 'EUR';

export type MeasurementUnit = 'cm' | 'inches';

// ============================================
// CONDITION OPTIONS
// ============================================

export const LISTING_CONDITIONS = [
  {
    value: 'new_with_tags' as const,
    label: 'New with Tags',
    description: 'Brand new, never worn, with original tags attached',
  },
  {
    value: 'new_without_tags' as const,
    label: 'New without Tags',
    description: 'Brand new, never worn, but tags removed',
  },
  {
    value: 'excellent' as const,
    label: 'Excellent',
    description: 'Worn once or twice, looks like new',
  },
  {
    value: 'good' as const,
    label: 'Good',
    description: 'Gently used with minor signs of wear',
  },
  {
    value: 'fair' as const,
    label: 'Fair',
    description: 'Well-loved with visible wear or damage (please describe)',
  },
] as const;

// ============================================
// COLOR OPTIONS
// ============================================

export const COMMON_COLORS = [
  'Red',
  'Pink',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Brown',
  'Black',
  'White',
  'Grey',
  'Gold',
  'Silver',
  'Multicolour',
  'Other',
] as const;

// ============================================
// FABRIC OPTIONS
// ============================================

export const COMMON_FABRICS = [
  'Silk',
  'Cotton',
  'Georgette',
  'Chiffon',
  'Crepe',
  'Velvet',
  'Satin',
  'Net',
  'Organza',
  'Brocade',
  'Chanderi',
  'Banarasi',
  'Tussar',
  'Linen',
  'Polyester',
  'Mixed/Blend',
  'Other',
] as const;

// ============================================
// OCCASION OPTIONS
// ============================================

export const COMMON_OCCASIONS = [
  'Wedding',
  'Party',
  'Festival',
  'Casual',
  'Formal',
  'Sangeet',
  'Mehendi',
  'Reception',
  'Engagement',
  'Diwali',
  'Eid',
  'Holi',
  'Navratri',
  'Puja',
  'Other',
] as const;

// ============================================
// MEASUREMENT UNITS
// ============================================

export const MEASUREMENT_UNITS = [
  { value: 'cm' as const, label: 'Centimeters (cm)' },
  { value: 'inches' as const, label: 'Inches' },
] as const;

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const LISTING_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  BRAND_MAX_LENGTH: 50,
  COLOUR_MAX_LENGTH: 50,
  FABRIC_MAX_LENGTH: 100,
  OCCASION_MAX_LENGTH: 100,
  DAMAGE_DESCRIPTION_MAX_LENGTH: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MAX_IMAGES: 5,
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

// ============================================
// FORM DATA TYPES
// ============================================

export interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

export interface ListingFormData {
  // Step 1: Images
  images: ImagePreview[];
  coverImageIndex: number;

  // Step 2: Details
  title: string;
  description: string;
  category_id: string;
  size: string;
  condition: ListingCondition;
  price: string;
  brand: string;
  colour: string;
  fabric: string;
  occasion: string;
  damage_description: string;
  original_price: string;
  purchase_year: string;
  measurement_unit: MeasurementUnit;
  bust: string;
  waist: string;
  hip: string;
  length: string;
  sleeve_length: string;
}

export interface CreateListingData {
  title: string;
  description?: string;
  category_id: string;
  size?: string;
  condition: ListingCondition;
  price: number;
  currency?: Currency;
  brand?: string;
  colour?: string;
  fabric?: string;
  occasion?: string;
  damage_description?: string;
  original_price?: number;
  purchase_year?: number;
  measurement_unit?: MeasurementUnit;
  bust?: number;
  waist?: number;
  hip?: number;
  length?: number;
  sleeve_length?: number;
}

export interface UpdateListingData extends Partial<CreateListingData> {
  status?: ListingStatus;
}
