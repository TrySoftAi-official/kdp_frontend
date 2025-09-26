import { useState, useCallback } from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { 
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleOAuth,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  twoFactorLogin,
  passwordlessLogin,
  passwordlessVerify,
  getSecurityStatus,
  getAuditLogs,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse
} from '@/apis/auth';
import { getErrorMessage } from '@/apis/apiClient';
import { AxiosError } from 'axios';

interface UseAuthApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Authentication
  loginUser: (credentials: LoginRequest) => Promise<AuthResponse | null>;
  registerUser: (data: RegisterRequest) => Promise<AuthResponse | null>;
  logoutUser: () => Promise<boolean>;
  refreshUserToken: () => Promise<boolean>;
  
  // Password management
  forgotUserPassword: (email: string) => Promise<boolean>;
  resetUserPassword: (token: string, password: string) => Promise<boolean>;
  
  // Email verification
  verifyUserEmail: (token: string) => Promise<boolean>;
  
  // Google OAuth
  googleLogin: (data: any) => Promise<AuthResponse | null>;
  
  // Two-factor authentication
  setup2FA: () => Promise<any>;
  verify2FA: (data: any) => Promise<boolean>;
  login2FA: (data: any) => Promise<AuthResponse | null>;
  disable2FA: (data: any) => Promise<boolean>;
  
  // User management
  getCurrentUserData: () => Promise<UserResponse | null>;
  
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
  } = useAuth();

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
    clearAuthError();
  }, [clearAuthError]);

  // Authentication functions
  const loginUser = useCallback(async (credentials: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(credentials);
      
      if (response && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.username,
          role: response.user.role,
          avatar: undefined
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  const registerUser = useCallback(async (data: RegisterRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await register(data);
      
      if (response && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.username,
          role: response.user.role,
          avatar: undefined
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  const logoutUser = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logout();
      logoutStore();
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      // Still logout locally even if API call fails
      logoutStore();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [logoutStore]);

  const refreshUserToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await refreshToken();
      return !!response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Password management functions
  const forgotUserPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPassword({ email });
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetUserPassword = useCallback(async (token: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword({ token, password });
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Email verification functions
  const verifyUserEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyEmail({ token });
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google OAuth functions
  const googleLogin = useCallback(async (data: any): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await googleOAuth(data);
      
      if (response && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.username,
          role: response.user.role,
          avatar: undefined
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  // Two-factor authentication functions
  const setup2FA = useCallback(async (): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await setupTwoFactor();
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verify2FA = useCallback(async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyTwoFactor(data);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login2FA = useCallback(async (data: any): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await twoFactorLogin(data);
      
      if (response && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.username,
          role: response.user.role,
          avatar: undefined
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      setAuthError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAuthError]);

  const disable2FA = useCallback(async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await disableTwoFactor(data);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // User management functions
  const getCurrentUserData = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const response = await getCurrentUser();
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error as AxiosError);
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Authentication
    loginUser,
    registerUser,
    logoutUser,
    refreshUserToken,
    
    // Password management
    forgotUserPassword,
    resetUserPassword,
    
    // Email verification
    verifyUserEmail,
    
    // Google OAuth
    googleLogin,
    
    // Two-factor authentication
    setup2FA,
    verify2FA,
    login2FA,
    disable2FA,
    
    // User management
    getCurrentUserData,
    
    // Utilities
    clearError,
    isAuthenticated,
  };
};