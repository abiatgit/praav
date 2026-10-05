import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect authenticated users from root to marketplace
  if (pathname === '/' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile?.onboarding_completed ? '/marketplace' : '/onboarding';
    return NextResponse.redirect(redirectUrl);
  }

  // Define public routes (accessible without authentication)
  const publicPaths = ['/', '/login', '/signup', '/auth/callback'];
  const isPublicPath = publicPaths.includes(pathname);

  // Allow public paths and static files
  if (isPublicPath || pathname.startsWith('/_next') || pathname.includes('.')) {
    return response;
  }

  // Protected routes require authentication
  const protectedPaths = ['/dashboard', '/onboarding', '/sell', '/settings'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path)) ||
                          pathname.match(/^\/listing\/[^\/]+\/edit$/);

  if (isProtectedPath && !user) {
    // Redirect to login if trying to access protected route without auth
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access login/signup, redirect to dashboard/onboarding
  if (user && (pathname === '/login' || pathname === '/signup')) {
    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile?.onboarding_completed ? '/marketplace' : '/onboarding';
    redirectUrl.searchParams.delete('redirect');
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
