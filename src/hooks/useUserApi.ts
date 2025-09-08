import { useState, useCallback } from 'react';
import UserService, {
  User,
  UserUpdate,
  PasswordUpdate,
  UserStats,
  UserPreferences,
  UserActivity,
  NotificationRequest,
  MaintenanceStatus,
  UserSubscription,
} from '@/api/userService';
import { getErrorMessage } from '@/api/client';
import { AxiosError } from 'axios';

interface UseUserApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // User profile
  getCurrentUser: () => Promise<User | null>;
  updateProfile: (data: UserUpdate) => Promise<User | null>;
  updatePassword: (data: PasswordUpdate) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  
  // User stats
  getUserStats: () => Promise<UserStats | null>;
  
  // User preferences
  getUserPreferences: () => Promise<UserPreferences | null>;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<UserPreferences | null>;
  
  // User activity
  getUserActivity: (limit?: number, offset?: number) => Promise<UserActivity[] | null>;
  
  // Notifications
  sendNotification: (data: NotificationRequest) => Promise<boolean>;
  
  // System status
  getMaintenanceStatus: () => Promise<MaintenanceStatus | null>;
  
  // Avatar management
  uploadAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: () => Promise<boolean>;
  
  // Subscription management
  getSubscription: () => Promise<UserSubscription | null>;
  updateSubscription: (plan: string) => Promise<UserSubscription | null>;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  getRoleLabel: (role: string) => string;
  getRoleColor: (role: string) => string;
  getStatusLabel: (status: boolean) => string;
  getStatusColor: (status: boolean) => string;
  getSubscriptionLabel: (plan: string) => string;
  getSubscriptionColor: (plan: string) => string;
  getSubscriptionStatusLabel: (status: string) => string;
  getSubscriptionStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (number: number) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  calculateAccountAge: (createdAt: string) => number;
  isSubscriptionActive: (subscription?: UserSubscription) => boolean;
  canAccessFeature: (user: User, feature: string) => boolean;
  getDefaultPreferences: () => UserPreferences;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  validateEmail: (email: string) => boolean;
  validateUsername: (username: string) => { isValid: boolean; errors: string[] };
}

export const useUserApi = (): UseUserApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getCurrentUser();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: UserUpdate): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.updateProfile(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (data: PasswordUpdate): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.updatePassword(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.deleteAccount();
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user stats
  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserStats();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user preferences
  const getUserPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserPreferences();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback(async (data: Partial<UserPreferences>): Promise<UserPreferences | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.updateUserPreferences(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user activity
  const getUserActivity = useCallback(async (limit: number = 50, offset: number = 0): Promise<UserActivity[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserActivity(limit, offset);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(async (data: NotificationRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.sendNotification(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get maintenance status
  const getMaintenanceStatus = useCallback(async (): Promise<MaintenanceStatus | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getMaintenanceStatus();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.uploadAvatar(file);
      return response.data.avatar_url;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete avatar
  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.deleteAvatar();
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get subscription
  const getSubscription = useCallback(async (): Promise<UserSubscription | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getSubscription();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update subscription
  const updateSubscription = useCallback(async (plan: string): Promise<UserSubscription | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await UserService.updateSubscription(plan);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.cancelSubscription();
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await UserService.reactivateSubscription();
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // User profile
    getCurrentUser,
    updateProfile,
    updatePassword,
    deleteAccount,
    
    // User stats
    getUserStats,
    
    // User preferences
    getUserPreferences,
    updateUserPreferences,
    
    // User activity
    getUserActivity,
    
    // Notifications
    sendNotification,
    
    // System status
    getMaintenanceStatus,
    
    // Avatar management
    uploadAvatar,
    deleteAvatar,
    
    // Subscription management
    getSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    
    // Utilities
    clearError,
    getRoleLabel: UserService.getRoleLabel,
    getRoleColor: UserService.getRoleColor,
    getStatusLabel: UserService.getStatusLabel,
    getStatusColor: UserService.getStatusColor,
    getSubscriptionLabel: UserService.getSubscriptionLabel,
    getSubscriptionColor: UserService.getSubscriptionColor,
    getSubscriptionStatusLabel: UserService.getSubscriptionStatusLabel,
    getSubscriptionStatusColor: UserService.getSubscriptionStatusColor,
    formatDate: UserService.formatDate,
    formatCurrency: UserService.formatCurrency,
    formatNumber: UserService.formatNumber,
    formatPercentage: UserService.formatPercentage,
    calculateAccountAge: UserService.calculateAccountAge,
    isSubscriptionActive: UserService.isSubscriptionActive,
    canAccessFeature: UserService.canAccessFeature,
    getDefaultPreferences: UserService.getDefaultPreferences,
    validatePassword: UserService.validatePassword,
    validateEmail: UserService.validateEmail,
    validateUsername: UserService.validateUsername,
  };
};
