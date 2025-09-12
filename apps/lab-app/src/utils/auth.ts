import { toast } from 'react-toastify';
import useAuthStore from '@/context/userStore';
import { logout as logoutApi } from '@/../services/authService';

export const handleLogout = async () => {
  const logout = useAuthStore.getState().logout;
  
  try {
    // Call logout API first
    await logoutApi();
    
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
  } catch (error) {
    // Even if API call fails, we should still clear local state
    console.warn('Logout API failed, but clearing local state:', error);
    
    toast.warning("Logged out locally (server logout failed)", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
  } finally {
    // Always clear local state regardless of API success/failure
    logout();
    
    // Redirect to login page
    window.location.replace("/user-login");
  }
};
