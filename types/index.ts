// Product types
export interface Product {
  id: string;
  title: string;
  category: string;
  size: string;
  condition: 'New with tags' | 'Like new' | 'Good' | 'Fair';
  price: number;
  images: string[];
  location: string;
  seller_id: string;
  created_at?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

// User types (for future implementation)
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Newsletter subscription
export interface NewsletterSubscription {
  email: string;
}
