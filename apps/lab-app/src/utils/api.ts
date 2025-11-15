import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from 'axios';
import { LoginResponse } from '@/types/auth';

// Function to handle logout and redirect
const handleTokenExpiration = () => {
  // Clear cookies
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    // Check if we're not already on the login page to avoid infinite redirects
    if (!window.location.pathname.includes('/user-login') && !window.location.pathname.includes('/register-user')) {
      window.location.href = '/user-login';
    }
  }
};

const setAuthCookie = (token: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!token) {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return;
  }

  document.cookie = `token=${token}; path=/; secure; samesite=strict`;
};

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: RetryAxiosRequestConfig;
};

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig | RetryAxiosRequestConfig,
  token: string
) {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : AxiosHeaders.from(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
}

const processQueue = (error: any, token: string | null = null) => {
  while (failedQueue.length > 0) {
    const { resolve, reject, config } = failedQueue.shift() as FailedRequest;
    if (error) {
      reject(error);
      continue;
    }

    if (token) {
      setAuthorizationHeader(config, token);
    }

    resolve(api.request(config));
  }
};

// Add a request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Exclude /public/login and /public/register from adding Authorization header
    const excludedEndpoints = ['/public/login', '/public/register', '/auth/refresh'];
    const isExcluded = excludedEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isExcluded) {
      // Provide backwards compatibility if a legacy token cookie exists
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))?.split('=')[1];

      if (token) {
        setAuthorizationHeader(config, token);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    const status = error.response?.status;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        handleTokenExpiration();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post<LoginResponse>('/auth/refresh');
        const newToken = refreshResponse.data?.token ?? null;

        if (newToken) {
          setAuthCookie(newToken);
        }

        processQueue(null, newToken);

        if (newToken) {
          setAuthorizationHeader(originalRequest, newToken);
        }

        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        handleTokenExpiration();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


