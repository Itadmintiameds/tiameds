import { toast } from 'react-toastify';

export const handleLogout = () => {
  toast.success("Logged out successfully", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
  });
  
  // Clear all localStorage data
  localStorage.clear();
  
  // Also specifically remove any additional items that might persist
  localStorage.removeItem("ally-supports-cache");
  localStorage.removeItem("completedTestsDateFilter");
  
  // Clear the authentication token cookie
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Redirect to login page
  window.location.replace("/user-login");
};
