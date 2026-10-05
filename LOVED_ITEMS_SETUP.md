# Loved Items / Wishlist Feature Setup

This document provides instructions for setting up the loved items (wishlist/favorites) feature.

## Database Migration

### Apply the Migration

Run the SQL migration file located at `supabase/migrations/006_loved_items_schema.sql`

**Option 1: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/006_loved_items_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

**Option 2: Using Supabase CLI**

```bash
# If you have Supabase CLI installed
supabase db push
```

**Option 3: Manual Execution**

```bash
# Connect to your Supabase database using psql or your preferred client
# Then run the migration file
psql -h <your-project-ref>.supabase.co -U postgres -d postgres -f supabase/migrations/006_loved_items_schema.sql
```

### Verify Migration

After running the migration, verify the following tables and functions exist:

**Tables:**
- `public.loved_items` - Contains loved item relationships

**Functions:**
- `get_loved_items_count(user_uuid UUID)` - Returns loved items count for a user
- `is_listing_loved(user_uuid UUID, listing_uuid UUID)` - Checks if a listing is loved by a user

**RLS Policies:**
- Users can view their own loved items
- Users can create their own loved items
- Users can delete their own loved items

Run this query to verify:

```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loved_items';

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE 'get_loved%' OR routine_name LIKE 'is_listing%');
```

## New Features

### 1. Loved Items Page (`/loved`)

View all items you've saved.

**Features:**
- Grid view of loved items
- Remove items by clicking the heart button
- Shows sold/archived status overlay
- Empty state with "Browse Marketplace" CTA
- Shows seller information for each item
- Clickable items linking to listing detail page

### 2. Marketplace Integration

Heart buttons on every product card.

**Features:**
- Click heart to save/unsave items
- Heart fills red when loved
- Optimistic UI updates
- Prevents duplicate saves

### 3. Listing Detail Page Integration

Love button in the actions section.

**Features:**
- Larger button variant with icon
- Positioned alongside "Contact Seller" and "Share" buttons
- Shows "Loved" text when item is saved

### 4. Navigation Updates

**Marketplace Navigation:**
- Added "Loved" link in header (desktop and mobile)
- Links to `/loved` page

## Implementation Details

### Components

**LovedButton Component** (`components/loved/LovedButton.tsx`)
- Reusable component with two variants:
  - `overlay`: Small circular button for product cards
  - `button`: Larger button with label for detail pages
- Three sizes: sm, md, lg
- Handles authentication (redirects to login if not authenticated)
- Optimistic UI updates
- Loading states with spinner
- Prevents rapid clicking

**LovedContent Component** (`app/loved/LovedContent.tsx`)
- Client component displaying loved items grid
- Empty state handling
- Navigation to marketplace

### Server Actions

**File:** `lib/supabase/loved-actions.ts`

- `loveItem(listingId)` - Add item to loved_items
- `unloveItem(listingId)` - Remove item from loved_items
- `getLovedItems()` - Fetch user's loved items with full listing details
- `getLovedListingIds()` - Efficiently fetch just IDs for state checking
- `getLovedCount()` - Get count for navigation badge (future use)
- `isListingLoved(listingId)` - Check if specific listing is loved

### Database Schema

**Table:** `loved_items`
```sql
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- listing_id (UUID, references listings)
- created_at (TIMESTAMPTZ)
- UNIQUE constraint on (user_id, listing_id)
```

**Indexes:**
- `idx_loved_items_user_id` - For user queries
- `idx_loved_items_listing_id` - For listing queries
- `idx_loved_items_created_at` - For chronological ordering

**RLS Policies:**
- Users can only view/create/delete their own loved items
- Enforced at database level for security

## Testing Checklist

### Love/Unlove Functionality

- [ ] Can love an item from marketplace page
- [ ] Can love an item from listing detail page
- [ ] Can unlove from marketplace page
- [ ] Can unlove from listing detail page
- [ ] Can unlove from /loved page
- [ ] Heart button shows correct state (filled when loved, outline when not)
- [ ] Cannot love the same item twice (unique constraint prevents duplicates)
- [ ] Loved items persist across page reloads

### Loved Items Page

- [ ] /loved shows all saved items
- [ ] Items display correctly in grid layout
- [ ] Sold/archived items show status overlay
- [ ] Can remove items via heart button
- [ ] Empty state shows when no items are loved
- [ ] "Browse Marketplace" CTA works
- [ ] Seller information displays correctly
- [ ] Clicking item navigates to listing detail

### Navigation

- [ ] "Loved" link appears in marketplace header
- [ ] Mobile navigation shows "Loved" button
- [ ] Navigation works on all pages

### Authentication

- [ ] Unauthenticated users redirected to login when clicking heart
- [ ] After login, user can love items
- [ ] Session persists across navigation
- [ ] /loved page requires authentication

### Performance & UX

- [ ] Heart button responds immediately (optimistic UI)
- [ ] Loading spinner shows during save/remove
- [ ] Cannot rapidly click heart button
- [ ] No duplicate requests sent to server
- [ ] Page refreshes after love/unlove to sync state

## Common Issues & Troubleshooting

### Heart button not working

1. Check that the migration was applied successfully
2. Verify RLS policies are in place
3. Check browser console for errors
4. Verify user is authenticated

### Loved items not showing

1. Verify loved_items table has data:
   ```sql
   SELECT * FROM loved_items WHERE user_id = '<your_user_id>';
   ```
2. Check RLS policies allow reading loved items
3. Verify listing still exists and is published

### TypeScript errors

The implementation follows existing TypeScript patterns and should not introduce new errors.

## File Structure

### New Files Created

**Database:**
- `supabase/migrations/006_loved_items_schema.sql` - Database migration

**Server Actions:**
- `lib/supabase/loved-actions.ts` - Love/unlove server actions

**Components:**
- `components/loved/LovedButton.tsx` - Reusable loved button component

**Pages:**
- `app/loved/page.tsx` - Loved items page (server component)
- `app/loved/LovedContent.tsx` - Loved items content (client component)

**Updated Files:**
- `app/marketplace/page.tsx` - Fetch loved listing IDs
- `app/marketplace/MarketplaceContent.tsx` - Added Loved navigation, integrated LovedButton
- `app/listing/[id]/page.tsx` - Fetch loved status
- `app/listing/[id]/ListingDetail.tsx` - Integrated LovedButton

## Future Enhancements

Not included in this implementation:

- Loved items count badge in navigation
- Notifications when loved items go on sale
- Sharing loved items lists
- Collections/categories for loved items
- Email reminders for loved items
- Analytics on most loved items

## Support

If you encounter issues:

1. Check the Supabase logs for database errors
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Review RLS policies in Supabase dashboard
