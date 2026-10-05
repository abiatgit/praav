# Quick Authentication Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Create New Project
2. Copy your **Project URL** and **anon key** from Settings → API

### Step 2: Configure Environment Variables (1 min)

Create `.env.local`:

```bash
cd ~/Desktop/praav.uk
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### Step 3: Restart Dev Server (1 min)

```bash
# Kill current server (Ctrl+C)
npm run dev
```

### Step 4: Enable Email Auth (1 min)

**Option A: Quick Test (No Email Confirmation)**
1. Supabase Dashboard → Authentication → Providers → Email
2. Disable "Confirm email"
3. Save

**Option B: Production (With Email)**
- Keep email confirmation enabled
- Check your inbox for confirmation emails

---

## 🔐 Optional: Add Google OAuth

### Quick Setup:

1. **Google Cloud Console**:
   - Create project
   - OAuth consent screen → External
   - Create OAuth Client ID (Web application)
   - Add redirect: `https://xxxxx.supabase.co/auth/v1/callback`

2. **Supabase**:
   - Authentication → Providers → Google
   - Enable + add Client ID & Secret
   - Save

---

## 📘 Optional: Add Facebook OAuth

### Quick Setup:

1. **Facebook Developers**:
   - Create app → Consumer
   - Add Facebook Login product
   - Settings → Add redirect: `https://xxxxx.supabase.co/auth/v1/callback`

2. **Supabase**:
   - Authentication → Providers → Facebook
   - Enable + add App ID & Secret
   - Save

---

## ✅ Test Your Setup

1. Go to [http://localhost:3002/signup](http://localhost:3002/signup)
2. Try signing up with:
   - ✉️ Email (works immediately after Step 2)
   - 🔵 Google (if configured)
   - 📘 Facebook (if configured)

---

## 🎯 What You Get

**Already Built**:
- ✅ Modern signup page with social auth buttons
- ✅ Login page with social auth
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Facebook OAuth integration
- ✅ Error handling and loading states
- ✅ Responsive design
- ✅ OAuth callback handling
- ✅ Server-side auth with Next.js App Router
- ✅ Type-safe with TypeScript

**Pages Available**:
- `/signup` - Create account
- `/login` - Sign in
- `/auth/callback` - OAuth redirect handler

---

## 📖 Full Documentation

For detailed setup instructions, see: `SUPABASE_AUTH_SETUP.md`

---

## 🐛 Troubleshooting

**"Supabase is not configured"**
→ Check `.env.local` exists and has correct values

**Can't sign in**
→ Restart dev server after adding env vars

**OAuth not working**
→ Verify redirect URLs match exactly in Google/Facebook console

---

## 🎨 Customize

The auth components are located at:
- `components/auth/SignupForm.tsx`
- `components/auth/LoginForm.tsx`

You can customize:
- Colors and styling
- Form fields
- Success/error messages
- Redirect destinations
