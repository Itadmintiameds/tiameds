import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { logout as logoutApi } from '@/../services/authService';
import useAuthStore from '@/context/userStore';

/**
 * Production-ready idle logout hook
 * 
 * Tracks user activity and automatically logs out after 30 minutes of inactivity.
 * Monitors: mouse movement, keyboard input, clicks, scroll, and touch events.
 * 
 * @param idleTimeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param enabled - Whether the idle logout is enabled (default: true)
 */
export const useIdleLogout = (
  idleTimeoutMinutes: number = 30,
  enabled: boolean = true
) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { logout: logoutStore } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  // Clear cookies helper
  const clearAuthCookies = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Clear all auth-related cookies
    // Try multiple approaches to ensure cookies are cleared regardless of domain/path settings
    const cookiesToClear = ['accessToken', 'refreshToken', 'token'];
    const domain = window.location.hostname;
    const paths = ['/', window.location.pathname];
    
    cookiesToClear.forEach((cookieName) => {
      // Clear with domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
      
      // Clear without domain (for localhost and exact domain matches)
      paths.forEach((path) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      });
      
      // Clear with secure flag if on HTTPS
      if (window.location.protocol === 'https:') {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
      }
    });
  }, []);

  // Handle logout process
  const handleLogout = useCallback(async () => {
    // Prevent multiple logout calls
    if (isLoggingOutRef.current) return;
    
    // Don't logout if already on login/register/password reset pages
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('/user-login') || 
        currentPath.includes('/onboarding') ||
        currentPath.includes('/forgot-password') ||
        currentPath.includes('/reset-password')
      ) {
        return;
      }
    }

    isLoggingOutRef.current = true;

    try {
      // Call backend logout endpoint to properly revoke tokens
      // This will clear HttpOnly cookies (accessToken, refreshToken) via Set-Cookie headers
      // and revoke the refresh token in the database
      try {
        await logoutApi();
        console.log('Idle logout: Backend logout API called successfully');
      } catch (error: any) {
        // If API call fails, still proceed with client-side cleanup
        // This can happen if the session is already expired or network error
        const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
        console.warn('Idle logout: Backend logout API call failed, proceeding with client-side cleanup:', errorMessage);
      }

      // Clear any remaining cookies on client side (fallback)
      clearAuthCookies();

      // Update auth store to clear user state
      logoutStore();

      // Redirect to login page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes('/user-login') && 
          !currentPath.includes('/register-user') &&
          !currentPath.includes('/forgot-password') &&
          !currentPath.includes('/reset-password')
        ) {
          router.push('/user-login');
        }
      }
    } catch (error) {
      console.error('Idle logout: Unexpected error during logout process:', error);
      // Even if there's an error, ensure cleanup happens
      clearAuthCookies();
      logoutStore();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes('/user-login') && 
          !currentPath.includes('/register-user') &&
          !currentPath.includes('/forgot-password') &&
          !currentPath.includes('/reset-password')
        ) {
          router.push('/user-login');
        }
      }
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [clearAuthCookies, logoutStore, router]);

  // Reset the idle timer
  const resetIdleTimer = useCallback(() => {
    if (!enabled || !isAuthenticated || isLoggingOutRef.current) return;

    // Don't track activity on login/register/password reset pages
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('/user-login') || 
        currentPath.includes('/onboarding') ||
        currentPath.includes('/forgot-password') ||
        currentPath.includes('/reset-password')
      ) {
        return;
      }
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, idleTimeoutMinutes * 60 * 1000);
  }, [enabled, isAuthenticated, idleTimeoutMinutes, handleLogout]);

  // Activity event handlers
  const handleActivity = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      // Clear timeout if disabled or not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Initialize timer on mount
    resetIdleTimer();

    // Activity events to monitor
    const events: (keyof WindowEventMap)[] = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Options for event listeners (passive for better performance)
    const options: AddEventListenerOptions = {
      passive: true,
      capture: true,
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, options);
      document.addEventListener(event, handleActivity, options);
    });

    // Also listen for visibility change (when user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to the tab, reset timer
        resetIdleTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Remove event listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, options);
        document.removeEventListener(event, handleActivity, options);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isAuthenticated, handleActivity, resetIdleTimer]);

  // Reset timer when authentication state changes
  useEffect(() => {
    if (isAuthenticated && enabled) {
      resetIdleTimer();
    } else if (!isAuthenticated) {
      // Clear timeout when user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isAuthenticated, enabled, resetIdleTimer]);
};

