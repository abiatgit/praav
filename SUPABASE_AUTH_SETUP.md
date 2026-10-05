# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with Google and Facebook OAuth for praav.uk.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Google Cloud Console account
- Facebook Developer account

---

## Part 1: Supabase Project Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose your organization (or create one)
4. Create a new project:
   - **Name**: praav-uk (or your preferred name)
   - **Database Password**: Generate a secure password (save it!)
   - **Region**: Choose closest to UK (e.g., EU West - London)
5. Wait for the project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your project dashboard, click on the **Settings** icon (⚙️) in the sidebar
2. Go to **API** settings
3. You'll find two important values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create Environment File

1. In your project root (`~/Desktop/praav.uk/`), create a `.env.local` file:

```bash
cd ~/Desktop/praav.uk
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

---

## Part 2: Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. **Project name**: praav-uk-auth
4. Click "Create"

### 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: praav.uk
   - **User support email**: your email
   - **App logo**: (optional, can add later)
   - **Developer contact**: your email
5. Click "Save and Continue"
6. **Scopes**: Click "Save and Continue" (default is fine)
7. **Test users**: Add your email for testing
8. Click "Save and Continue"

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: praav.uk Web Client
5. **Authorized JavaScript origins**:
   - `http://localhost:3002`
   - `https://your-project-ref.supabase.co`
6. **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click "Create"
8. **Save these credentials**:
   - Client ID
   - Client Secret

### 4. Configure Google OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Enable Google provider
5. Enter your Google credentials:
   - **Client ID**: (from step 3)
   - **Client Secret**: (from step 3)
6. Click "Save"

---

## Part 3: Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as the app type
4. Click "Next"
5. Fill in the details:
   - **App Name**: praav.uk
   - **App Contact Email**: your email
6. Click "Create App"

### 2. Add Facebook Login Product

1. In your app dashboard, find **Facebook Login** in the Products section
2. Click "Set Up"
3. Choose **Web** platform
4. **Site URL**: `http://localhost:3002`
5. Click "Save" and "Continue"

### 3. Configure OAuth Settings

1. In the left sidebar, go to **Facebook Login** → **Settings**
2. In **Valid OAuth Redirect URIs**, add:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
3. Click "Save Changes"

### 4. Get Facebook App Credentials

1. Go to **Settings** → **Basic** in the left sidebar
2. You'll find:
   - **App ID**: This is your Client ID
   - **App Secret**: Click "Show" to reveal (this is your Client Secret)
3. Copy both values

### 5. Configure Facebook OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Facebook** in the list
4. Enable Facebook provider
5. Enter your Facebook credentials:
   - **Facebook Client ID**: (your App ID)
   - **Facebook Client Secret**: (your App Secret)
6. Click "Save"

---

## Part 4: Configure Redirect URLs

### 1. Update Your Site URL in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3002`
   - Production: `https://praav.uk` (when deployed)
3. **Redirect URLs**: Add:
   ```
   http://localhost:3002/auth/callback
   http://localhost:3002/**
   ```
4. Click "Save"

---

## Part 5: Testing Authentication

### 1. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
cd ~/Desktop/praav.uk
npm run dev
```

### 2. Test the Signup Flow

1. Go to [http://localhost:3002/signup](http://localhost:3002/signup)
2. Try each authentication method:

#### Test Google OAuth:
1. Click "Continue with Google"
2. Select your Google account
3. Grant permissions
4. You should be redirected to `/dashboard`

#### Test Facebook OAuth:
1. Click "Continue with Facebook"
2. Log in with Facebook
3. Grant permissions
4. You should be redirected to `/dashboard`

#### Test Email Signup:
1. Fill in your details:
   - Full name
   - Email
   - Password (min 8 characters)
2. Click "Sign up with email"
3. Check your email for confirmation
4. Click the confirmation link
5. You should be redirected to `/dashboard`

---

## Part 6: Verify Users in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see your test users listed
3. Check their:
   - Email
   - Provider (google, facebook, or email)
   - Created timestamp
   - Confirmed status

---

## Troubleshooting

### "Authentication is not configured"

**Cause**: Supabase environment variables are missing

**Solution**:
1. Check that `.env.local` exists
2. Verify the values are correct
3. Restart the dev server

### "Invalid redirect URI"

**Cause**: The callback URL doesn't match what's configured

**Solution**:
1. Check Google/Facebook console redirect URIs
2. Ensure they match: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Check Supabase URL Configuration

### "Error 400: redirect_uri_mismatch" (Google)

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add exact redirect URI from Supabase
4. Wait 5 minutes for changes to propagate

### "URL Blocked: This redirect failed" (Facebook)

**Solution**:
1. Go to Facebook App → Facebook Login → Settings
2. Add the exact Supabase callback URL
3. Save changes

### Email confirmation not working

**Solution**:
1. Check Supabase → Authentication → Email Templates
2. Verify SMTP is configured (or use default)
3. Check spam folder
4. For development, you can disable email confirmation in Supabase → Authentication → Providers → Email

---

## Production Deployment

When deploying to production:

### 1. Update Environment Variables

Add to your production environment:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://praav.uk
```

### 2. Update OAuth Providers

**Google**:
- Add `https://praav.uk` to Authorized JavaScript origins
- Add production callback URL

**Facebook**:
- Add `https://praav.uk` to Valid OAuth Redirect URIs
- Add production callback URL

### 3. Update Supabase Site URL

- Set Site URL to `https://praav.uk`
- Add redirect URLs for production domain

---

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use Row Level Security (RLS)** in Supabase tables
3. **Rotate secrets** if they're ever exposed
4. **Enable email confirmation** for production
5. **Set up proper CORS** policies
6. **Use HTTPS** in production (enforced by Supabase)

---

## Next Steps

After authentication is working:

1. Create user profiles table in Supabase
2. Set up Row Level Security policies
3. Build the dashboard page
4. Add user profile management
5. Implement seller verification
6. Set up email notifications

---

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all redirect URLs match exactly
4. Review [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
5. Check [Google OAuth Guide](https://support.google.com/cloud/answer/6158849)
6. Check [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
