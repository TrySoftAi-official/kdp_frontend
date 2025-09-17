import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import AuthService from '@/api/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  loginWithGoogle: () => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  completeMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  
  // Internal state management
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
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
          // First check if we have a valid token
          const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
          if (!token) {
            console.log('AuthStore: No token found, user not authenticated');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
            return;
          }
          
          // Validate token format (basic JWT structure check)
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.error('AuthStore: Invalid token format, clearing tokens');
            localStorage.removeItem('access_token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
            return;
          }

          // Check if we have stored user data first (faster UI response)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              // Validate stored user data structure
              if (user && user.id && user.email && user.role) {
                const userFormatted: User = {
                  id: user.id,
                  email: user.email,
                  name: user.username || user.name,
                  role: user.role,
                  avatar: undefined
                };
                set({ user: userFormatted, isAuthenticated: true, isLoading: false, isInitialized: true });
                console.log('AuthStore: User authenticated from storage');
                
                // Refresh user data from server in background (non-blocking)
                AuthService.getCurrentUser().then(response => {
                  const userData = response.data;
                  if (userData && userData.id && userData.email && userData.role) {
                    const user: User = {
                      id: userData.id,
                      email: userData.email,
                      name: userData.username,
                      role: userData.role,
                      avatar: undefined
                    };
                    set({ user });
                    
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify({
                      id: userData.id,
                      email: userData.email,
                      username: userData.username,
                      role: userData.role,
                      status: true,
                      created_at: new Date().toISOString()
                    }));
                    console.log('AuthStore: User data refreshed from server');
                  }
                }).catch(error => {
                  console.log('AuthStore: Failed to refresh user data from server:', error);
                  // If it's a 401, the token might be expired but don't clear user data immediately
                  if (error instanceof Error && error.message.includes('401')) {
                    console.log('AuthStore: Token expired, will attempt refresh on next API call');
                  }
                });
                return;
              } else {
                console.error('AuthStore: Invalid stored user data structure, clearing');
                localStorage.removeItem('user');
              }
            } catch (parseError) {
              console.error('AuthStore: Failed to parse stored user:', parseError);
              localStorage.removeItem('user');
            }
          }

          // If no stored user, try to get from server
          console.log('AuthStore: Fetching user data from server');
          const response = await AuthService.getCurrentUser();
          const userData = response.data;
          
          if (userData && userData.id && userData.email && userData.role) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.username,
              role: userData.role,
              avatar: undefined
            };
            
            // Store user data in localStorage for future use
            localStorage.setItem('user', JSON.stringify({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              role: userData.role,
              status: true,
              created_at: new Date().toISOString()
            }));
            
            set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            console.log('AuthStore: User authenticated and data stored');
          } else {
            console.log('AuthStore: Invalid user data received from server');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('AuthStore: Authentication initialization failed:', error);
          
          // Clear invalid tokens and user data on authentication failure
          localStorage.removeItem('access_token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Call AuthService to get the Google OAuth URL
          const response = await AuthService.getGoogleAuthUrl();
          const { auth_url } = response.data;
          
          if (auth_url) {
            // Redirect to the Google OAuth URL provided by the backend
            window.location.href = auth_url;
          } else {
            throw new Error('Failed to get Google OAuth URL');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Google login failed';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      requestMagicLink: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.requestPasswordlessLogin({ email });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      completeMagicLink: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.passwordlessLogin({ token });
          const { access_token, refresh_token, user } = response.data;
          
          if (access_token && refresh_token && user) {
            // Store tokens and user data
            AuthService.storeTokens({ access_token, refresh_token });
            AuthService.storeUser(user);
            
            // Convert UserResponse to User format
            const userFormatted: User = {
              id: user.id,
              email: user.email,
              name: user.username,
              role: user.role,
              avatar: undefined
            };
            
            set({ 
              user: userFormatted, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error('Invalid response from magic link verification');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Magic link verification failed';
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with logout even if API call fails
        } finally {
          // Preserve KDP session during logout
          const kdpSession = localStorage.getItem('amazon_kdp_session');
          
          // Clear all authentication data
          localStorage.removeItem('access_token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Restore KDP session if it existed
          if (kdpSession) {
            localStorage.setItem('amazon_kdp_session', kdpSession);
          }
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isInitialized: true,
            error: null
          });
        }
      },

      setUser: (user: User) => {
        console.log('AuthStore: Setting user and authentication state:', user);
        set({ user, isAuthenticated: true, error: null });
        console.log('AuthStore: User and authentication state set successfully');
        
        // Store user data in localStorage for persistence
        const userResponse = {
          id: user.id,
          email: user.email,
          username: user.name || user.email.split('@')[0],
          role: user.role,
          status: true,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userResponse));
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


      refreshUserData: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.user) {
          console.log('AuthStore: No authenticated user to refresh');
          return;
        }

        try {
          const response = await AuthService.getCurrentUser();
          const userData = response.data;
          
          if (userData && userData.id && userData.email && userData.role) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.username,
              role: userData.role,
              avatar: undefined
            };
            set({ user });
            
            // Update localStorage with fresh data in proper format
            localStorage.setItem('user', JSON.stringify({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              role: userData.role,
              status: true,
              created_at: new Date().toISOString()
            }));
            
            console.log('AuthStore: User data refreshed from server');
          } else {
            console.error('AuthStore: Invalid user data received during refresh');
          }
        } catch (error) {
          console.error('AuthStore: Failed to refresh user data:', error);
          // Don't clear user data on refresh failure, just log the error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // Don't persist isInitialized to avoid issues on page reload
      }),
      onRehydrateStorage: () => (state) => {
        // Automatically initialize auth when store is rehydrated
        if (state && !state.isInitialized) {
          console.log('AuthStore: Auto-initializing on rehydration');
          state.initializeAuth();
        }
      }
    }
  )
);

// Auto-initialize auth store when it's first created
if (typeof window !== 'undefined') {
  // Only run on client side
  const store = useAuthStore.getState();
  if (!store.isInitialized) {
    console.log('AuthStore: Auto-initializing on first load');
    store.initializeAuth();
  }
}
