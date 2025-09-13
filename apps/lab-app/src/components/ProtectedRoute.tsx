import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Protected Route component that checks authentication and redirects if needed
 * Use this to wrap any page that requires authentication
 */
const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, checkTokenExpiration, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check token expiration first
    const isExpired = checkTokenExpiration();
    if (isExpired) {
      return; // TokenExpirationHandler will handle the redirect
    }

    // If not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/user-login');
      return;
    }

    // Check role requirements if specified
    if (requiredRoles && user && !requiredRoles.some(role => user.roles?.includes(role))) {
      router.push('/user-login');
      return;
    }
  }, [isAuthenticated, user, checkTokenExpiration, isLoading, requiredRoles, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role requirements not met, don't render children (will redirect)
  if (requiredRoles && user && !requiredRoles.some(role => user.roles?.includes(role))) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
