import { useCallback } from 'react';
import { useUser } from '@/redux/hooks/useUser';
import { User, UserUpdate, PasswordUpdate, UserPreferences, UserActivity } from '@/apis/user';

interface UseUserApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // User profile
  getCurrentUser: () => Promise<User | null>;
  updateProfile: (data: UserUpdate) => Promise<User | null>;
  updatePassword: (data: PasswordUpdate) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  
  // User preferences
  getUserPreferences: () => Promise<UserPreferences | null>;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<UserPreferences | null>;
  
  // User activity
  getUserActivity: (page?: number, limit?: number) => Promise<UserActivity[] | null>;
  
  // Utilities
  clearError: () => void;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (number: number) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  calculateAccountAge: (createdAt: string) => number;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  validateEmail: (email: string) => boolean;
  validateUsername: (username: string) => { isValid: boolean; errors: string[] };
}

export const useUserApi = (): UseUserApiReturn => {
  const { 
    profile, 
    preferences, 
    activity, 
    isLoading, 
    error, 
    fetchProfile, 
    updateProfile, 
    changePassword, 
    deleteAccount, 
    fetchPreferences, 
    updatePreferences, 
    fetchActivity, 
    clearError 
  } = useUser();

  // User profile functions
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      await fetchProfile();
      return profile;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }, [fetchProfile, profile]);

  const updateProfileData = useCallback(async (data: UserUpdate): Promise<User | null> => {
    try {
      const result = await updateProfile(data);
      return result.payload as User;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }, [updateProfile]);

  const updatePasswordData = useCallback(async (data: PasswordUpdate): Promise<boolean> => {
    try {
      await changePassword(data);
      return true;
    } catch (error) {
      console.error('Failed to update password:', error);
      return false;
    }
  }, [changePassword]);

  const deleteAccountData = useCallback(async (): Promise<boolean> => {
    try {
      await deleteAccount();
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  }, [deleteAccount]);

  // User preferences functions
  const getUserPreferencesData = useCallback(async (): Promise<UserPreferences | null> => {
    try {
      await fetchPreferences();
      return preferences;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }, [fetchPreferences, preferences]);

  const updateUserPreferencesData = useCallback(async (data: Partial<UserPreferences>): Promise<UserPreferences | null> => {
    try {
      const result = await updatePreferences(data);
      return result.payload as UserPreferences;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return null;
    }
  }, [updatePreferences]);

  // User activity functions
  const getUserActivityData = useCallback(async (page: number = 1, limit: number = 10): Promise<UserActivity[] | null> => {
    try {
      await fetchActivity({ page, limit });
      return activity;
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return null;
    }
  }, [fetchActivity, activity]);

  // Utility functions
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  const formatNumber = useCallback((number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
  }, []);

  const formatPercentage = useCallback((value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  }, []);

  const calculateAccountAge = useCallback((createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }, []);

  const validatePassword = useCallback((password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateUsername = useCallback((username: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // User profile
    getCurrentUser,
    updateProfile: updateProfileData,
    updatePassword: updatePasswordData,
    deleteAccount: deleteAccountData,
    
    // User preferences
    getUserPreferences: getUserPreferencesData,
    updateUserPreferences: updateUserPreferencesData,
    
    // User activity
    getUserActivity: getUserActivityData,
    
    // Utilities
    clearError,
    formatDate,
    formatCurrency,
    formatNumber,
    formatPercentage,
    calculateAccountAge,
    validatePassword,
    validateEmail,
    validateUsername
  };
};