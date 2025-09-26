// Admin API Types
export interface AdminSubscriptionPlanResponse {
  id: number;
  plan_id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features: Record<string, any> | null;
  limits: Record<string, any> | null;
  popular: boolean;
  active: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string | null;
  subscriber_count: number;
}

export interface AdminInvoiceResponse {
  id: number;
  invoice_id: string;
  customer_email: string;
  customer_name: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  created_at: string;
  paid_at: string | null;
  subscription_id: number;
  subscription_status: string;
}

export interface UserAnalytics {
  total: number;
  active: number;
  by_role: Record<string, number>;
}

export interface SubscriptionAnalytics {
  total: number;
  active: number;
  by_plan: Record<string, number>;
}

export interface RevenueAnalytics {
  total: number;
  monthly: number;
}

export interface OrganizationAnalytics {
  total: number;
}

export interface AdminAnalyticsResponse {
  users: UserAnalytics;
  subscriptions: SubscriptionAnalytics;
  revenue: RevenueAnalytics;
  organizations: OrganizationAnalytics;
}

export interface FrozenSubUserResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  parent_user_email: string;
  organization_id: number | null;
  status: string;
  created_at: string;
}
