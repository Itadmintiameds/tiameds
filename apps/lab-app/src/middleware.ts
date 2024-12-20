import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Get the token from cookies
  const token = req.cookies.get('token');

  // Log the request URL and token for debugging
  console.log('Request URL:', req.url);
  // console.log('Token:', token);

  // If token is not present, redirect to the login page
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed if token exists
  return NextResponse.next();
}

export const config = {
  // Define which routes the middleware should apply to
  matcher: ['/dashboard/:path*', '/admin/:path*'], // Update paths as needed
};
