import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
const adminRoutes = ['/dashboard', '/admin']; // Routes that require admin/superuser role
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

interface TokenPayload {
  exp?: number;
  sub?: string;
  type?: string;
  role?: string;
  is_superuser?: boolean;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    // Basic JWT token structure check
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    // If we can't decode the token, consider it invalid
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  // Check if token has expiry and if it's expired
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  // If no expiry, assume it's valid for basic check
  return false;
}

function isAdminUser(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;

  // Check if user is superuser or has admin role
  return payload.is_superuser === true || payload.role === 'admin';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and user role from cookies (we'll use cookies for server-side checks)
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  // Check if token exists and is not expired
  const isAuthenticated = token && !isTokenExpired(token);
  
  // Check if user has admin privileges
  const hasAdminAccess = userRole === 'superuser' || userRole === 'admin';

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path requires admin access
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    // Create login URL with redirect parameter
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // Create redirect response
    const response = NextResponse.redirect(loginUrl);

    // If token exists but is expired, clear it
    if (token && isTokenExpired(token)) {
      response.cookies.set('auth-token', '', {
        path: '/',
        expires: new Date(0),
      });
    }

    return response;
  }

  // Redirect non-admin users from admin routes to home page
  if (isAdminRoute && isAuthenticated && !hasAdminAccess) {
    console.warn('Non-admin user attempted to access admin route:', pathname, 'Role:', userRole);
    return NextResponse.redirect(new URL('/exampapers', request.url));
  }

  // Redirect authenticated users from auth routes to dashboard  
  if (isAuthRoute && isAuthenticated) {
    // Check if there's a redirect parameter
    const redirectUrl = request.nextUrl.searchParams.get('redirect');

    // Prevent redirect loops: don't redirect to auth routes
    const isRedirectToAuthRoute = redirectUrl && authRoutes.some(route =>
      redirectUrl.startsWith(route)
    );

    const targetUrl = redirectUrl && redirectUrl.startsWith('/') && !isRedirectToAuthRoute
      ? redirectUrl
      : '/dashboard';

    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // response.headers.set(
  //   'Content-Security-Policy',
  //   "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  // );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
