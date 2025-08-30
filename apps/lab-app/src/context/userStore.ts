import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginResponseData } from '../types/auth';

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
        
        // Also set token in cookie for API requests
        if (typeof window !== 'undefined') {
          document.cookie = `token=${token}; path=/;`;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Clear cookie
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
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }), // only persist these fields
    }
  )
);

export default useAuthStore;
