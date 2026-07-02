import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { VerifyOtpResponse } from '@/types/auth';

// Function to handle logout and redirect
const handleTokenExpiration = () => {
  // Clear any legacy token cookies
  if (typeof window !== 'undefined') {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Redirect to login page (but not from public auth pages)
    const currentPath = window.location.pathname;
    if (
      !currentPath.includes('/user-login') && 
      !currentPath.includes('/onboarding') &&
      !currentPath.includes('/forgot-password') &&
      !currentPath.includes('/reset-password') &&
      !currentPath.includes('/onboarding') &&
      !currentPath.includes('/verify-email')
    ) {
      window.location.href = '/user-login';
    }
  }
};

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true, // Critical: This ensures cookies (accessToken, refreshToken) are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate axios instance for refresh calls to avoid infinite loops
const refreshClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true, // Ensures refreshToken cookie is sent
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetryAxiosRequestConfig;
};

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
const failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
  while (failedQueue.length > 0) {
    const { resolve, reject, config } = failedQueue.shift() as FailedRequest;
    if (error) {
      reject(error);
    } else {
      // Retry the queued request - new accessToken cookie will be sent automatically
      resolve(api.request(config));
    }
  }
};

// Refresh tokens are rotated server-side on every use, so two concurrent
// /auth/refresh calls would cause the second (stale) one to fail with 401
// even though the session is fine. Every caller - the reactive 401 handler
// below and any proactive/silent refresh - must funnel through this single
// in-flight promise so only one refresh request is ever outstanding.
const performRefresh = (): Promise<void> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshClient
    .post<VerifyOtpResponse>('/auth/refresh')
    .then(() => {
      processQueue(null);
    })
    .catch((refreshError: unknown) => {
      processQueue(refreshError);
      throw refreshError;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

// Exposed so callers (e.g. proactive silent refresh) share the same
// dedup/queue logic as the reactive 401 handler below.
export const refreshAccessToken = () => performRefresh();

// Request interceptor - No need to manually add Authorization headers
// The backend reads accessToken from HttpOnly cookies automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // For all other endpoints, cookies (accessToken) will be sent automatically
    // via withCredentials: true. The backend will read the accessToken cookie.
    // No manual Authorization header needed since we're using HttpOnly cookies.

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handles automatic token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    // If there's no original request config, reject immediately
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isAuthError = status === 401 || status === 403;

    // Only attempt refresh for 401/403 errors and if we haven't already retried
    if (isAuthError && !originalRequest._retry) {
      // If this is a refresh request that failed, we're truly logged out
      if (originalRequest.url?.includes('/auth/refresh')) {
        handleTokenExpiration();
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      // Mark this request as retried and start refresh process
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - refreshToken cookie is sent automatically via withCredentials
        // Backend will set new accessToken and refreshToken cookies in the response
        await performRefresh();

        // Refresh successful - new cookies are set automatically by the browser.
        // Retry the original request - new accessToken cookie will be sent automatically
        return api.request(originalRequest);
      } catch (refreshError: unknown) {
        // Refresh failed - check if it's because refreshToken is missing/expired
        let refreshStatus: number | undefined;
        if (typeof refreshError === 'object' && refreshError !== null) {
          const apiError = refreshError as { response?: { status?: number } };
          refreshStatus = apiError.response?.status;
        }

        // Only redirect to login if refresh actually failed (not network errors)
        if (refreshStatus === 401 || refreshStatus === 403) {
          // Refresh token is invalid/expired - redirect to login
          handleTokenExpiration();
        }
        // Network or other error - don't redirect, just reject.
        // This allows the UI to handle the error appropriately.

        return Promise.reject(refreshError);
      }
    }
    // For non-auth errors or already retried requests, reject normally
    
    return Promise.reject(error);
  }
);

export default api;
