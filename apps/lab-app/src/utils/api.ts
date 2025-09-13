import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// Function to handle logout and redirect
const handleTokenExpiration = () => {
  // Clear cookies
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Clear localStorage
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("ally-supports-cache");
  localStorage.removeItem("completedTestsDateFilter");
  localStorage.removeItem("userLabs");
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    // Check if we're not already on the login page to avoid infinite redirects
    if (!window.location.pathname.includes('/user-login') && !window.location.pathname.includes('/register-user')) {
      window.location.href = '/user-login';
    }
  }
};

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

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Retrieve token from cookies
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token'))?.split('=')[1];

    if (!token) {
      // If no token and trying to access protected route, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/user-login') && !window.location.pathname.includes('/register-user')) {
        handleTokenExpiration();
        return Promise.reject(new Error('No token found'));
      }
    }

    // Check if token is expired before making request
    if (token && isTokenExpired(token)) {
      handleTokenExpiration();
      return Promise.reject(new Error('Token expired'));
    }

    // Exclude /public/login and /public/register from adding Authorization header
    const excludedEndpoints = ['/public/login', '/public/register'];
    const isExcluded = excludedEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (token && !isExcluded) {
      // Add Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response, // Pass through successful responses
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleTokenExpiration();
      return Promise.reject(error);
    }
    
    // Handle network errors that might indicate authentication issues
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      // Don't redirect for network errors
    }
    
    return Promise.reject(error);
  }
);

export default api;
