import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        const user = authApi.getCurrentUser();
        if (user) {
          set({ user, isAuthenticated: true });
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Get the current origin for the callback URL
          const currentOrigin = window.location.origin;
          const callbackUrl = `${currentOrigin}/auth/google/callback`;
          
          // Call the backend to get the Google OAuth URL with client_id
          const response = await fetch(`http://127.0.0.1:8000/auth/google/login?redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=689538806669-43m7n7tg2c3vfrmt527k6nr51no72tmj.apps.googleusercontent.com`);
          const data = await response.json();
          
          if (data.auth_url) {
            // Redirect to the Google OAuth URL provided by the backend
            window.location.href = data.auth_url;
          } else {
            throw new Error('Failed to get Google OAuth URL');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Google login failed';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with logout even if API call fails
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
