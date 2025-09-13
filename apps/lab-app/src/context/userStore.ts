import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginResponseData } from '../types/auth';

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

interface AuthState {
  user: LoginResponseData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (userData: LoginResponseData, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<LoginResponseData>) => void;
  initializeToken: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (userData: LoginResponseData, token: string) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Store token in cookie only (not in localStorage or sessionStorage)
        if (typeof window !== 'undefined') {
          document.cookie = `token=${token}; path=/; secure; samesite=strict`;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Clear token from cookie only
        if (typeof window !== 'undefined') {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // Clear any other localStorage items
          localStorage.removeItem("ally-supports-cache");
          localStorage.removeItem("completedTestsDateFilter");
          // Clear lab-related localStorage items (consolidated into userLabs)
          localStorage.removeItem("userLabs");
          // Clear the auth-storage entry completely
          localStorage.removeItem("auth-storage");
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (userData: Partial<LoginResponseData>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      // Initialize token from cookie on app load
      initializeToken: () => {
        if (typeof window !== 'undefined') {
          const token = getCookie('token');
          if (token) {
            set({ token });
          }
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
        // Note: token is NOT persisted to localStorage for security
        // It's stored in sessionStorage instead
      }), // only persist these fields
    }
  )
);

export default useAuthStore;
