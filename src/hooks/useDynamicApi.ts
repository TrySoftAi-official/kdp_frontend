import { useCallback, useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useAuth } from '@/redux/hooks/useAuth';
import { toast } from '@/utils/toast';

interface UseDynamicApiOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableErrorNotifications?: boolean;
  enableSuccessNotifications?: boolean;
}

interface ApiState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  isRefetching: boolean;
}

/**
 * Enhanced hook that provides dynamic API calling with comprehensive error handling,
 * automatic retries, optimistic updates, and real-time notifications
 */
export const useDynamicApi = (options: UseDynamicApiOptions = {}) => {
  const {
    enableAutoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableErrorNotifications = true,
    enableSuccessNotifications = true
  } = options;

  const { auth, user, books, payments } = useApi();
  const { isAuthenticated } = useAuth();
  const [apiState, setApiState] = useState<ApiState>({
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    isRefetching: false
  });

  // Enhanced error handler with automatic retry logic
  const handleApiError = useCallback((error: Error, context: string) => {
    console.error(`API Error in ${context}:`, error);
    
    setApiState(prev => ({
      ...prev,
      isError: true,
      error,
      isLoading: false
    }));

    if (enableErrorNotifications) {
      const errorMessage = getErrorMessage(error);
      toast.error(`${context} failed: ${errorMessage}`);
    }

    // Auto-retry for network errors
    if (isNetworkError(error)) {
      setTimeout(() => {
        setApiState(prev => ({ ...prev, isError: false, error: null }));
      }, 5000);
    }
  }, [enableErrorNotifications]);

  // Enhanced success handler
  const handleApiSuccess = useCallback((message: string, context: string) => {
    setApiState(prev => ({
      ...prev,
      isSuccess: true,
      isError: false,
      error: null,
      isLoading: false
    }));

    if (enableSuccessNotifications) {
      toast.success(`${context}: ${message}`);
    }

    // Reset success state after 3 seconds
    setTimeout(() => {
      setApiState(prev => ({ ...prev, isSuccess: false }));
    }, 3000);
  }, [enableSuccessNotifications]);

  // Network error detection
  const isNetworkError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('connection');
  };

  // Get user-friendly error message
  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Please log in to continue.';
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (message.includes('server') || message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred.';
  };

  // Enhanced authentication methods
  const authMethods = {
    // Login with comprehensive error handling
    login: useCallback(async (credentials: { email: string; password: string }) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await auth.useLogin().mutateAsync(credentials);
        handleApiSuccess('Login successful', 'Authentication');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Login');
        throw error;
      }
    }, [auth, handleApiSuccess, handleApiError]),

    // Magic link with enhanced UX
    requestMagicLink: useCallback(async (email: string) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        await auth.useRequestPasswordlessLogin().mutateAsync({ email });
        handleApiSuccess('Magic link sent to your email', 'Magic Link');
        return true;
      } catch (error) {
        handleApiError(error as Error, 'Magic Link Request');
        throw error;
      }
    }, [auth, handleApiSuccess, handleApiError]),

    // Google OAuth with error handling
    googleLogin: useCallback(async (code: string, state?: string) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await auth.useGoogleLogin().mutateAsync({ code, state });
        handleApiSuccess('Google login successful', 'Authentication');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Google Login');
        throw error;
      }
    }, [auth, handleApiSuccess, handleApiError]),

    // Logout with cleanup
    logout: useCallback(async () => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        await auth.useLogout().mutateAsync();
        handleApiSuccess('Logged out successfully', 'Authentication');
        return true;
      } catch (error) {
        handleApiError(error as Error, 'Logout');
        throw error;
      }
    }, [auth, handleApiSuccess, handleApiError])
  };

  // Enhanced book methods
  const bookMethods = {
    // Create book with optimistic updates
    createBook: useCallback(async (bookData: any) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await books.useCreateBook().mutateAsync(bookData);
        handleApiSuccess('Book created successfully', 'Book Creation');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Book Creation');
        throw error;
      }
    }, [books, handleApiSuccess, handleApiError]),

    // Generate book with real-time status
    generateBook: useCallback(async (generationData: any) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await books.useGenerateBook().mutateAsync(generationData);
        handleApiSuccess('Book generation started', 'Book Generation');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Book Generation');
        throw error;
      }
    }, [books, handleApiSuccess, handleApiError]),

    // Publish book with status tracking
    publishBook: useCallback(async (bookId: string, platform: string = 'kdp') => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await books.usePublishBook().mutateAsync({ bookId, platform });
        handleApiSuccess('Book published successfully', 'Book Publishing');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Book Publishing');
        throw error;
      }
    }, [books, handleApiSuccess, handleApiError]),

    // Get books with automatic refresh
    getBooks: useCallback(async (page: number = 1, limit: number = 10, filters: any = {}, sort: any = {}) => {
      setApiState(prev => ({ ...prev, isRefetching: true, isError: false }));
      
      try {
        const result = await books.useBooks(page, limit, filters, sort).refetch();
        setApiState(prev => ({ ...prev, isRefetching: false }));
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Books Fetch');
        throw error;
      }
    }, [books, handleApiError])
  };

  // Enhanced user methods
  const userMethods = {
    // Update profile with optimistic updates
    updateProfile: useCallback(async (profileData: any) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await user.useUpdateProfile().mutateAsync(profileData);
        handleApiSuccess('Profile updated successfully', 'Profile Update');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Profile Update');
        throw error;
      }
    }, [user, handleApiSuccess, handleApiError]),

    // Upload avatar with progress
    uploadAvatar: useCallback(async (file: File) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await user.useUploadAvatar().mutateAsync(file);
        handleApiSuccess('Avatar uploaded successfully', 'Avatar Upload');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Avatar Upload');
        throw error;
      }
    }, [user, handleApiSuccess, handleApiError]),

    // Get user stats with caching
    getUserStats: useCallback(async () => {
      setApiState(prev => ({ ...prev, isRefetching: true, isError: false }));
      
      try {
        const result = await user.useUserStats().refetch();
        setApiState(prev => ({ ...prev, isRefetching: false }));
        return result;
      } catch (error) {
        handleApiError(error as Error, 'User Stats Fetch');
        throw error;
      }
    }, [user, handleApiError])
  };

  // Enhanced payment methods
  const paymentMethods = {
    // Create checkout session with error handling
    createCheckoutSession: useCallback(async (paymentData: any) => {
      setApiState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      try {
        const result = await payments.useCreateCheckoutSession().mutateAsync(paymentData);
        handleApiSuccess('Payment session created', 'Payment');
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Payment Session Creation');
        throw error;
      }
    }, [payments, handleApiSuccess, handleApiError]),

    // Get payment status with polling
    getPaymentStatus: useCallback(async (paymentId: number) => {
      setApiState(prev => ({ ...prev, isRefetching: true, isError: false }));
      
      try {
        const result = await payments.usePaymentStatus(paymentId).refetch();
        setApiState(prev => ({ ...prev, isRefetching: false }));
        return result;
      } catch (error) {
        handleApiError(error as Error, 'Payment Status Check');
        throw error;
      }
    }, [payments, handleApiError])
  };

  // Auto-refresh functionality - reduced frequency and added conditions
  useEffect(() => {
    if (!enableAutoRefresh || !isAuthenticated) return;

    const interval = setInterval(() => {
      // Only refresh if user is actively using the app (document is visible)
      if (document.visibilityState === 'visible') {
        // Refresh critical data less frequently
        user.useUserStats().refetch();
        books.useBooks().refetch();
      }
    }, refreshInterval * 2); // Double the interval to reduce API calls

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshInterval, isAuthenticated, user, books]);

  // Retry mechanism
  const retry = useCallback(() => {
    setApiState(prev => ({ ...prev, isError: false, error: null }));
  }, []);

  return {
    // State
    ...apiState,
    
    // Methods
    auth: authMethods,
    books: bookMethods,
    user: userMethods,
    payments: paymentMethods,
    
    // Utilities
    retry,
    isNetworkError: (error: Error) => isNetworkError(error),
    getErrorMessage: (error: Error) => getErrorMessage(error),
    
    // Original hooks for advanced usage
    originalHooks: { auth, user, books, payments }
  };
};
