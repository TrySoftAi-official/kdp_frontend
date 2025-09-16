import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSubscriptionApi } from './useSubscriptionApi';
import { toast } from '@/lib/toast';
import { SubscriptionStatus, SubscriptionService } from '@/api/subscriptionService';

interface FeatureEnforcementOptions {
  showUpgradeModal?: boolean;
  customMessage?: string;
  onUpgrade?: () => void;
}

interface UsageLimit {
  current: number;
  limit: number | null; // null means unlimited
  resetDate?: string;
  canUse: boolean;
  message?: string;
}

export const useFeatureEnforcement = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load subscription status
  const loadSubscriptionStatus = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await subscriptionApi.getMySubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, subscriptionApi]);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  // Check if user has access to a specific feature
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!subscriptionStatus?.limits) return false;
    
    switch (feature) {
      case 'analytics':
        return subscriptionStatus.limits.analytics_access;
      case 'priority_support':
        return subscriptionStatus.limits.priority_support;
      case 'custom_branding':
        return subscriptionStatus.limits.custom_branding;
      case 'api_access':
        return subscriptionStatus.limits.api_access;
      default:
        return false;
    }
  }, [subscriptionStatus]);

  // Check usage limits for a specific action
  const checkUsageLimit = useCallback(async (
    usageType: string, 
    increment: boolean = false
  ): Promise<UsageLimit> => {
    if (!user) {
      return {
        current: 0,
        limit: 0,
        canUse: false,
        message: 'Please log in to use this feature'
      };
    }

    try {
      const response = await subscriptionApi.checkUsageLimits({
        usage_type: usageType,
        increment
      });

      const data = response.data;
      return {
        current: data.current_usage,
        limit: data.usage_limit || null,
        resetDate: data.reset_date,
        canUse: data.can_use,
        message: data.message
      };
    } catch (error) {
      console.error('Failed to check usage limit:', error);
      return {
        current: 0,
        limit: 0,
        canUse: false,
        message: 'Failed to check usage limit'
      };
    }
  }, [user, subscriptionApi]);

  // Enforce feature access with upgrade prompt
  const enforceFeatureAccess = useCallback((
    feature: string,
    options: FeatureEnforcementOptions = {}
  ): boolean => {
    const hasAccess = hasFeatureAccess(feature);
    
    if (!hasAccess) {
      const message = options.customMessage || 
        `This feature requires a higher subscription plan. Upgrade to access ${feature}.`;
      
      toast.error(message);
      
      if (options.showUpgradeModal && options.onUpgrade) {
        options.onUpgrade();
      }
    }
    
    return hasAccess;
  }, [hasFeatureAccess]);

  // Enforce usage limits with upgrade prompt
  const enforceUsageLimit = useCallback(async (
    usageType: string,
    options: FeatureEnforcementOptions = {}
  ): Promise<boolean> => {
    const usageLimit = await checkUsageLimit(usageType, true);
    
    if (!usageLimit.canUse) {
      const message = options.customMessage || usageLimit.message || 
        `You've reached your ${usageType} limit. Upgrade to continue.`;
      
      toast.error(message);
      
      if (options.showUpgradeModal && options.onUpgrade) {
        options.onUpgrade();
      }
      
      return false;
    }
    
    return true;
  }, [checkUsageLimit]);

  // Get current plan information
  const getCurrentPlan = useCallback(() => {
    if (!subscriptionStatus?.plan) {
      return {
        id: 'free',
        name: 'Free Plan',
        price: 0,
        features: []
      };
    }
    
    return {
      id: subscriptionStatus.plan.plan_id,
      name: subscriptionStatus.plan.name,
      price: subscriptionStatus.plan.price,
      features: subscriptionStatus.plan.features || []
    };
  }, [subscriptionStatus]);

  // Get usage information for display
  const getUsageInfo = useCallback((usageType: string) => {
    if (!subscriptionStatus?.usage?.[usageType]) {
      return {
        current: 0,
        limit: null,
        percentage: 0,
        isUnlimited: true
      };
    }
    
    const usage = subscriptionStatus.usage[usageType];
    const current = usage.current_usage || 0;
    const limit = usage.limit;
    const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
    
    return {
      current,
      limit,
      percentage,
      isUnlimited: !limit || limit === -1
    };
  }, [subscriptionStatus]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback(() => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.has_subscription && 
           subscriptionStatus.status === 'active';
  }, [subscriptionStatus]);

  // Get subscription status for display
  const getSubscriptionStatus = useCallback(() => {
    if (!subscriptionStatus) {
      return {
        status: 'No Subscription',
        color: 'text-gray-600 bg-gray-100',
        isActive: false
      };
    }
    
    const isActive = isSubscriptionActive();
    const status = subscriptionStatus.status || 'unknown';
    
    return {
      status: SubscriptionService.getStatusLabel(status),
      color: SubscriptionService.getStatusColor(status),
      isActive
    };
  }, [subscriptionStatus, isSubscriptionActive]);

  // Get recommended plan based on usage
  const getRecommendedPlan = useCallback(() => {
    if (!subscriptionStatus?.usage) return 'free';
    
    const booksUsage = subscriptionStatus.usage.books_created;
    if (booksUsage && booksUsage.current_usage) {
      return SubscriptionService.getRecommendedPlan(booksUsage.current_usage);
    }
    
    return 'free';
  }, [subscriptionStatus]);

  // Refresh subscription status
  const refreshSubscriptionStatus = useCallback(() => {
    return loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  return {
    // State
    subscriptionStatus,
    isLoading,
    
    // Feature access
    hasFeatureAccess,
    enforceFeatureAccess,
    
    // Usage limits
    checkUsageLimit,
    enforceUsageLimit,
    getUsageInfo,
    
    // Plan information
    getCurrentPlan,
    getSubscriptionStatus,
    getRecommendedPlan,
    isSubscriptionActive,
    
    // Actions
    refreshSubscriptionStatus
  };
};
