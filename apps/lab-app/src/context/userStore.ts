import { create } from 'zustand';
import { LoginResponseData } from '../types/auth';
import { getCurrentUser } from '@/../services/authService';

interface AuthState {
  user: LoginResponseData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (userData: LoginResponseData, token?: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<LoginResponseData>) => void;
  initializeToken: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  (set, get) => ({
    // Initial state
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    // Actions
    login: (userData: LoginResponseData, token?: string | null) => {
      set({
        user: userData,
        token: token ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      // Preserve legacy cookie behavior when a token is provided
      if (token && typeof window !== 'undefined') {
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
      
      if (typeof window !== 'undefined') {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    updateUser: (userData: Partial<LoginResponseData>) => {
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        set({
          user: updatedUser
        });
      }
    },

    // Initialize user session using server-side cookies
    initializeToken: async () => {
      if (typeof window === 'undefined') {
        return;
      }

      set({ isLoading: true });

      try {
        const currentUser = await getCurrentUser();
        set({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
  })
);

export default useAuthStore;
