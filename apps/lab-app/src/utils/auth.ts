import { toast } from 'react-toastify';
import useAuthStore from '@/context/userStore';

export const handleLogout = () => {
  const logout = useAuthStore.getState().logout;
  
  toast.success("Logged out successfully", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
  });
  
  // Use Zustand store to logout
  logout();
  
  // Redirect to login page
  window.location.replace("/user-login");
};
