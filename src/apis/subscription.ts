import apiClient, { getErrorMessage, requireAuth } from './apiClient';
import CookieManager from '../utils/cookies';

// Types
export interface SubscriptionPlan { 
  id: number; 
  plan_id: string; 
  name: string; 
  description?: string;
  price: number; 
  billing_cycle: string; 
  features?: string[];
  limits?: {
    books_per_month: number;
    api_calls_per_month: number;
    storage_gb: number;
    analytics_access?: boolean;
    priority_support?: boolean;
    custom_branding?: boolean;
    api_access?: boolean;
  };
  popular?: boolean;
  active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_price_id?: string;
  books_created_this_period?: number;
  last_reset_date?: string;
  subscription_metadata?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSubscriptionWithPlanResponse {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan;
  usage: {
    books_uploaded: number;
    api_calls: number;
    storage_used_mb: number;
  };
  has_subscription: boolean;
  status: string;
  is_active: boolean;
  is_trial: boolean;
  trial_ends_at?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface SubscriptionStatus { 
  subscription: UserSubscription | null;
  plan: SubscriptionPlan;
  usage: {
    books_uploaded: number;
    api_calls: number;
    storage_used_mb: number;
  };
  status: string; 
  has_subscription: boolean; 
}

export interface SubscriptionBilling {
  id: number;
  amount: number;
  currency: string;
  payment_status: string;
  billing_period_start: string;
  billing_period_end: string;
  paid_at?: string;
  description?: string;
}

export interface CheckoutSessionRequest {
  plan: string;
  billing_cycle: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface PlanChangeRequest {
  new_plan: string;
  billing_cycle: string;
  immediate?: boolean;
}

export interface PlanChangeResponse {
  message: string;
  new_plan: string;
  effective_date: string;
}

export interface BillingPortalRequest {
  return_url?: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface QuotaStatus {
  plan: string;
  books_uploaded: number;
  books_limit: number;
  books_remaining: number;
  api_calls: number;
  api_calls_limit: number;
  api_calls_remaining: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  storage_remaining_mb: number;
  sub_users: number;
  sub_users_limit: number;
  sub_users_remaining: number;
}

export interface UserSubscriptionSummary {
  current_plan: string;
  status: string;
  next_billing_date?: string;
  usage: QuotaStatus;
  can_upgrade: boolean;
  can_downgrade: boolean;
  available_plans: SubscriptionPlan[];
}

// API Functions
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    console.log('📋 [getSubscriptionPlans] Fetching subscription plans');
    const { data } = await apiClient.get('/api/subscription/plans');
    const plans = data.plans || [];
    console.log('✅ [getSubscriptionPlans] Plans fetched successfully:', plans.length);
    return plans;
  } catch (error: any) {
    console.error('❌ [getSubscriptionPlans] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getMySubscription(): Promise<UserSubscriptionWithPlanResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('👤 [getMySubscription] Fetching user subscription');
    console.log('🔍 [getMySubscription] Auth token available:', !!CookieManager.getAccessToken());
    console.log('🔍 [getMySubscription] Auth token preview:', CookieManager.getAccessToken()?.substring(0, 50) + '...');
    
    const { data } = await apiClient.get('/api/subscription/my-subscription/optimized');
    console.log('✅ [getMySubscription] Subscription fetched successfully');
    console.log('📋 [getMySubscription] Response data:', data);
    return data;
  } catch (error: any) {
    console.error('❌ [getMySubscription] API Error:', getErrorMessage(error));
    console.error('❌ [getMySubscription] Full error:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getMySubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📊 [getMySubscriptionStatus] Fetching subscription status');
    console.log('🔍 [getMySubscriptionStatus] Auth token available:', !!CookieManager.getAccessToken());
    
    const { data } = await apiClient.get('/api/subscription/my-subscription/status');
    console.log('✅ [getMySubscriptionStatus] Status fetched successfully');
    console.log('📋 [getMySubscriptionStatus] Response data:', data);
    return data;
  } catch (error: any) {
    console.error('❌ [getMySubscriptionStatus] API Error:', getErrorMessage(error));
    console.error('❌ [getMySubscriptionStatus] Full error:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getSubscriptionSummary(): Promise<UserSubscriptionSummary> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📈 [getSubscriptionSummary] Fetching subscription summary');
    const { data } = await apiClient.get('/api/subscription/summary');
    console.log('✅ [getSubscriptionSummary] Summary fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getSubscriptionSummary] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getUsageStatus(): Promise<QuotaStatus> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📊 [getUsageStatus] Fetching usage status');
    const { data } = await apiClient.get('/api/subscription/usage');
    console.log('✅ [getUsageStatus] Usage status fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getUsageStatus] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('💳 [createCheckoutSession] Creating checkout session');
    console.log('🔍 [createCheckoutSession] Auth token available:', !!CookieManager.getAccessToken());
    console.log('🔍 [createCheckoutSession] Auth token preview:', CookieManager.getAccessToken()?.substring(0, 50) + '...');
    const { data } = await apiClient.post('/api/subscription/create-checkout', request);
    console.log('✅ [createCheckoutSession] Checkout session created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createCheckoutSession] API Error:', getErrorMessage(error));
    console.error('❌ [createCheckoutSession] Full error:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function changeSubscriptionPlan(request: PlanChangeRequest): Promise<CheckoutSessionResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔄 [changeSubscriptionPlan] Changing subscription plan');
    const { data } = await apiClient.post('/api/subscription/change-plan', request);
    console.log('✅ [changeSubscriptionPlan] Plan change initiated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [changeSubscriptionPlan] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}


export async function createDirectSubscription(plan: string, billingCycle: string = 'monthly'): Promise<UserSubscription> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📝 [createDirectSubscription] Creating direct subscription');
    const { data } = await apiClient.post('/api/subscription/create-direct', null, {
      params: { plan, billing_cycle: billingCycle }
    });
    console.log('✅ [createDirectSubscription] Direct subscription created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createDirectSubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function updateSubscription(request: { plan?: string; cancel_at_period_end?: boolean }): Promise<UserSubscription> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔄 [updateSubscription] Updating subscription');
    const { data } = await apiClient.put('/api/subscription/update', request);
    console.log('✅ [updateSubscription] Subscription updated successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [updateSubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function changePlan(request: PlanChangeRequest): Promise<PlanChangeResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔄 [changePlan] Changing subscription plan');
    const { data } = await apiClient.post('/api/subscription/change-plan', request);
    console.log('✅ [changePlan] Plan changed successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [changePlan] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function upgradeSubscription(request: PlanChangeRequest): Promise<PlanChangeResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('⬆️ [upgradeSubscription] Upgrading subscription');
    const { data } = await apiClient.post('/api/subscription/upgrade', request);
    console.log('✅ [upgradeSubscription] Subscription upgraded successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [upgradeSubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function downgradeSubscription(request: PlanChangeRequest): Promise<PlanChangeResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('⬇️ [downgradeSubscription] Downgrading subscription');
    const { data } = await apiClient.post('/api/subscription/downgrade', request);
    console.log('✅ [downgradeSubscription] Subscription downgraded successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [downgradeSubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function cancelSubscription(immediately: boolean = false): Promise<{ message: string; canceled_at: string; effective_date: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('❌ [cancelSubscription] Canceling subscription');
    const { data } = await apiClient.post('/api/subscription/cancel', null, {
      params: { immediately }
    });
    console.log('✅ [cancelSubscription] Subscription canceled successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [cancelSubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBillingPortal(request: BillingPortalRequest): Promise<BillingPortalResponse> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('💳 [getBillingPortal] Getting billing portal');
    const { data } = await apiClient.post('/api/subscription/billing-portal', request);
    console.log('✅ [getBillingPortal] Billing portal URL retrieved successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getBillingPortal] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function checkAccess(action: string): Promise<{
  has_access: boolean;
  message: string;
  action: string;
  user_id: number;
  details: {
    current_plan: string;
    has_active_subscription: boolean;
    required_plan?: string[];
    requires_active: boolean;
  };
}> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔐 [checkAccess] Checking access for action:', action);
    const { data } = await apiClient.get(`/api/subscription/check-access/${action}`);
    console.log('✅ [checkAccess] Access check completed');
    return data;
  } catch (error: any) {
    console.error('❌ [checkAccess] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function syncMySubscription(): Promise<{ message: string; status?: string }> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔄 [syncMySubscription] Syncing subscription');
    const { data } = await apiClient.post('/api/subscription/sync-my-subscription');
    console.log('✅ [syncMySubscription] Subscription synced successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [syncMySubscription] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBillingHistory(limit: number = 10): Promise<SubscriptionBilling[]> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('📋 [getBillingHistory] Fetching billing history');
    const { data } = await apiClient.get('/api/payment/history', {
      params: { limit }
    });
    const history = data.invoices || [];
    console.log('✅ [getBillingHistory] Billing history fetched successfully:', history.length);
    return history;
  } catch (error: any) {
    console.error('❌ [getBillingHistory] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyFeatures(): Promise<Record<string, boolean>> {
  try {
    requireAuth(); // Require authentication for user-specific data
    console.log('🔧 [getMyFeatures] Fetching user features');
    const features = [
      'create_book',
      'access_analytics',
      'manage_organization',
      'create_sub_users',
      'advanced_features'
    ];

    const results: Record<string, boolean> = {};
    
    for (const feature of features) {
      try {
        const access = await checkAccess(feature);
        results[feature] = access.has_access;
      } catch (error) {
        console.warn(`⚠️ [getMyFeatures] Failed to check access for ${feature}:`, error);
        results[feature] = false;
      }
    }

    console.log('✅ [getMyFeatures] Features fetched successfully');
    return results;
  } catch (error: any) {
    console.error('❌ [getMyFeatures] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

// Legacy function names for backward compatibility
export const fetchPlans = getSubscriptionPlans;
export const fetchMyStatus = getMySubscriptionStatus;


