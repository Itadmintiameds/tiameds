import { useEffect, useCallback } from 'react';
import useAuthStore from '@/context/userStore';

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 5 minute buffer)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    updateUser,
    initializeToken,
  } = useAuthStore();
  
  // Function to handle automatic logout on token expiration
  const handleTokenExpiration = useCallback(() => {
    logout();
    
    // Redirect to login page if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/user-login')) {
      window.location.href = '/user-login';
    }
  }, [logout]);

  // Initialize auth state on mount
  useEffect(() => {
    initializeToken();
  }, [initializeToken]);

  // Check token expiration on mount and periodically
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Check immediately
    if (isTokenExpired(token)) {
      handleTokenExpiration();
      return;
    }

    // Set up periodic checking (every 5 minutes)
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        handleTokenExpiration();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [token, isAuthenticated, handleTokenExpiration]);

  // Function to manually check token expiration
  const checkTokenExpiration = useCallback(() => {
    if (token && isTokenExpired(token)) {
      handleTokenExpiration();
      return true; // Token is expired
    }
    return false; // Token is valid
  }, [token, handleTokenExpiration]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    updateUser,
    checkTokenExpiration, // New function to manually check token
    // Helper methods
    isAdmin: user?.roles?.includes('ADMIN') || false,
    isSuperAdmin: user?.roles?.includes('SUPERADMIN') || false,
    isTechnician: user?.roles?.includes('TECHNICIAN') || false,
    isDeskRole: user?.roles?.includes('DESKROLE') || false,
  };
};
