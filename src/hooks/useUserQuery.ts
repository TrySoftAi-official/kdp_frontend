import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserApi } from './useUserApi';
import { queryKeys } from '@/lib/queryClient';
import { 
  UserUpdate, 
  PasswordUpdate, 
  UserPreferences, 
  NotificationRequest 
} from '@/api/userService';

export const useUserQuery = () => {
  const userApi = useUserApi();
  const queryClient = useQueryClient();

  // Get current user profile query
  const useUserProfile = () => {
    return useQuery({
      queryKey: queryKeys.user.profile,
      queryFn: () => userApi.getCurrentUser(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get user stats query
  const useUserStats = () => {
    return useQuery({
      queryKey: queryKeys.user.stats,
      queryFn: () => userApi.getUserStats(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get user preferences query
  const useUserPreferences = () => {
    return useQuery({
      queryKey: queryKeys.user.preferences,
      queryFn: () => userApi.getUserPreferences(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get user activity query
  const useUserActivity = (limit: number = 50, offset: number = 0) => {
    return useQuery({
      queryKey: queryKeys.user.activity(limit, offset),
      queryFn: () => userApi.getUserActivity(limit, offset),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  // Get user subscription query
  const useUserSubscription = () => {
    return useQuery({
      queryKey: queryKeys.user.subscription,
      queryFn: () => userApi.getSubscription(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get maintenance status query
  const useMaintenanceStatus = () => {
    return useQuery({
      queryKey: queryKeys.user.maintenanceStatus,
      queryFn: () => userApi.getMaintenanceStatus(),
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    });
  };

  // Update profile mutation
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: UserUpdate) => userApi.updateProfile(data),
      onSuccess: () => {
        // Invalidate user profile and stats
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
        queryClient.invalidateQueries({ queryKey: queryKeys.user.stats });
      },
    });
  };

  // Update password mutation
  const useUpdatePassword = () => {
    return useMutation({
      mutationFn: (data: PasswordUpdate) => userApi.updatePassword(data),
    });
  };

  // Delete account mutation
  const useDeleteAccount = () => {
    return useMutation({
      mutationFn: () => userApi.deleteAccount(),
      onSuccess: () => {
        // Clear all cached data on account deletion
        queryClient.clear();
      },
    });
  };

  // Update user preferences mutation
  const useUpdateUserPreferences = () => {
    return useMutation({
      mutationFn: (data: Partial<UserPreferences>) => userApi.updateUserPreferences(data),
      onSuccess: () => {
        // Invalidate user preferences
        queryClient.invalidateQueries({ queryKey: queryKeys.user.preferences });
      },
    });
  };

  // Send notification mutation
  const useSendNotification = () => {
    return useMutation({
      mutationFn: (data: NotificationRequest) => userApi.sendNotification(data),
    });
  };

  // Upload avatar mutation
  const useUploadAvatar = () => {
    return useMutation({
      mutationFn: (file: File) => userApi.uploadAvatar(file),
      onSuccess: () => {
        // Invalidate user profile to refetch with new avatar
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      },
    });
  };

  // Delete avatar mutation
  const useDeleteAvatar = () => {
    return useMutation({
      mutationFn: () => userApi.deleteAvatar(),
      onSuccess: () => {
        // Invalidate user profile to refetch without avatar
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      },
    });
  };

  // Update subscription mutation
  const useUpdateSubscription = () => {
    return useMutation({
      mutationFn: (plan: string) => userApi.updateSubscription(plan),
      onSuccess: () => {
        // Invalidate subscription data
        queryClient.invalidateQueries({ queryKey: queryKeys.user.subscription });
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      },
    });
  };

  // Cancel subscription mutation
  const useCancelSubscription = () => {
    return useMutation({
      mutationFn: () => userApi.cancelSubscription(),
      onSuccess: () => {
        // Invalidate subscription data
        queryClient.invalidateQueries({ queryKey: queryKeys.user.subscription });
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      },
    });
  };

  // Reactivate subscription mutation
  const useReactivateSubscription = () => {
    return useMutation({
      mutationFn: () => userApi.reactivateSubscription(),
      onSuccess: () => {
        // Invalidate subscription data
        queryClient.invalidateQueries({ queryKey: queryKeys.user.subscription });
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      },
    });
  };

  return {
    // Queries
    useUserProfile,
    useUserStats,
    useUserPreferences,
    useUserActivity,
    useUserSubscription,
    useMaintenanceStatus,
    
    // Mutations
    useUpdateProfile,
    useUpdatePassword,
    useDeleteAccount,
    useUpdateUserPreferences,
    useSendNotification,
    useUploadAvatar,
    useDeleteAvatar,
    useUpdateSubscription,
    useCancelSubscription,
    useReactivateSubscription,
  };
};
