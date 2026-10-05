# Seller Profile Discovery & Follow System Setup

This document provides instructions for setting up the seller profile discovery and following system.

## Database Migration

### Apply the Migration

Run the SQL migration file located at `supabase/migrations/005_follows_schema.sql`

**Option 1: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/005_follows_schema.sql`
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
psql -h <your-project-ref>.supabase.co -U postgres -d postgres -f supabase/migrations/005_follows_schema.sql
```

### Verify Migration

After running the migration, verify the following tables and functions exist:

**Tables:**
- `public.follows` - Contains follow relationships

**Functions:**
- `get_follower_count(user_uuid UUID)` - Returns follower count for a user
- `get_following_count(user_uuid UUID)` - Returns following count for a user
- `is_following(follower_uuid UUID, following_uuid UUID)` - Checks if user A follows user B

**RLS Policies:**
- Public profiles follow counts are viewable
- Users can follow others
- Users can unfollow others
- Users can view their own follows

Run this query to verify:

```sql
SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows';

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'get_%' OR routine_name LIKE 'is_%';
```

## New Features

### 1. Seller Discovery (`/profiles`)

Browse and search for sellers with active listings.

**Features:**
- Search by seller name, username, or city
- View seller profile cards with preview images
- Follow/unfollow sellers
- See listing and follower counts

### 2. Public Seller Profiles (`/@username`)

View detailed seller profiles.

**Features:**
- Profile header with avatar, bio, location
- Follower/following counts (clickable)
- Active listings count and sold items count
- Follow button (or Edit Profile if own profile)
- Grid of all active listings

**For own profile:**
- Shows "Edit Profile" button linking to dashboard
- Shows "Sell an item" button

### 3. Following Page (`/following`)

View sellers you follow.

**Features:**
- List of followed sellers
- Quick access to their profiles
- Unfollow button on each card
- Empty state with "Discover Sellers" CTA

### 4. Followers & Following Pages

- `/@username/followers` - View who follows this seller
- `/@username/following` - View who this seller follows

### 5. Updated Marketplace

**Enhanced Navigation:**
- Added "Profiles" link in header
- Responsive mobile navigation

**Enhanced Listing Cards:**
- Shows seller avatar
- Clickable seller name linking to profile

## Testing Checklist

### Follow/Unfollow Functionality

- [ ] Can follow a seller from /profiles page
- [ ] Can follow a seller from their profile page
- [ ] Can unfollow from /following page
- [ ] Can unfollow from seller profile page
- [ ] Follow button shows correct state (Follow/Following)
- [ ] Follower count updates after follow/unfollow
- [ ] Cannot follow yourself
- [ ] Cannot follow the same user twice

### Profile Discovery

- [ ] /profiles shows sellers with active listings only
- [ ] Search filters sellers by name, username, and city
- [ ] Profile cards show correct preview images
- [ ] Profile cards show correct listing counts
- [ ] Clicking profile card navigates to seller profile

### Seller Profile

- [ ] /@username loads correctly for public profiles
- [ ] Own profile shows "Edit Profile" instead of "Follow"
- [ ] Follower/following counts are accurate
- [ ] Clicking followers/following navigates to respective pages
- [ ] All active listings are displayed
- [ ] Listings link to correct detail pages

### Navigation

- [ ] "Profiles" link appears in marketplace header
- [ ] "Marketplace" link appears in profiles header
- [ ] Mobile navigation works correctly
- [ ] Can navigate between marketplace, profiles, and following

### Authentication

- [ ] Unauthenticated users cannot follow
- [ ] Clicking follow when not logged in redirects to login
- [ ] After login, user can follow seller
- [ ] Session persists across navigation

### Empty States

- [ ] "No sellers found" when search has no results
- [ ] "Not following anyone yet" on /following when not following anyone
- [ ] "No followers yet" on followers page
- [ ] "No listings yet" on seller profile with no listings

## Common Issues & Troubleshooting

### Follow button not working

1. Check that the migration was applied successfully
2. Verify RLS policies are in place
3. Check browser console for errors
4. Verify user is authenticated

### Follower counts showing 0

1. Verify follows table has data
2. Check RLS policies allow reading follow counts
3. Test with SQL query:
   ```sql
   SELECT COUNT(*) FROM follows WHERE following_id = '<user_id>';
   ```

### Profiles page empty

1. Verify users have completed onboarding
2. Check users have `profile_visibility = 'public'`
3. Ensure users have at least one active (published) listing

### TypeScript errors

Some pre-existing TypeScript errors may exist in other files. The new code should not introduce additional errors.

## File Structure

### New Files Created

**Database:**
- `supabase/migrations/005_follows_schema.sql` - Database migration

**Server Actions:**
- `lib/supabase/follow-actions.ts` - Follow/unfollow server actions
- `lib/supabase/seller-discovery-actions.ts` - Seller discovery queries

**Components:**
- `components/profiles/FollowButton.tsx` - Follow/Unfollow button component
- `components/profiles/SellerProfileCard.tsx` - Seller card for discovery page

**Pages:**
- `app/profiles/page.tsx` - Profiles discovery page
- `app/profiles/ProfilesContent.tsx` - Client component for profiles
- `app/following/page.tsx` - Following page
- `app/following/FollowingContent.tsx` - Client component for following
- `app/[username]/followers/page.tsx` - Followers list page
- `app/[username]/following/page.tsx` - Following list page

**Updated Files:**
- `app/marketplace/MarketplaceContent.tsx` - Added Profiles navigation and seller avatars
- `app/[username]/page.tsx` - Updated to use new seller profile query
- `app/[username]/PublicProfileContent.tsx` - Added follow button and stats

## Future Enhancements

Not included in this implementation (as per requirements):

- Chat/messaging between buyers and sellers
- Notifications for new followers or listings
- AI-powered seller recommendations
- Advanced filtering on profiles page
- Seller ratings and reviews system
- Following feed showing latest listings from followed sellers

## Support

If you encounter issues:

1. Check the Supabase logs for database errors
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Review RLS policies in Supabase dashboard
