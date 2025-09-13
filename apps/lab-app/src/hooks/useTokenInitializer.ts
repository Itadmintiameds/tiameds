import { useEffect } from 'react';
import useAuthStore from '@/context/userStore';

// Hook to initialize token from cookies on app load
export const useTokenInitializer = () => {
  const initializeToken = useAuthStore((state) => state.initializeToken);

  useEffect(() => {
    // Initialize token from cookies when component mounts
    initializeToken();
  }, [initializeToken]);
};
