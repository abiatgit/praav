# Stripe Checkout Integration Setup Guide

This guide will help you complete the Stripe payment integration for the praav.uk marketplace.

## What Has Been Implemented

✅ **Database Schema**
- Orders table with all necessary fields
- Stripe Connect fields on profiles table
- Listing reservation system
- RLS policies for order security

✅ **Server Infrastructure**
- Stripe utilities and configuration
- Server actions for checkout session creation
- Order management functions
- Reservation logic with 15-minute timeout

✅ **Checkout Flow**
- Checkout page at `/checkout/[listingId]`
- Automatic listing reservation on checkout page load
- Stripe Checkout Session creation
- Price verification from database (prevents price manipulation)

✅ **Webhook Handler**
- Secure webhook endpoint at `/api/webhooks/stripe`
- Signature verification
- Idempotent payment processing
- Automatic order and listing status updates

✅ **User Interface**
- Success page at `/checkout/success`
- Buyer orders page at `/orders`
- Seller orders page at `/dashboard/orders`
- Clickable "Total Sales" dashboard stat card
- Updated Buy Now button with ownership checks
- Sold/unavailable item handling

---

## Setup Steps

### 1. Run Database Migrations

Apply the three migration files to your Supabase database:

```bash
# Navigate to your Supabase project dashboard
# Go to SQL Editor and run these files in order:

1. supabase/migrations/20240115000000_create_orders_table.sql
2. supabase/migrations/20240115000001_add_stripe_fields_to_profiles.sql
3. supabase/migrations/20240115000002_add_listing_reservation.sql
```

Alternatively, if you have Supabase CLI installed:

```bash
npx supabase db push
```

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEW - Required for webhook

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your production URL

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...  # From Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Webhook setup (see below)

# Platform Configuration
PLATFORM_FEE_PERCENT=10  # Your marketplace commission percentage
```

### 3. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)
6. Add them to `.env.local`

⚠️ **Never commit real Stripe keys to git!**

### 4. Set Up Stripe Webhook

The webhook is critical - it's the source of truth for payment confirmation.

**Local Development (using Stripe CLI):**

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret (whsec_...)
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

**Production:**

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add to production environment variables

### 5. Test the Payment Flow

**Testing Locally:**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Navigate to any active listing
4. Click **BUY NOW**
5. You'll be redirected to checkout page
6. Click **PROCEED TO SECURE PAYMENT**
7. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date, any CVC

8. After successful payment:
   - You'll be redirected to success page
   - The webhook will mark the order as paid
   - The listing will be marked as sold
   - Check `/orders` to see your purchase

### 6. Verify Everything Works

✅ **Listing Page**
- [ ] Buy Now button appears for active listings
- [ ] Buy Now button is hidden for sold listings
- [ ] Sellers cannot buy their own items
- [ ] Logged-out users are redirected to login

✅ **Checkout Flow**
- [ ] Checkout page loads with correct listing
- [ ] Price matches database (not manipulable)
- [ ] Listing is reserved during checkout
- [ ] Stripe Checkout opens correctly

✅ **Payment**
- [ ] Test card payments work
- [ ] Webhook receives `checkout.session.completed`
- [ ] Order status updates to "paid"
- [ ] Listing status updates to "sold"
- [ ] Reservation is cleared

✅ **Orders Page (Buyer)**
- [ ] Buyer can see their orders at `/orders`
- [ ] Order details are correct
- [ ] Payment status shows "PAID"

✅ **Seller Orders Page**
- [ ] Seller can see their sales at `/dashboard/orders`
- [ ] Total Sales stat card on dashboard links to orders
- [ ] Order shows buyer username
- [ ] Order shows correct payment and order status
- [ ] Empty state shows when no sales yet

---

## Important Security Notes

1. **Price Verification**: The price is ALWAYS fetched from the database in the server action. Clients cannot manipulate it.

2. **Webhook Signature**: The webhook ALWAYS verifies the Stripe signature before processing. Random requests will be rejected.

3. **Source of Truth**: Payment confirmation comes from Stripe's webhook, NOT from the browser's success page.

4. **Idempotency**: Webhooks are designed to be idempotent. Processing the same event twice won't create duplicate paid orders.

5. **RLS Policies**: Buyers can only see their own orders. Sellers can only see orders for their listings.

---

## Future: Stripe Connect for Seller Payouts

The system is architected for Stripe Connect, but it's not yet enabled. When ready:

1. Create Connected Accounts for sellers
2. Use `on_behalf_of` or `transfer_data` in checkout sessions
3. Implement seller onboarding flow
4. Enable automatic payouts with platform fees

The database already has:
- `stripe_account_id`
- `stripe_onboarding_completed`
- `stripe_charges_enabled`
- `stripe_payouts_enabled`

---

## Troubleshooting

**"No signature" error in webhook:**
- Make sure you're running `stripe listen` for local development
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly

**Order not marked as paid:**
- Check webhook is receiving events: `stripe listen`
- Check your webhook handler logs in terminal
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**Price is 0 or incorrect:**
- The price comes from the database listing
- Make sure the listing has a valid price set

**Can't access orders page:**
- Must be logged in
- Orders page requires authentication

**Reservation expired:**
- Default timeout is 15 minutes
- Complete payment faster or adjust `RESERVATION_TIMEOUT_MINUTES` in `lib/stripe.ts`

---

## What's NOT Included (As Specified)

The following were explicitly excluded from this implementation:

- ❌ Multiple-item cart checkout (only Buy Now for single items)
- ❌ Shipping integration/tracking
- ❌ Automated seller payouts
- ❌ Stripe Connect onboarding flow
- ❌ Email notifications (structure is ready)
- ❌ Refund UI
- ❌ Dispute handling
- ❌ Tax calculations
- ❌ Coupons/discounts
- ❌ Returns system

These can be added later as the marketplace grows.

---

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal for webhook/server errors
3. Check Stripe Dashboard → Logs for webhook attempts
4. Verify all environment variables are set
5. Ensure migrations have been applied

## Testing Checklist

Before going to production:

- [ ] All database migrations applied
- [ ] All environment variables configured
- [ ] Stripe test mode working end-to-end
- [ ] Webhook properly configured for production
- [ ] Production Stripe keys (live mode) configured
- [ ] Production webhook secret configured
- [ ] Terms and conditions page exists
- [ ] Privacy policy updated for payment processing
- [ ] Error handling tested
- [ ] Mobile checkout tested
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds

---

Good luck with your marketplace! 🚀
