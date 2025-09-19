import apiClient from './client';
import { AxiosResponse } from 'axios';

// Subscription Types
export interface SubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features?: string[];
  limits?: {
    books_per_month: number;
    analytics_access: boolean;
    priority_support: boolean;
    custom_branding: boolean;
    api_access: boolean;
    max_file_size?: number;
    max_storage?: number;
  };
  popular?: boolean;
  active: boolean;
  sort_order: number;
  stripe_price_id?: string;
  stripe_product_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'expired' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_price_id?: string;
  books_created_this_period: number;
  last_reset_date?: string;
  subscription_metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionBilling {
  id: number;
  subscription_id: number;
  amount: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  billing_metadata?: Record<string, any>;
  created_at: string;
  paid_at?: string;
}

export interface SubscriptionUsage {
  id: number;
  subscription_id: number;
  usage_type: string;
  usage_count: number;
  usage_limit?: number;
  period_start: string;
  period_end: string;
  usage_metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  status?: string;
  plan?: SubscriptionPlan;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  limits?: {
    books_per_month: number;
    analytics_access: boolean;
    priority_support: boolean;
    custom_branding: boolean;
    api_access: boolean;
  };
  usage?: Record<string, any>;
}

export interface SubscriptionLimits {
  books_per_month: number;
  analytics_access: boolean;
  priority_support: boolean;
  custom_branding: boolean;
  api_access: boolean;
  max_file_size?: number;
  max_storage?: number;
}

export interface SubscriptionUpgradeRequest {
  new_plan_id: string;
  billing_cycle?: 'monthly' | 'yearly';
  prorate?: boolean;
  immediate?: boolean;
}

export interface SubscriptionCancelRequest {
  cancel_at_period_end?: boolean;
  cancellation_reason?: string;
  feedback?: string;
}

export interface SubscriptionDowngradeRequest {
  new_plan_id: string;
  billing_cycle?: 'monthly' | 'yearly';
  prorate?: boolean;
  immediate?: boolean;
  downgrade_reason?: string;
}

export interface SubscriptionReactivateRequest {
  new_plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
}

export interface SubscriptionCreateRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
}

export interface SubscriptionCreateResponse {
  success: boolean;
  message: string;
  checkout_data?: any;
}

export interface CheckAccessResponse {
  has_access: boolean;
  message: string;
  action: string;
  user_id: number;
  details: Record<string, any>;
}

export interface SubscriptionUsageCheckRequest {
  usage_type: string;
  increment?: boolean;
}

export interface SubscriptionUsageCheckResponse {
  can_use: boolean;
  current_usage: number;
  usage_limit?: number;
  remaining_usage?: number;
  reset_date?: string;
  message?: string;
}

export interface SubscriptionPlanListResponse {
  plans: SubscriptionPlan[];
  total: number;
}

export interface UserSubscriptionWithPlanResponse {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  usage?: SubscriptionUsage;
  billing_history?: SubscriptionBilling[];
}

// Enhanced Subscription Types
export interface EnhancedSubscriptionStatus {
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

export interface PermissionCheckRequest {
  permission: string;
}

export interface PermissionCheckResponse {
  has_permission: boolean;
  reason: string;
  permission: string;
  user_id: number;
}

export interface UsageLimitRequest {
  usage_type: string;
  increment?: boolean;
}

export interface UsageLimitResponse {
  can_use: boolean;
  usage_type: string;
  details: Record<string, any>;
  user_id: number;
}

export interface OrganizationCreateRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface OrganizationResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  owner_id: number;
  created_at: string;
}

export interface SubUserResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  is_owner: boolean;
  created_at: string;
}

export interface SubUserInviteRequest {
  email: string;
  username: string;
  role: string;
}

export interface SubUserInviteResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  status: string;
  message: string;
}

export interface SubUserRoleUpdateRequest {
  role: string;
}

// Subscription Service Class
export class SubscriptionService {
  // Subscription Plans
  static async getSubscriptionPlans(_activeOnly: boolean = true): Promise<AxiosResponse<SubscriptionPlanListResponse>> {
    return apiClient.get(`/subscription/plans`);
  }

  static async getSubscriptionPlan(planId: number): Promise<AxiosResponse<SubscriptionPlan>> {
    return apiClient.get(`/subscription/plans/${planId}`);
  }

  static async getSubscriptionPlanByPlanId(planId: string): Promise<AxiosResponse<SubscriptionPlan>> {
    return apiClient.get(`/subscription/plans/plan-id/${planId}`);
  }

  // User Subscriptions
  static async getMySubscription(): Promise<AxiosResponse<UserSubscriptionWithPlanResponse>> {
    return apiClient.get('/subscription/my-subscription');
  }

  static async createSubscription(data: SubscriptionCreateRequest): Promise<AxiosResponse<SubscriptionCreateResponse>> {
    return apiClient.post('/subscription/subscribe', data);
  }

  static async getMySubscriptionStatus(): Promise<AxiosResponse<SubscriptionStatus>> {
    return apiClient.get('/subscription/my-subscription/status');
  }

  static async upgradeSubscription(data: SubscriptionUpgradeRequest): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.post('/subscription/my-subscription/upgrade', data);
  }

  static async cancelSubscription(data: SubscriptionCancelRequest): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.post('/subscription/my-subscription/cancel', data);
  }

  static async downgradeSubscription(data: SubscriptionDowngradeRequest): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.post('/subscription/my-subscription/downgrade', data);
  }

  static async reactivateSubscription(data?: SubscriptionReactivateRequest): Promise<AxiosResponse<UserSubscription>> {
    return apiClient.post('/subscription/my-subscription/reactivate', data || {});
  }

  // Usage and Limits
  static async checkUsageLimits(data: SubscriptionUsageCheckRequest): Promise<AxiosResponse<SubscriptionUsageCheckResponse>> {
    return apiClient.post('/subscription/usage/check', data);
  }

  static async getMyFeatures(): Promise<AxiosResponse<Record<string, any>>> {
    return apiClient.get('/subscription/features');
  }

  static async checkFeatureAccess(feature: string): Promise<AxiosResponse<boolean>> {
    return apiClient.get(`/subscription/features/${feature}`);
  }

  // Validation
  static async validateSubscriptionAccess(action: string): Promise<AxiosResponse<{
    can_perform: boolean;
    message: string;
    action: string;
    user_id: number;
  }>> {
    return apiClient.get(`/subscription/validate/${action}`);
  }

  static async checkAccess(action: string): Promise<AxiosResponse<CheckAccessResponse>> {
    return apiClient.get(`/subscription/check-access/${action}`);
  }

  // Billing History
  static async getBillingHistory(limit: number = 10): Promise<AxiosResponse<SubscriptionBilling[]>> {
    return apiClient.get(`/subscription/billing/history?limit=${limit}`);
  }

  // Stripe Sync
  static async syncMySubscription(): Promise<AxiosResponse<{
    success: boolean;
    message: string;
    subscription_id?: number;
    status?: string;
  }>> {
    return apiClient.post('/subscription/sync/my-subscription');
  }

  static async getSyncStatus(): Promise<AxiosResponse<{
    total_users: number;
    users_with_subscriptions: number;
    subscription_status_breakdown: Record<string, number>;
    sync_needed: boolean;
  }>> {
    return apiClient.get('/subscription/sync/status');
  }

  // Enhanced Subscription Endpoints
  static async getEnhancedSubscriptionStatus(): Promise<AxiosResponse<EnhancedSubscriptionStatus>> {
    return apiClient.get('/subscription/my-subscription/status');
  }

  static async checkPermission(data: PermissionCheckRequest): Promise<AxiosResponse<PermissionCheckResponse>> {
    return apiClient.post('/subscription/check-permission', data);
  }

  static async checkUsageLimit(data: UsageLimitRequest): Promise<AxiosResponse<UsageLimitResponse>> {
    return apiClient.post('/subscription/check-usage-limit', data);
  }

  // Organization Management
  static async createOrganization(data: OrganizationCreateRequest): Promise<AxiosResponse<OrganizationResponse>> {
    return apiClient.post('/subscription/create-organization', data);
  }

  static async getMyOrganization(): Promise<AxiosResponse<OrganizationResponse>> {
    return apiClient.get('/subscription/my-organization');
  }

  static async getOrganizationUsers(): Promise<AxiosResponse<SubUserResponse[]>> {
    return apiClient.get('/subscription/my-organization/users');
  }

  static async inviteSubUser(data: SubUserInviteRequest): Promise<AxiosResponse<SubUserInviteResponse>> {
    return apiClient.post('/subscription/invite-sub-user', data);
  }

  static async updateSubUserRole(userId: number, data: SubUserRoleUpdateRequest): Promise<AxiosResponse<SubUserResponse>> {
    return apiClient.put(`/subscription/sub-user/${userId}/role`, data);
  }

  static async removeSubUser(userId: number): Promise<AxiosResponse<void>> {
    return apiClient.delete(`/subscription/sub-user/${userId}`);
  }

  // Helper methods
  static getPlanLabel(planId: string): string {
    const planLabels: Record<string, string> = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return planLabels[planId] || planId;
  }

  static getPlanColor(planId: string): string {
    const planColors: Record<string, string> = {
      free: 'text-gray-600 bg-gray-100',
      basic: 'text-blue-600 bg-blue-100',
      pro: 'text-purple-600 bg-purple-100',
      enterprise: 'text-yellow-600 bg-yellow-100',
    };
    return planColors[planId] || 'text-gray-600 bg-gray-100';
  }

  static getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      active: 'Active',
      expired: 'Expired',
      cancelled: 'Cancelled',
      past_due: 'Past Due',
      trialing: 'Trial',
      incomplete: 'Incomplete',
      incomplete_expired: 'Incomplete Expired',
      unpaid: 'Unpaid',
    };
    return statusLabels[status] || status;
  }

  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      active: 'text-green-600 bg-green-100',
      expired: 'text-yellow-600 bg-yellow-100',
      cancelled: 'text-red-600 bg-red-100',
      past_due: 'text-orange-600 bg-orange-100',
      trialing: 'text-blue-600 bg-blue-100',
      incomplete: 'text-gray-600 bg-gray-100',
      incomplete_expired: 'text-gray-600 bg-gray-100',
      unpaid: 'text-red-600 bg-red-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static isSubscriptionActive(subscription?: UserSubscription): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.current_period_end) {
      return new Date(subscription.current_period_end) > new Date();
    }
    return true;
  }

  static canAccessFeature(features: Record<string, any>, feature: string): boolean {
    return features[feature] === true;
  }

  static getUsagePercentage(current: number, limit?: number): number {
    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  }

  static getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  static getBillingCycleLabel(cycle: string): string {
    const cycleLabels: Record<string, string> = {
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return cycleLabels[cycle] || cycle;
  }

  static calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
    const monthlyYearlyTotal = monthlyPrice * 12;
    return ((monthlyYearlyTotal - yearlyPrice) / monthlyYearlyTotal) * 100;
  }

  static getRecommendedPlan(usage: number): string {
    if (usage <= 1) return 'free';
    if (usage <= 5) return 'basic';
    if (usage <= 20) return 'pro';
    return 'enterprise';
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  static getFeatureIcon(feature: string): string {
    const featureIcons: Record<string, string> = {
      'books_per_month': '📚',
      'analytics_access': '📊',
      'priority_support': '🎧',
      'custom_branding': '🎨',
      'api_access': '🔌',
      'max_file_size': '📁',
      'max_storage': '💾',
    };
    return featureIcons[feature] || '✅';
  }

  static getFeatureDescription(feature: string): string {
    const featureDescriptions: Record<string, string> = {
      'books_per_month': 'Number of books you can create per month',
      'analytics_access': 'Access to detailed analytics and reporting',
      'priority_support': 'Priority customer support with faster response times',
      'custom_branding': 'Custom branding and white-label options',
      'api_access': 'Access to our API for integrations',
      'max_file_size': 'Maximum file size for uploads',
      'max_storage': 'Total storage space available',
    };
    return featureDescriptions[feature] || feature;
  }
}

// Export individual functions for convenience
export const {
  getSubscriptionPlans,
  getSubscriptionPlan,
  getSubscriptionPlanByPlanId,
  getMySubscription,
  getMySubscriptionStatus,
  upgradeSubscription,
  cancelSubscription,
  downgradeSubscription,
  reactivateSubscription,
  checkUsageLimits,
  getMyFeatures,
  checkFeatureAccess,
  validateSubscriptionAccess,
  getBillingHistory,
  syncMySubscription,
  getSyncStatus,
  getEnhancedSubscriptionStatus,
  checkPermission,
  checkUsageLimit,
  createOrganization,
  getMyOrganization,
  getOrganizationUsers,
  inviteSubUser,
  updateSubUserRole,
  removeSubUser,
  getPlanLabel,
  getPlanColor,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatDate,
  isSubscriptionActive,
  canAccessFeature,
  getUsagePercentage,
  getUsageColor,
  getBillingCycleLabel,
  calculateSavings,
  getRecommendedPlan,
  formatFileSize,
  getFeatureIcon,
  getFeatureDescription,
} = SubscriptionService;

export default SubscriptionService;
