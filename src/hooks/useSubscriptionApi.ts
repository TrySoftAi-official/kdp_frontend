import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import SubscriptionService, {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionStatus,
  SubscriptionCreateRequest,
  SubscriptionCreateResponse,
  SubscriptionUpgradeRequest,
  SubscriptionCancelRequest,
  SubscriptionUsageCheckRequest,
  SubscriptionUsageCheckResponse,
  SubscriptionBilling,
  UserSubscriptionWithPlanResponse,
  EnhancedSubscriptionStatus,
  PermissionCheckRequest,
  PermissionCheckResponse,
  UsageLimitRequest,
  UsageLimitResponse,
  OrganizationCreateRequest,
  OrganizationResponse,
  SubUserResponse,
  SubUserInviteRequest,
  SubUserInviteResponse,
  SubUserRoleUpdateRequest,
  CheckAccessResponse,
} from '@/api/subscriptionService';
import { getErrorMessage } from '@/lib/utils';

export interface UseSubscriptionApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Subscription Plans
  getSubscriptionPlans: (activeOnly?: boolean) => Promise<SubscriptionPlan[] | null>;
  
  // User Subscription
  getMySubscription: () => Promise<UserSubscriptionWithPlanResponse | null>;
  createSubscription: (data: SubscriptionCreateRequest) => Promise<SubscriptionCreateResponse | null>;
  getMySubscriptionStatus: () => Promise<SubscriptionStatus | null>;
  upgradeSubscription: (data: SubscriptionUpgradeRequest) => Promise<UserSubscription | null>;
  cancelSubscription: (data: SubscriptionCancelRequest) => Promise<UserSubscription | null>;
  
  // Usage and Limits
  checkUsageLimits: (data: SubscriptionUsageCheckRequest) => Promise<SubscriptionUsageCheckResponse | null>;
  getMyFeatures: () => Promise<Record<string, any> | null>;
  checkFeatureAccess: (feature: string) => Promise<boolean | null>;
  
  // Validation
  validateSubscriptionAccess: (action: string) => Promise<{ can_perform: boolean; message: string } | null>;
  checkAccess: (action: string) => Promise<CheckAccessResponse | null>;
  
  // Billing
  getBillingHistory: (limit?: number) => Promise<SubscriptionBilling[] | null>;
  
  // Stripe Sync
  syncMySubscription: () => Promise<{ success: boolean; message: string; subscription_id?: number; status?: string } | null>;
  getSyncStatus: () => Promise<{ total_users: number; users_with_subscriptions: number; subscription_status_breakdown: Record<string, number>; sync_needed: boolean } | null>;
  
  // Enhanced Subscription
  getEnhancedSubscriptionStatus: () => Promise<EnhancedSubscriptionStatus | null>;
  checkPermission: (data: PermissionCheckRequest) => Promise<PermissionCheckResponse | null>;
  checkUsageLimit: (data: UsageLimitRequest) => Promise<UsageLimitResponse | null>;
  
  // Organization Management
  createOrganization: (data: OrganizationCreateRequest) => Promise<OrganizationResponse | null>;
  getMyOrganization: () => Promise<OrganizationResponse | null>;
  getOrganizationUsers: () => Promise<SubUserResponse[] | null>;
  inviteSubUser: (data: SubUserInviteRequest) => Promise<SubUserInviteResponse | null>;
  updateSubUserRole: (userId: number, data: SubUserRoleUpdateRequest) => Promise<SubUserResponse | null>;
  removeSubUser: (userId: number) => Promise<boolean>;
  
  // Helper methods
  isSubscriptionActive: (subscription?: UserSubscription) => boolean;
  canAccessFeature: (features: Record<string, any>, feature: string) => boolean;
  getUsagePercentage: (current: number, limit?: number) => number;
  getUsageColor: (percentage: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (dateString: string) => string;
  getPlanLabel: (planId: string) => string;
  getPlanColor: (planId: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  getBillingCycleLabel: (cycle: string) => string;
  calculateSavings: (monthlyPrice: number, yearlyPrice: number) => number;
  getRecommendedPlan: (usage: number) => string;
  formatFileSize: (bytes: number) => string;
  getFeatureIcon: (feature: string) => string;
  getFeatureDescription: (feature: string) => string;
}

export const useSubscriptionApi = (): UseSubscriptionApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple cache to prevent redundant API calls
  const [cache, setCache] = useState<{
    subscription?: { data: any; timestamp: number };
    plans?: { data: any; timestamp: number };
  }>({});
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Subscription Plans
  const getSubscriptionPlans = useCallback(async (activeOnly: boolean = true): Promise<SubscriptionPlan[] | null> => {
    // Check cache first
    const cached = cache.plans;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getSubscriptionPlans(activeOnly);
      const plans = response.data.plans || response.data; // Handle both formats
      
      // Update cache
      setCache(prev => ({
        ...prev,
        plans: { data: plans, timestamp: Date.now() }
      }));
      
      return plans;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cache, CACHE_DURATION]);

  // User Subscription
  const getMySubscription = useCallback(async (): Promise<UserSubscriptionWithPlanResponse | null> => {
    // Check cache first
    const cached = cache.subscription;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getMySubscription();
      const subscriptionData = response.data;
      
      // Update cache
      setCache(prev => ({
        ...prev,
        subscription: { data: subscriptionData, timestamp: Date.now() }
      }));
      
      return subscriptionData;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cache, CACHE_DURATION]);

  const createSubscription = useCallback(async (data: SubscriptionCreateRequest): Promise<SubscriptionCreateResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 API: Creating subscription with data:', data);
      const response = await SubscriptionService.createSubscription(data);
      console.log('📋 API: Subscription creation response:', response);
      console.log('📋 API: Response data:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ API: Subscription creation error:', err);
      if (err instanceof AxiosError) {
        console.error('❌ API: Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
      }
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMySubscriptionStatus = useCallback(async (): Promise<SubscriptionStatus | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getMySubscriptionStatus();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upgradeSubscription = useCallback(async (data: SubscriptionUpgradeRequest): Promise<UserSubscription | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.upgradeSubscription(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (data: SubscriptionCancelRequest): Promise<UserSubscription | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.cancelSubscription(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Usage and Limits
  const checkUsageLimits = useCallback(async (data: SubscriptionUsageCheckRequest): Promise<SubscriptionUsageCheckResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.checkUsageLimits(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyFeatures = useCallback(async (): Promise<Record<string, any> | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getMyFeatures();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkFeatureAccess = useCallback(async (feature: string): Promise<boolean | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.checkFeatureAccess(feature);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validation
  const validateSubscriptionAccess = useCallback(async (action: string): Promise<{ can_perform: boolean; message: string } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.validateSubscriptionAccess(action);
      return {
        can_perform: response.data.can_perform,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAccess = useCallback(async (action: string): Promise<CheckAccessResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.checkAccess(action);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Billing
  const getBillingHistory = useCallback(async (limit: number = 10): Promise<SubscriptionBilling[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getBillingHistory(limit);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stripe Sync
  const syncMySubscription = useCallback(async (): Promise<{ success: boolean; message: string; subscription_id?: number; status?: string } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.syncMySubscription();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncStatus = useCallback(async (): Promise<{ total_users: number; users_with_subscriptions: number; subscription_status_breakdown: Record<string, number>; sync_needed: boolean } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getSyncStatus();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced Subscription
  const getEnhancedSubscriptionStatus = useCallback(async (): Promise<EnhancedSubscriptionStatus | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getEnhancedSubscriptionStatus();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPermission = useCallback(async (data: PermissionCheckRequest): Promise<PermissionCheckResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.checkPermission(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkUsageLimit = useCallback(async (data: UsageLimitRequest): Promise<UsageLimitResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.checkUsageLimit(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Organization Management
  const createOrganization = useCallback(async (data: OrganizationCreateRequest): Promise<OrganizationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.createOrganization(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyOrganization = useCallback(async (): Promise<OrganizationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getMyOrganization();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrganizationUsers = useCallback(async (): Promise<SubUserResponse[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.getOrganizationUsers();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const inviteSubUser = useCallback(async (data: SubUserInviteRequest): Promise<SubUserInviteResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.inviteSubUser(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSubUserRole = useCallback(async (userId: number, data: SubUserRoleUpdateRequest): Promise<SubUserResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await SubscriptionService.updateSubUserRole(userId, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeSubUser = useCallback(async (userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await SubscriptionService.removeSubUser(userId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper methods (delegated to service)
  const isSubscriptionActive = useCallback((subscription?: UserSubscription): boolean => {
    return SubscriptionService.isSubscriptionActive(subscription);
  }, []);

  const canAccessFeature = useCallback((features: Record<string, any>, feature: string): boolean => {
    return SubscriptionService.canAccessFeature(features, feature);
  }, []);

  const getUsagePercentage = useCallback((current: number, limit?: number): number => {
    return SubscriptionService.getUsagePercentage(current, limit);
  }, []);

  const getUsageColor = useCallback((percentage: number): string => {
    return SubscriptionService.getUsageColor(percentage);
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    return SubscriptionService.formatCurrency(amount, currency);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return SubscriptionService.formatDate(dateString);
  }, []);

  const getPlanLabel = useCallback((planId: string): string => {
    return SubscriptionService.getPlanLabel(planId);
  }, []);

  const getPlanColor = useCallback((planId: string): string => {
    return SubscriptionService.getPlanColor(planId);
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    return SubscriptionService.getStatusLabel(status);
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    return SubscriptionService.getStatusColor(status);
  }, []);

  const getBillingCycleLabel = useCallback((cycle: string): string => {
    return SubscriptionService.getBillingCycleLabel(cycle);
  }, []);

  const calculateSavings = useCallback((monthlyPrice: number, yearlyPrice: number): number => {
    return SubscriptionService.calculateSavings(monthlyPrice, yearlyPrice);
  }, []);

  const getRecommendedPlan = useCallback((usage: number): string => {
    return SubscriptionService.getRecommendedPlan(usage);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    return SubscriptionService.formatFileSize(bytes);
  }, []);

  const getFeatureIcon = useCallback((feature: string): string => {
    return SubscriptionService.getFeatureIcon(feature);
  }, []);

  const getFeatureDescription = useCallback((feature: string): string => {
    return SubscriptionService.getFeatureDescription(feature);
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Subscription Plans
    getSubscriptionPlans,
    
    // User Subscription
    getMySubscription,
    createSubscription,
    getMySubscriptionStatus,
    upgradeSubscription,
    cancelSubscription,
    
    // Usage and Limits
    checkUsageLimits,
    getMyFeatures,
    checkFeatureAccess,
    
    // Validation
    validateSubscriptionAccess,
    checkAccess,
    
    // Billing
    getBillingHistory,
    
    // Stripe Sync
    syncMySubscription,
    getSyncStatus,
    
    // Enhanced Subscription
    getEnhancedSubscriptionStatus,
    checkPermission,
    checkUsageLimit,
    
    // Organization Management
    createOrganization,
    getMyOrganization,
    getOrganizationUsers,
    inviteSubUser,
    updateSubUserRole,
    removeSubUser,
    
    // Helper methods
    isSubscriptionActive,
    canAccessFeature,
    getUsagePercentage,
    getUsageColor,
    formatCurrency,
    formatDate,
    getPlanLabel,
    getPlanColor,
    getStatusLabel,
    getStatusColor,
    getBillingCycleLabel,
    calculateSavings,
    getRecommendedPlan,
    formatFileSize,
    getFeatureIcon,
    getFeatureDescription,
  };
};
