import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import AuthService, { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  GoogleOAuthRequest,
  PasswordResetRequest,
  PasswordResetData,
  PasswordlessLoginRequest,
  PasswordlessLoginData,
  TwoFactorVerify,
  TwoFactorLogin,
  UserResponse
} from '@/api/authService';
import { getErrorMessage } from '@/api/client';
import { AxiosError } from 'axios';

interface UseAuthApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse | null>;
  register: (data: RegisterData) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Password management
  forgotPassword: (data: PasswordResetRequest) => Promise<boolean>;
  resetPassword: (data: PasswordResetData) => Promise<boolean>;
  
  // Passwordless login
  requestPasswordlessLogin: (data: PasswordlessLoginRequest) => Promise<boolean>;
  passwordlessLogin: (data: PasswordlessLoginData) => Promise<AuthResponse | null>;
  
  // Google OAuth
  getGoogleAuthUrl: () => Promise<string | null>;
  googleLogin: (data: GoogleOAuthRequest) => Promise<AuthResponse | null>;
  
  // Two-factor authentication
  setup2FA: () => Promise<any>;
  verify2FA: (data: TwoFactorVerify) => Promise<boolean>;
  login2FA: (data: TwoFactorLogin) => Promise<AuthResponse | null>;
  disable2FA: (data: TwoFactorVerify) => Promise<boolean>;
  
  // User management
  getCurrentUser: () => Promise<UserResponse | null>;
  
  // Utilities
  clearError: () => void;
  isAuthenticated: boolean;
}

export const useAuthApi = (): UseAuthApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    user,
    isAuthenticated,
    setUser,
    setLoading,
    setError: setAuthError,
    clearError: clearAuthError,
    logout: logoutStore,
  } = useAuthStore();

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
    clearAuthError();
  }, [clearAuthError]);

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(credentials);
      const data = response.data;
      
      // Handle 2FA requirement
      if ('requires_2fa' in data && data.requires_2fa) {
        // Store temp token for 2FA completion
        localStorage.setItem('temp_token', data.temp_token);
        throw new Error('2FA_REQUIRED');
      }
      
      // Handle successful login
      if ('access_token' in data) {
        AuthService.storeTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        AuthService.storeUser(data.user);
        setUser(data.user);
        return data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.register(data);
      const authData = response.data;
      
      AuthService.storeTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });
      AuthService.storeUser(authData.user);
      setUser(authData.user);
      
      return authData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = AuthService.getStoredTokens();
      if (tokens.refreshToken) {
        await AuthService.logout({ refresh_token: tokens.refreshToken });
      }
    } catch (err) {
      // Log error but don't prevent logout
      console.error('Logout error:', err);
    } finally {
      AuthService.clearTokens();
      logoutStore();
      setIsLoading(false);
    }
  }, [logoutStore]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens.refreshToken) {
        return false;
      }
      
      const response = await AuthService.refresh({ refresh_token: tokens.refreshToken });
      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      AuthService.clearTokens();
      logoutStore();
      return false;
    }
  }, [logoutStore]);

  // Forgot password
  const forgotPassword = useCallback(async (data: PasswordResetRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.forgotPassword(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (data: PasswordResetData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.resetPassword(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request passwordless login
  const requestPasswordlessLogin = useCallback(async (data: PasswordlessLoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.requestPasswordlessLogin(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Passwordless login
  const passwordlessLogin = useCallback(async (data: PasswordlessLoginData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.passwordlessLogin(data);
      const authData = response.data;
      
      AuthService.storeTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });
      AuthService.storeUser(authData.user);
      setUser(authData.user);
      
      return authData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Get Google auth URL
  const getGoogleAuthUrl = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.getGoogleAuthUrl();
      return response.data.auth_url;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google login
  const googleLogin = useCallback(async (data: GoogleOAuthRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.googleLogin(data);
      const authData = response.data;
      
      AuthService.storeTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });
      AuthService.storeUser(authData.user);
      setUser(authData.user);
      
      return authData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Setup 2FA
  const setup2FA = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.setup2FA();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify 2FA
  const verify2FA = useCallback(async (data: TwoFactorVerify): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.verify2FA(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with 2FA
  const login2FA = useCallback(async (data: TwoFactorLogin): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login2FA(data);
      const authData = response.data;
      
      AuthService.storeTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });
      AuthService.storeUser(authData.user);
      setUser(authData.user);
      
      return authData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Disable 2FA
  const disable2FA = useCallback(async (data: TwoFactorVerify): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.disable2FA(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async (): Promise<UserResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = AuthService.getStoredUser();
      const isAuth = AuthService.isAuthenticated();
      
      if (isAuth && storedUser) {
        setUser(storedUser);
      } else if (isAuth) {
        // Try to get current user from API
        await getCurrentUser();
      }
    };
    
    initializeAuth();
  }, [setUser, getCurrentUser]);

  return {
    // State
    isLoading,
    error,
    
    // Auth actions
    login,
    register,
    logout,
    refreshToken,
    
    // Password management
    forgotPassword,
    resetPassword,
    
    // Passwordless login
    requestPasswordlessLogin,
    passwordlessLogin,
    
    // Google OAuth
    getGoogleAuthUrl,
    googleLogin,
    
    // Two-factor authentication
    setup2FA,
    verify2FA,
    login2FA,
    disable2FA,
    
    // User management
    getCurrentUser,
    
    // Utilities
    clearError,
    isAuthenticated,
  };
};
