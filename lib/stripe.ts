import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with the secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Platform fee percentage (configurable)
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || '10');

// Reservation timeout in minutes
export const RESERVATION_TIMEOUT_MINUTES = 15;
