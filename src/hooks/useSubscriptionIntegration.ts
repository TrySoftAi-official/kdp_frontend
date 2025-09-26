import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { SubscriptionPlan, UserSubscriptionWithPlanResponse, SubscriptionStatus } from '@/apis/subscription';

interface SubscriptionIntegrationState {
  subscriptionData: UserSubscriptionWithPlanResponse | null;
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

interface UseSubscriptionIntegrationReturn {
  // State
  state: SubscriptionIntegrationState;
  
  // Data loading
  loadSubscriptionData: () => Promise<void>;
  refreshSubscriptionData: () => Promise<void>;
  
  // Subscription management
  upgradeToPlan: (plan: SubscriptionPlan, billingCycle?: 'monthly' | 'yearly') => Promise<boolean>;
  cancelSubscription: (reason?: string) => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  
  // Usage and limits
  checkUsageLimit: (usageType: string, increment?: boolean) => Promise<boolean>;
  getUsagePercentage: (usageType: string) => number;
  canPerformAction: (action: string) => Promise<boolean>;
  
  // Feature access
  hasFeature: (feature: string) => boolean;
  canAccessFeature: (feature: string) => boolean;
  
  // Plan information
  getCurrentPlan: () => SubscriptionPlan | null;
  isOnFreePlan: () => boolean;
  isOnPaidPlan: () => boolean;
  isSubscriptionActive: () => boolean;
  
  // Quick actions
  showUpgradeModal: () => void;
  navigateToSubscription: () => void;
  navigateToBilling: () => void;
  
  // Utility functions
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export const useSubscriptionIntegration = (): UseSubscriptionIntegrationReturn => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    currentSubscription, 
    subscriptionStatus, 
    isLoading, 
    isUpgrading,
    isCancelling,
    fetchCurrent,
    fetchStatus,
    upgrade,
    cancel
  } = useSubscription();
  
  const [state, setState] = useState<SubscriptionIntegrationState>({
    subscriptionData: currentSubscription,
    subscriptionStatus: subscriptionStatus,
    isLoading: isLoading,
    isProcessing: isUpgrading || isCancelling,
    error: null
  });
  
  // Update state when Redux state changes
  useEffect(() => {
    setState({
      subscriptionData: currentSubscription,
      subscriptionStatus: subscriptionStatus,
      isLoading: isLoading,
      isProcessing: isUpgrading || isCancelling,
      error: null
    });
  }, [currentSubscription, subscriptionStatus, isLoading, isUpgrading, isCancelling]);

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        fetchStatus(),
        fetchCurrent()
      ]);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load subscription data'
      }));
    }
  }, [user, fetchStatus, fetchCurrent]);

  // Refresh subscription data
  const refreshSubscriptionData = useCallback(async () => {
    await loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Upgrade to a plan
  const upgradeToPlan = useCallback(async (
    plan: SubscriptionPlan, 
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to upgrade your subscription');
      return false;
    }

    if (plan.plan_id === 'free') {
      toast.error('Cannot upgrade to free plan');
      return false;
    }

    try {
      const result = await upgrade({
        new_plan: plan.plan_id,
        billing_cycle: billingCycle,
        immediate: false
      });

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Subscription upgraded successfully!');
        return true;
      } else {
        toast.error('Failed to upgrade subscription');
        return false;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      toast.error(errorMessage);
      return false;
    }
  }, [user, upgrade]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason?: string): Promise<boolean> => {
    if (!currentSubscription?.subscription) {
      toast.error('No active subscription to cancel');
      return false;
    }

    try {
      const result = await cancel(false); // Don't cancel immediately

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        return true;
      } else {
        toast.error('Failed to cancel subscription');
        return false;
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      toast.error(errorMessage);
      return false;
    }
  }, [currentSubscription, cancel]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    // This would typically call an API to reactivate the subscription
    toast.info('Subscription reactivation feature coming soon');
    return false;
  }, []);

  // Check usage limit
  const checkUsageLimit = useCallback(async (usageType: string, increment: boolean = false): Promise<boolean> => {
    if (!subscriptionStatus?.usage) return false;
    
    const usage = subscriptionStatus.usage[usageType];
    const limit = subscriptionStatus.plan?.limits?.[usageType];
    
    if (!limit || limit === -1) return true; // Unlimited
    return usage < limit;
  }, [subscriptionStatus]);

  // Get usage percentage
  const getUsagePercentage = useCallback((usageType: string): number => {
    if (!currentSubscription?.usage || !subscriptionStatus?.plan?.limits) {
      return 0;
    }

    const currentUsage = currentSubscription.usage[usageType] || 0;
    const limit = subscriptionStatus.plan.limits[usageType];

    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((currentUsage / limit) * 100, 100);
  }, [currentSubscription, subscriptionStatus]);

  // Check if user can perform an action
  const canPerformAction = useCallback(async (action: string): Promise<boolean> => {
    // Simple action validation based on subscription status
    if (!subscriptionStatus) return false;
    
    // Basic action checks
    switch (action) {
      case 'create_book':
        return subscriptionStatus.has_subscription;
      case 'access_analytics':
        return subscriptionStatus.plan?.plan_id === 'pro' || subscriptionStatus.plan?.plan_id === 'enterprise';
      default:
        return subscriptionStatus.has_subscription;
    }
  }, [subscriptionStatus]);

  // Check if user has a feature
  const hasFeature = useCallback((feature: string): boolean => {
    if (!subscriptionStatus?.plan?.limits) return false;
    
    const limits = subscriptionStatus.plan.limits;
    return limits[feature as keyof typeof limits] === true;
  }, [subscriptionStatus]);

  // Check if user can access a feature
  const canAccessFeature = useCallback((feature: string): boolean => {
    return hasFeature(feature);
  }, [hasFeature]);

  // Get current plan
  const getCurrentPlan = useCallback((): SubscriptionPlan | null => {
    return subscriptionStatus?.plan || null;
  }, [subscriptionStatus]);

  // Check if on free plan
  const isOnFreePlan = useCallback((): boolean => {
    return !subscriptionStatus?.has_subscription || 
           subscriptionStatus?.plan?.plan_id === 'free';
  }, [subscriptionStatus]);

  // Check if on paid plan
  const isOnPaidPlan = useCallback((): boolean => {
    return subscriptionStatus?.has_subscription && 
           subscriptionStatus?.plan?.plan_id !== 'free';
  }, [subscriptionStatus]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback((): boolean => {
    return subscriptionStatus?.status === 'active';
  }, [subscriptionStatus]);

  // Show upgrade modal
  const showUpgradeModal = useCallback(() => {
    navigate('/subscription');
  }, [navigate]);

  // Navigate to subscription page
  const navigateToSubscription = useCallback(() => {
    navigate('/subscription');
  }, [navigate]);

  // Navigate to billing
  const navigateToBilling = useCallback(() => {
    // This would typically open a billing portal
    toast.info('Billing portal feature coming soon');
  }, []);

  // Utility functions
  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'Active';
      case 'cancelled': return 'Cancelled';
      case 'past_due': return 'Past Due';
      default: return 'Unknown';
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  return {
    // State
    state,
    
    // Data loading
    loadSubscriptionData,
    refreshSubscriptionData,
    
    // Subscription management
    upgradeToPlan,
    cancelSubscription,
    reactivateSubscription,
    
    // Usage and limits
    checkUsageLimit,
    getUsagePercentage,
    canPerformAction,
    
    // Feature access
    hasFeature,
    canAccessFeature,
    
    // Plan information
    getCurrentPlan,
    isOnFreePlan,
    isOnPaidPlan,
    isSubscriptionActive,
    
    // Quick actions
    showUpgradeModal,
    navigateToSubscription,
    navigateToBilling,
    
    // Utility functions
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusLabel
  };
};
