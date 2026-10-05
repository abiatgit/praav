# Seller Onboarding Implementation Guide

## 🚀 Quick Start

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/toeijjshsgwmfkwohdhr
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_seller_onboarding_schema.sql`
5. Paste and click **Run**
6. Verify tables were created in **Table Editor**

### Step 2: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Bucket name: `avatars`
4. Make it **Public**
5. Click **Create bucket**

### Step 3: Set Storage Policies

Go to **Storage** → **avatars** → **Policies** and add:

```sql
-- Allow public viewing
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update/delete their own avatar
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
```

---

## 📋 What's Included

### Database Schema

**Tables Created**:
- ✅ `profiles` - Seller profile information
- ✅ `categories` - Product categories (pre-populated)
- ✅ `seller_categories` - Seller's preferred categories
- ✅ `seller_sizes` - Seller's preferred sizes

**Features**:
- Auto-creates profile when user signs up
- Row Level Security (RLS) policies
- Username uniqueness validation
- Public/private profile visibility

### TypeScript Types

Location: `types/database.ts`

- Profile
- Category
- SellerCategory
- SellerSize
- OnboardingData

### Constants

Location: `lib/constants/onboarding.ts`

- UK women's sizes (UK 4 - UK 24+)
- UK men's sizes (XS - XXXL)
- Special sizes (Free Size, One Size, Custom)
- Onboarding steps configuration
- Validation rules

---

## 🎯 User Flow

```
New User Signup
↓
Profile auto-created (onboarding_completed = false)
↓
User logs in
↓
Redirected to /onboarding (Step 1)
↓
Complete 4 steps:
  1. Basic Info (photo, name, username, bio)
  2. Location (city, postcode, address)
  3. Preferences (categories, sizes)
  4. Final review & completion
↓
onboarding_completed = true
↓
Redirected to /dashboard
↓
Access seller features
```

---

## 🔒 Authentication Guards

### Route Protection

**Public routes**: `/`, `/login`, `/signup`, `/marketplace`

**Protected routes**:
- `/dashboard` - Requires auth + completed onboarding
- `/onboarding` - Requires auth only
- `/settings` - Requires auth + completed onboarding

### Redirect Logic

```typescript
// If not authenticated → /login
// If authenticated but !onboarding_completed → /onboarding
// If authenticated AND onboarding_completed → /dashboard
```

---

## 📊 Database Schema Details

### profiles Table

```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- username (TEXT, UNIQUE) - for @username URLs
- display_name (TEXT) - shown on profile
- bio (TEXT, max 160 chars)
- avatar_url (TEXT) - Supabase Storage URL

-- Location (private)
- city (TEXT)
- postcode (TEXT)
- country (TEXT, default 'United Kingdom')
- address_line_1 (TEXT)
- address_line_2 (TEXT)

-- Settings
- onboarding_completed (BOOLEAN, default FALSE)
- onboarding_step (INTEGER, default 1)
- profile_visibility ('public' | 'private')
- preferred_communication (TEXT)
- seller_introduction (TEXT)

-- Stats
- total_sales (INTEGER, default 0)
- total_listings (INTEGER, default 0)
- profile_views (INTEGER, default 0)
- rating (DECIMAL, default 0.00)

-- Timestamps
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Public Profile URL

Format: `/@username`

Example: `https://praav.uk/@abigeorge`

---

## 🎨 UI Components Needed

### Onboarding Components

1. **OnboardingLayout** - Progress indicator, step navigation
2. **Step1BasicInfo** - Photo upload, name, username, bio
3. **Step2Location** - City, postcode, address fields
4. **Step3Preferences** - Category & size selection
5. **Step4Review** - Profile preview & completion

### Dashboard Components

1. **DashboardLayout** - Navigation, header
2. **ProfileCompletionCard** - Progress indicator
3. **StatsCards** - Listings, sales, views
4. **MyListings** - Empty state / listing cards
5. **QuickActions** - Sell item, edit profile

---

## 💾 Storage Structure

### Avatar Upload

```
avatars/
  {user_id}/
    avatar.jpg
    avatar.webp (optimized)
```

**Upload Flow**:
1. User selects image
2. Validate (< 5MB, jpg/png/webp)
3. Upload to `avatars/{user_id}/avatar.{ext}`
4. Update profile.avatar_url
5. Display in preview

---

## ✅ Validation Rules

### Username
- Lowercase only
- 3-30 characters
- Letters, numbers, hyphens, underscores
- No spaces
- Must be unique
- Real-time availability check

### Bio
- Max 160 characters
- Character counter
- Optional

### Location
- City: Required
- Postcode: Required (UK format validation)
- Country: Default to United Kingdom
- Address: Optional (for future shipping)

### Categories
- At least 1 required
- Max 5 recommended
- Multi-select

### Sizes
- At least 1 recommended
- Multi-select
- Support different size types

---

## 🚧 Implementation Status

**✅ Complete**:
- Database schema
- TypeScript types
- Constants & config
- SQL migrations

**⏳ To Implement** (files provided below):
- Onboarding pages (4 steps)
- Seller dashboard
- Profile actions
- Image upload utility
- Authentication middleware

---

## 📁 File Structure

```
app/
  onboarding/
    page.tsx              # Main onboarding router
    step1/page.tsx        # Basic info
    step2/page.tsx        # Location
    step3/page.tsx        # Preferences
    step4/page.tsx        # Review
  dashboard/
    page.tsx              # Seller dashboard
    
components/
  onboarding/
    OnboardingLayout.tsx
    Step1BasicInfo.tsx
    Step2Location.tsx
    Step3Preferences.tsx
    Step4Review.tsx
  dashboard/
    DashboardLayout.tsx
    ProfileCompletion.tsx
    StatsCards.tsx
    MyListings.tsx
    
lib/
  supabase/
    profile-actions.ts    # Server actions for profiles
  utils/
    upload.ts            # Image upload utilities
    validation.ts        # Form validation
```

---

## 🔄 Next Steps

1. Run the SQL migration (Step 1 above)
2. Create storage bucket (Step 2 above)
3. Set storage policies (Step 3 above)
4. Test profile creation on signup
5. Build onboarding pages
6. Build dashboard
7. Test complete flow

---

## 📖 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

