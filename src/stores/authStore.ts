import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi, LoginCredentials, apiClient } from '@/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

// Mock user data for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@forgekdp.com',
    name: 'John Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['unlimited_books', 'analytics', 'priority_support', 'custom_branding', 'api_access']
    }
  },
  {
    id: '2',
    email: 'assistant@forgekdp.com',
    name: 'Jane Assistant',
    role: 'assistant',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=32&h=32&fit=crop&crop=face',
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['5_books_per_month', 'basic_analytics', 'email_support']
    }
  },
  {
    id: '3',
    email: 'marketer@forgekdp.com',
    name: 'Mike Marketer',
    role: 'marketer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=32&h=32&fit=crop&crop=face',
    subscription: {
      plan: 'pro',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['unlimited_books', 'advanced_analytics', 'priority_support', 'custom_branding', 'api_access']
    }
  },
  {
    id: '4',
    email: 'guest@forgekdp.com',
    name: 'Guest User',
    role: 'guest',
    subscription: {
      plan: 'free',
      status: 'active',
      features: ['1_book_per_month', 'basic_templates', 'community_support']
    }
  }
];

// Auto-login for development - logs in as admin by default
const devAutoLogin = () => {
  const adminUser = mockUsers.find(u => u.role === 'admin');
  if (adminUser) {
    return {
      user: adminUser,
      isAuthenticated: true,
      isLoading: false
    };
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...devAutoLogin(),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const credentials: LoginCredentials = { email, password };
          const response = await authApi.login(credentials);
          
          // Store the token in localStorage
          if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
          }
          
          // Set user data from response
          const user = response.data.user || {
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0],
            role: 'user'
          };
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw new Error('Login failed');
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        
        try {
          // Redirect to Google OAuth
          window.location.href = `${apiClient.defaults.baseURL}/auth/google/login`;
        } catch (error) {
          set({ isLoading: false });
          throw new Error('Google login failed');
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          // Clear token and reset state
          localStorage.removeItem('access_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
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
