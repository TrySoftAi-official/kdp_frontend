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
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        console.log('AuthStore: Initializing authentication state');
        const user = authApi.getCurrentUser();
        console.log('AuthStore: Retrieved user from storage:', user);
        if (user) {
          set({ user, isAuthenticated: true });
          console.log('AuthStore: User authenticated on initialization');
        } else {
          console.log('AuthStore: No user found in storage');
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Call the backend to get the Google OAuth URL
          const response = await fetch(`http://127.0.0.1:8000/auth/google/login`);
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
        console.log('AuthStore: Setting user and authentication state:', user);
        set({ user, isAuthenticated: true, error: null });
        console.log('AuthStore: User and authentication state set successfully');
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
