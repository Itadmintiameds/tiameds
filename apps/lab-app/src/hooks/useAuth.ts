import useAuthStore from '@/context/userStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading, updateUser } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    updateUser,
    // Helper methods
    isAdmin: user?.roles?.includes('ADMIN') || false,
    isSuperAdmin: user?.roles?.includes('SUPERADMIN') || false,
    isTechnician: user?.roles?.includes('TECHNICIAN') || false,
    isDeskRole: user?.roles?.includes('DESKROLE') || false,
  };
};
