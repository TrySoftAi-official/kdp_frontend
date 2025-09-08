import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  setTestUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      initializeAuth: async () => {
        const state = get();
        if (state.isInitialized) {
          console.log('AuthStore: Already initialized, skipping');
          return;
        }

        console.log('AuthStore: Initializing authentication state');
        set({ isLoading: true, error: null });
        
        try {
          // First try to get user from server
          const userData = await authApi.getCurrentUser();
          console.log('AuthStore: Retrieved user from server:', userData);
          
          // Check if we got an error response
          if (userData && typeof userData === 'object' && 'error' in userData) {
            console.log('AuthStore: Server returned error, using fallback');
            throw new Error(userData.error);
          }
          
          if (userData) {
            // Convert UserResponse to User format
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.username, // Map username to name
              role: userData.role,
              avatar: undefined // UserResponse doesn't have avatar
            };
            set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            console.log('AuthStore: User authenticated on initialization');
          } else {
            console.log('AuthStore: No user found');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('AuthStore: Failed to fetch user:', error);
          // Fallback to localStorage
          const localUser = authApi.getCurrentUser();
          console.log('AuthStore: Retrieved user from storage:', localUser);
          if (localUser) {
            set({ user: localUser, isAuthenticated: true, isLoading: false, isInitialized: true });
            console.log('AuthStore: User authenticated from storage');
          } else {
            console.log('AuthStore: No user found in storage');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          }
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
      },

      // Temporary function for testing - set a test user
      setTestUser: () => {
        const testUser = {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'guest' as const,
          avatar: undefined
        };
        console.log('AuthStore: Setting test user for development');
        set({ user: testUser, isAuthenticated: true, error: null });
        // Also set in localStorage for persistence
        authApi.setTokensDirectly('test-access-token', 'test-refresh-token', testUser);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // Don't persist isInitialized to avoid issues on page reload
      })
    }
  )
);
