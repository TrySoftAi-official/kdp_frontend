import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscriptionApi } from './useSubscriptionApi';
import { usePaymentApi } from './usePaymentApi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { SubscriptionPlan, UserSubscriptionWithPlanResponse, SubscriptionStatus } from '@/api/subscriptionService';

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
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [state, setState] = useState<SubscriptionIntegrationState>({
    subscriptionData: null,
    subscriptionStatus: null,
    isLoading: false,
    isProcessing: false,
    error: null
  });

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [statusData, subscriptionData] = await Promise.all([
        subscriptionApi.getMySubscriptionStatus(),
        subscriptionApi.getMySubscription()
      ]);
      
      setState(prev => ({
        ...prev,
        subscriptionStatus: statusData,
        subscriptionData: subscriptionData,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load subscription data'
      }));
    }
  }, [user, subscriptionApi]);

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

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const checkoutData = {
        amount: plan.price,
        currency: 'USD',
        customer_email: user.email,
        customer_name: user.name || user.username,
        description: `${plan.name} Subscription - ${billingCycle}`,
        success_url: `${window.location.origin}/subscription?subscription=success&plan=${plan.plan_id}`,
        cancel_url: `${window.location.origin}/subscription?subscription=cancelled`,
        line_items: [{
          product_name: plan.name,
          product_description: plan.description || `${plan.name} subscription plan`,
          quantity: 1,
          unit_amount: paymentApi.convertToCents(plan.price),
          tax_amount: 0,
          tax_rate: 0
        }],
        metadata: {
          plan_id: plan.plan_id,
          billing_cycle: billingCycle,
          user_id: user.id,
          plan_name: plan.name
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      if (checkoutSession && checkoutSession.url) {
        window.location.href = checkoutSession.url;
        return true;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      toast.error(errorMessage);
      return false;
    }
  }, [user, paymentApi]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason?: string): Promise<boolean> => {
    if (!state.subscriptionData?.subscription) {
      toast.error('No active subscription to cancel');
      return false;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await subscriptionApi.cancelSubscription({
        cancel_at_period_end: true,
        cancellation_reason: reason || 'User requested cancellation',
        feedback: 'Cancelled via subscription management'
      });

      if (result) {
        toast.success('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        await refreshSubscriptionData();
        return true;
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      toast.error(errorMessage);
      return false;
    }
  }, [state.subscriptionData, subscriptionApi, refreshSubscriptionData]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    // This would typically call an API to reactivate the subscription
    toast.info('Subscription reactivation feature coming soon');
    return false;
  }, []);

  // Check usage limit
  const checkUsageLimit = useCallback(async (usageType: string, increment: boolean = false): Promise<boolean> => {
    try {
      const result = await subscriptionApi.checkUsageLimits({
        usage_type: usageType,
        increment
      });

      return result?.can_use || false;
    } catch (error) {
      console.error('Usage limit check error:', error);
      return false;
    }
  }, [subscriptionApi]);

  // Get usage percentage
  const getUsagePercentage = useCallback((usageType: string): number => {
    if (!state.subscriptionData?.subscription || !state.subscriptionStatus?.plan?.limits) {
      return 0;
    }

    const currentUsage = state.subscriptionData.subscription.books_created_this_period;
    const limit = state.subscriptionStatus.plan.limits.books_per_month;

    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((currentUsage / limit) * 100, 100);
  }, [state.subscriptionData, state.subscriptionStatus]);

  // Check if user can perform an action
  const canPerformAction = useCallback(async (action: string): Promise<boolean> => {
    try {
      const result = await subscriptionApi.validateSubscriptionAccess(action);
      return result?.can_perform || false;
    } catch (error) {
      console.error('Action validation error:', error);
      return false;
    }
  }, [subscriptionApi]);

  // Check if user has a feature
  const hasFeature = useCallback((feature: string): boolean => {
    if (!state.subscriptionStatus?.plan?.limits) return false;
    
    const limits = state.subscriptionStatus.plan.limits;
    return limits[feature as keyof typeof limits] === true;
  }, [state.subscriptionStatus]);

  // Check if user can access a feature
  const canAccessFeature = useCallback((feature: string): boolean => {
    return hasFeature(feature);
  }, [hasFeature]);

  // Get current plan
  const getCurrentPlan = useCallback((): SubscriptionPlan | null => {
    return state.subscriptionStatus?.plan || null;
  }, [state.subscriptionStatus]);

  // Check if on free plan
  const isOnFreePlan = useCallback((): boolean => {
    return !state.subscriptionStatus?.has_subscription || 
           state.subscriptionStatus?.plan?.plan_id === 'free';
  }, [state.subscriptionStatus]);

  // Check if on paid plan
  const isOnPaidPlan = useCallback((): boolean => {
    return state.subscriptionStatus?.has_subscription && 
           state.subscriptionStatus?.plan?.plan_id !== 'free';
  }, [state.subscriptionStatus]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback((): boolean => {
    return state.subscriptionStatus?.status === 'active';
  }, [state.subscriptionStatus]);

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
    return subscriptionApi.formatCurrency(amount, currency);
  }, [subscriptionApi]);

  const formatDate = useCallback((dateString: string): string => {
    return subscriptionApi.formatDate(dateString);
  }, [subscriptionApi]);

  const getStatusColor = useCallback((status: string): string => {
    return subscriptionApi.getStatusColor(status);
  }, [subscriptionApi]);

  const getStatusLabel = useCallback((status: string): string => {
    return subscriptionApi.getStatusLabel(status);
  }, [subscriptionApi]);

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
