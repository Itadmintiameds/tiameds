"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { refreshAccessToken } from '@/utils/api';

// Access tokens are 15-minute-TTL HttpOnly cookies (see backend_jwt.md).
// Refreshing every 10 minutes keeps the cookie alive while the user is
// authenticated, so sessions last the full 30-minute idle window instead of
// depending on a reactive refresh firing exactly right on the next API call.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const PUBLIC_PATHS = ['/user-login', '/onboarding', '/forgot-password', '/reset-password'];

/**
 * Global component that keeps the access token cookie fresh across the app.
 * This component should be placed at the root level of your app.
 */
const TokenExpirationHandler = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    const silentRefresh = async () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (PUBLIC_PATHS.some((path) => currentPath.includes(path))) return;
      }

      try {
        await refreshAccessToken();
      } catch (error: unknown) {
        const status =
          typeof error === 'object' && error !== null
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        // Only force logout if the refresh token itself is invalid/expired.
        // Network errors are ignored - the next real API call will retry.
        if (status === 401 || status === 403) {
          logout();
          router.push('/user-login');
        }
      }
    };

    const interval = setInterval(silentRefresh, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout, router]);

  // This component doesn't render anything
  return null;
};

export default TokenExpirationHandler;
