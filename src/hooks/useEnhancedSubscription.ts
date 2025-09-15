import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/api/client';

// Types
interface SubscriptionStatus {
  has_subscription: boolean;
  plan_type: string;
  status?: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  restrictions: string[];
  permissions: Record<string, any>;
  can_generate_books: boolean;
  can_upload_books: boolean;
  can_view_analytics: boolean;
  can_manage_organization: boolean;
  can_manage_sub_users: boolean;
}

interface PermissionCheckRequest {
  permission: string;
}

interface PermissionCheckResponse {
  has_permission: boolean;
  reason: string;
  permission: string;
  user_id: number;
}

interface UsageLimitRequest {
  usage_type: string;
  increment?: boolean;
}

interface UsageLimitResponse {
  can_use: boolean;
  usage_type: string;
  details: Record<string, any>;
  user_id: number;
}

interface OrganizationInfo {
  id: number;
  name: string;
  slug: string;
  description?: string;
  owner_id: number;
  created_at: string;
}

interface SubUser {
  id: number;
  email: string;
  username: string;
  role: string;
  is_owner: boolean;
  created_at: string;
}

interface OrganizationCreateRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
}

interface SubUserInviteRequest {
  email: string;
  username: string;
  role: string;
}

interface SubUserInviteResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  status: string;
  message: string;
}

interface SubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features: string[];
  limits: Record<string, any>;
  popular: boolean;
  active: boolean;
}

export const useEnhancedSubscription = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get subscription status
  const getSubscriptionStatus = useCallback(async (): Promise<SubscriptionStatus> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription/my-subscription/status');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get subscription status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check permission
  const checkPermission = useCallback(async (permission: string): Promise<PermissionCheckResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/check-permission', {
        permission
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to check permission';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check usage limit
  const checkUsageLimit = useCallback(async (
    usageType: string, 
    increment: boolean = false
  ): Promise<UsageLimitResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/check-usage-limit', {
        usage_type: usageType,
        increment
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to check usage limit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get available plans
  const getAvailablePlans = useCallback(async (): Promise<SubscriptionPlan[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription/plans');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get available plans';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create organization
  const createOrganization = useCallback(async (data: OrganizationCreateRequest): Promise<OrganizationInfo> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/create-organization', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get organization info
  const getMyOrganization = useCallback(async (): Promise<OrganizationInfo> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription/my-organization');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get organization info';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get organization users
  const getOrganizationUsers = useCallback(async (): Promise<SubUser[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription/my-organization/users');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to get organization users';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Invite sub-user
  const inviteSubUser = useCallback(async (data: SubUserInviteRequest): Promise<SubUserInviteResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/invite-sub-user', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to invite sub-user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update sub-user role
  const updateSubUserRole = useCallback(async (
    userId: number, 
    role: string
  ): Promise<SubUser> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.put(`/subscription/sub-user/${userId}/role`, {
        role
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update sub-user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove sub-user
  const removeSubUser = useCallback(async (userId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/subscription/sub-user/${userId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to remove sub-user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility functions
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    try {
      const response = await checkPermission(permission);
      return response.has_permission;
    } catch {
      return false;
    }
  }, [checkPermission]);

  const canPerformAction = useCallback(async (action: string): Promise<{ can: boolean; reason: string }> => {
    try {
      const response = await checkPermission(action);
      return { can: response.has_permission, reason: response.reason };
    } catch (err: any) {
      return { can: false, reason: err.message };
    }
  }, [checkPermission]);

  const canUseFeature = useCallback(async (usageType: string): Promise<{ can: boolean; details: any }> => {
    try {
      const response = await checkUsageLimit(usageType, false);
      return { can: response.can_use, details: response.details };
    } catch (err: any) {
      return { can: false, details: { error: err.message } };
    }
  }, [checkUsageLimit]);

  const incrementUsage = useCallback(async (usageType: string): Promise<{ success: boolean; details: any }> => {
    try {
      const response = await checkUsageLimit(usageType, true);
      return { success: response.can_use, details: response.details };
    } catch (err: any) {
      return { success: false, details: { error: err.message } };
    }
  }, [checkUsageLimit]);

  // Permission checking helpers
  const canGenerateBooks = useCallback(async (): Promise<boolean> => {
    return hasPermission('books.create');
  }, [hasPermission]);

  const canUploadBooks = useCallback(async (): Promise<boolean> => {
    return hasPermission('books.upload');
  }, [hasPermission]);

  const canViewAnalytics = useCallback(async (): Promise<boolean> => {
    return hasPermission('analytics.view');
  }, [hasPermission]);

  const canManageOrganization = useCallback(async (): Promise<boolean> => {
    return hasPermission('organization.create');
  }, [hasPermission]);

  const canManageSubUsers = useCallback(async (): Promise<boolean> => {
    return hasPermission('users.manage');
  }, [hasPermission]);

  const canAccessAPI = useCallback(async (): Promise<boolean> => {
    return hasPermission('api.access');
  }, [hasPermission]);

  // Usage checking helpers
  const canCreateBook = useCallback(async (): Promise<{ can: boolean; details: any }> => {
    return canUseFeature('books_created');
  }, [canUseFeature]);

  const createBook = useCallback(async (): Promise<{ success: boolean; details: any }> => {
    return incrementUsage('books_created');
  }, [incrementUsage]);

  const canMakeAPICall = useCallback(async (): Promise<{ can: boolean; details: any }> => {
    return canUseFeature('api_calls');
  }, [canUseFeature]);

  const makeAPICall = useCallback(async (): Promise<{ success: boolean; details: any }> => {
    return incrementUsage('api_calls');
  }, [incrementUsage]);

  return {
    // State
    isLoading,
    error,
    
    // Core functions
    getSubscriptionStatus,
    checkPermission,
    checkUsageLimit,
    getAvailablePlans,
    
    // Organization management
    createOrganization,
    getMyOrganization,
    getOrganizationUsers,
    inviteSubUser,
    updateSubUserRole,
    removeSubUser,
    
    // Utility functions
    hasPermission,
    canPerformAction,
    canUseFeature,
    incrementUsage,
    
    // Permission helpers
    canGenerateBooks,
    canUploadBooks,
    canViewAnalytics,
    canManageOrganization,
    canManageSubUsers,
    canAccessAPI,
    
    // Usage helpers
    canCreateBook,
    createBook,
    canMakeAPICall,
    makeAPICall,
    
    // Clear error
    clearError: () => setError(null)
  };
};
