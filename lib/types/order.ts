export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface OrderWithDetails extends Order {
  listing: {
    id: string;
    title: string;
    price: number;
    size: string | null;
    condition: string;
    images: Array<{
      id: string;
      image_url: string;
      is_cover: boolean;
    }>;
    category: {
      id: string;
      name: string;
    };
  };
  seller: {
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
  buyer?: {
    user_id: string;
    username: string;
    display_name: string | null;
  };
}
