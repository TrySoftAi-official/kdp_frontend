import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from './useAuthApi';
import { queryKeys } from '@/lib/queryClient';
import { 
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

export const useAuthQuery = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // Get current user query
  const useCurrentUser = () => {
    return useQuery({
      queryKey: queryKeys.auth.currentUser,
      queryFn: () => authApi.getCurrentUser(),
      enabled: authApi.isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Login mutation
  const useLogin = () => {
    return useMutation({
      mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
      onSuccess: (data) => {
        if (data) {
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Register mutation
  const useRegister = () => {
    return useMutation({
      mutationFn: (data: RegisterData) => authApi.register(data),
      onSuccess: (data) => {
        if (data) {
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Logout mutation
  const useLogout = () => {
    return useMutation({
      mutationFn: () => authApi.logout(),
      onSuccess: () => {
        // Clear all cached data on logout
        queryClient.clear();
      },
    });
  };

  // Refresh token mutation
  const useRefreshToken = () => {
    return useMutation({
      mutationFn: () => authApi.refreshToken(),
      onSuccess: (success) => {
        if (success) {
          // Invalidate user data to refetch with new token
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Forgot password mutation
  const useForgotPassword = () => {
    return useMutation({
      mutationFn: (data: PasswordResetRequest) => authApi.forgotPassword(data),
    });
  };

  // Reset password mutation
  const useResetPassword = () => {
    return useMutation({
      mutationFn: (data: PasswordResetData) => authApi.resetPassword(data),
    });
  };

  // Request passwordless login mutation
  const useRequestPasswordlessLogin = () => {
    return useMutation({
      mutationFn: (data: PasswordlessLoginRequest) => authApi.requestPasswordlessLogin(data),
    });
  };

  // Passwordless login mutation
  const usePasswordlessLogin = () => {
    return useMutation({
      mutationFn: (data: PasswordlessLoginData) => authApi.passwordlessLogin(data),
      onSuccess: (data) => {
        if (data) {
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Get Google auth URL query
  const useGoogleAuthUrl = () => {
    return useQuery({
      queryKey: ['auth', 'google', 'url'],
      queryFn: () => authApi.getGoogleAuthUrl(),
      enabled: false, // Only fetch when explicitly called
    });
  };

  // Google login mutation
  const useGoogleLogin = () => {
    return useMutation({
      mutationFn: (data: GoogleOAuthRequest) => authApi.googleLogin(data),
      onSuccess: (data) => {
        if (data) {
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Setup 2FA mutation
  const useSetup2FA = () => {
    return useMutation({
      mutationFn: () => authApi.setup2FA(),
    });
  };

  // Verify 2FA mutation
  const useVerify2FA = () => {
    return useMutation({
      mutationFn: (data: TwoFactorVerify) => authApi.verify2FA(data),
    });
  };

  // Login with 2FA mutation
  const useLogin2FA = () => {
    return useMutation({
      mutationFn: (data: TwoFactorLogin) => authApi.login2FA(data),
      onSuccess: (data) => {
        if (data) {
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        }
      },
    });
  };

  // Disable 2FA mutation
  const useDisable2FA = () => {
    return useMutation({
      mutationFn: (data: TwoFactorVerify) => authApi.disable2FA(data),
    });
  };

  return {
    // Queries
    useCurrentUser,
    useGoogleAuthUrl,
    
    // Mutations
    useLogin,
    useRegister,
    useLogout,
    useRefreshToken,
    useForgotPassword,
    useResetPassword,
    useRequestPasswordlessLogin,
    usePasswordlessLogin,
    useGoogleLogin,
    useSetup2FA,
    useVerify2FA,
    useLogin2FA,
    useDisable2FA,
  };
};
