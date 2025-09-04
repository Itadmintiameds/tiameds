"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Global component to handle token expiration across the entire app
 * This component should be placed at the root level of your app
 */
const TokenExpirationHandler = () => {
  const { checkTokenExpiration, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token expiration when the component mounts
    checkTokenExpiration();

    // Set up periodic checking (every 2 minutes for more responsive handling)
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 2 * 60 * 1000); // 2 minutes

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [checkTokenExpiration, isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default TokenExpirationHandler;
