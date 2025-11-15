import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const hasSession = (req: NextRequest) => {
  const accessToken = req.cookies.get('accessToken')?.value;
  const legacyToken = req.cookies.get('token')?.value;
  return Boolean(accessToken ?? legacyToken);
};

export function middleware(req: NextRequest) {
  const userIsAuthenticated = hasSession(req);
  const { pathname } = req.nextUrl;

  // Redirect authenticated users away from public auth pages
  if (userIsAuthenticated && (pathname === '/' || pathname === '/user-login' || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users attempting to hit protected routes
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (!userIsAuthenticated && isProtectedPath) {
    return NextResponse.redirect(new URL('/user-login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/user-login', '/login', '/dashboard/:path*', '/admin/:path*'],
};