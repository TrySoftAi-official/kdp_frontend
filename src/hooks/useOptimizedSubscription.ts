import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';

interface OptimizedSubscriptionData {
  subscription: any;
  status: any;
  plan: any;
  usage: any;
  billing: any;
  features: any;
}

interface UseOptimizedSubscriptionReturn {
  data: OptimizedSubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  isFreePlan: boolean;
  planName: string;
  statusText: string;
  isExpiringSoon: boolean;
  refreshData: (force?: boolean) => Promise<void>;
  clearCache: () => void;
  getUsagePercentage: (metric: 'books' | 'api_calls' | 'storage') => number;
}

export const useOptimizedSubscription = (): UseOptimizedSubscriptionReturn => {
  const { user, isAuthenticated } = useAuth();
  const { 
    currentSubscription, 
    subscriptionStatus, 
    isLoading, 
    error,
    fetchAll
  } = useSubscription();
  
  const [data, setData] = useState<OptimizedSubscriptionData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Update data when Redux state changes
  useEffect(() => {
    if (currentSubscription || subscriptionStatus) {
      setData({
        subscription: currentSubscription,
        status: subscriptionStatus,
        plan: subscriptionStatus?.plan,
        usage: currentSubscription?.usage,
        billing: null, // billing data is not available in currentSubscription
        features: null // features data is not available in subscriptionStatus
      });
    }
  }, [currentSubscription, subscriptionStatus]);

  // Refresh data function
  const refreshData = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated || !user) return;

    const now = Date.now();
    const shouldFetch = force || (now - lastFetchRef.current) > CACHE_DURATION;

    if (!shouldFetch) return;

    setIsRefreshing(true);
    lastFetchRef.current = now;

    try {
      await fetchAll();
    } catch (error) {
      console.error('Failed to refresh subscription data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user, fetchAll]);

  // Clear cache function
  const clearCache = useCallback(() => {
    lastFetchRef.current = 0;
  }, []);

  // Get usage percentage
  const getUsagePercentage = useCallback((metric: 'books' | 'api_calls' | 'storage'): number => {
    if (!data?.usage || !data?.plan?.limits) return 0;

    const currentUsage = data.usage[metric] || 0;
    const limit = data.plan.limits[metric];

    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((currentUsage / limit) * 100, 100);
  }, [data]);

  // Computed values
  const hasActiveSubscription = data?.status?.has_subscription || false;
  const isFreePlan = !hasActiveSubscription || data?.plan?.plan_id === 'free';
  const planName = data?.plan?.name || 'Free Plan';
  const statusText = data?.status?.status || 'inactive';
  
  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = useCallback((): boolean => {
    if (!data?.subscription?.current_period_end) return false;
    
    const endDate = new Date(data.subscription.current_period_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }, [data]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    }
  }, [isAuthenticated, user]); // Remove refreshData from dependencies to prevent infinite loop

  return {
    data,
    isLoading: isLoading || isRefreshing,
    error,
    hasActiveSubscription,
    isFreePlan,
    planName,
    statusText,
    isExpiringSoon: isExpiringSoon(),
    refreshData,
    clearCache,
    getUsagePercentage,
  };
};