/**
 * SubscriptionManager Component
 * 
 * A comprehensive React component for managing user subscriptions,
 * including plan selection, subscription status, and billing management.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Calendar, 
  Users, 
  Zap,
  Crown,
  Star
} from 'lucide-react';

// Types
interface SubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  limits: {
    books_per_month: number;
    api_calls_per_month: number;
    storage_gb: number;
  };
  permissions: Record<string, boolean>;
  popular: boolean;
  active: boolean;
}

interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  canceled_at?: string;
  books_created_this_period: number;
  api_calls_this_period: number;
  plan: SubscriptionPlan;
}

interface SubscriptionStatus {
  has_subscription: boolean;
  plan_type: string;
  status?: string;
  plan?: SubscriptionPlan;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  limits: Record<string, any>;
  usage: Record<string, any>;
  permissions: Record<string, any>;
}

// Import the new v2 API services
import { SubscriptionServiceV2 } from '@/services/subscriptionServiceV2';
import { PaymentServiceV2 } from '@/services/paymentServiceV2';

// Main Component
const SubscriptionManager: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, statusResponse] = await Promise.all([
        SubscriptionServiceV2.getSubscriptionPlans(),
        SubscriptionServiceV2.getMySubscriptionStatus()
      ]);
      
      setPlans(plansResponse.data.plans);
      setSubscriptionStatus(statusResponse.data);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, billingCycle: string = 'monthly') => {
    try {
      setActionLoading(`subscribe-${planId}`);
      const result = await SubscriptionServiceV2.createSubscription({
        plan_id: planId,
        billing_cycle: billingCycle as 'monthly' | 'yearly'
      });
      
      if (result.data.checkout_data?.session_url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.checkout_data.session_url;
      } else if (result.data.checkout_data?.client_secret) {
        // Handle payment intent
        // You would integrate with Stripe Elements here
        console.log('Payment intent created:', result.data.checkout_data.client_secret);
      }
    } catch (err) {
      setError('Failed to create subscription');
      console.error('Error creating subscription:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (newPlanId: string) => {
    try {
      setActionLoading(`upgrade-${newPlanId}`);
      await SubscriptionServiceV2.upgradeSubscription({
        new_plan_id: newPlanId,
        billing_cycle: 'monthly'
      });
      await loadData(); // Reload data
    } catch (err) {
      setError('Failed to upgrade subscription');
      console.error('Error upgrading subscription:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading('cancel');
      await SubscriptionServiceV2.cancelSubscription({
        cancel_at_period_end: true,
        cancellation_reason: 'User requested cancellation'
      });
      await loadData(); // Reload data
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error('Error canceling subscription:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading('billing');
      const result = await PaymentServiceV2.createBillingPortalSession({
        return_url: window.location.href
      });
      window.location.href = result.data.portal_url;
    } catch (err) {
      setError('Failed to open billing portal');
      console.error('Error opening billing portal:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Users className="h-6 w-6" />;
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'pro': return <Star className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing': return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'past_due': return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">No Subscription</Badge>;
    }
  };

  const formatUsage = (current: number, limit: number) => {
    if (limit === -1) return `${current} / Unlimited`;
    return `${current} / ${limit}`;
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadData} className="mt-2" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      {subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {subscriptionStatus.plan?.name || 'Free Plan'}
                </h3>
                <p className="text-gray-600">
                  {subscriptionStatus.plan?.description || 'Basic features with limited usage'}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(subscriptionStatus.status)}
                {subscriptionStatus.plan?.price && (
                  <p className="text-2xl font-bold mt-1">
                    ${subscriptionStatus.plan.price}
                    <span className="text-sm font-normal text-gray-600">
                      /{subscriptionStatus.plan.billing_cycle}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            {subscriptionStatus.usage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Books Created</span>
                    <span>{formatUsage(
                      subscriptionStatus.usage.books_created_this_period || 0,
                      subscriptionStatus.limits.books_per_month || 0
                    )}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionStatus.usage.books_created_this_period || 0,
                      subscriptionStatus.limits.books_per_month || 0
                    )} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>{formatUsage(
                      subscriptionStatus.usage.api_calls_this_period || 0,
                      subscriptionStatus.limits.api_calls_per_month || 0
                    )}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionStatus.usage.api_calls_this_period || 0,
                      subscriptionStatus.limits.api_calls_per_month || 0
                    )} 
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Subscription Actions */}
            <div className="flex gap-2 pt-4">
              {subscriptionStatus.has_subscription && (
                <>
                  <Button 
                    onClick={handleManageBilling}
                    disabled={actionLoading === 'billing'}
                    variant="outline"
                  >
                    {actionLoading === 'billing' ? 'Loading...' : 'Manage Billing'}
                  </Button>
                  {subscriptionStatus.status === 'active' && (
                    <Button 
                      onClick={handleCancel}
                      disabled={actionLoading === 'cancel'}
                      variant="destructive"
                    >
                      {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Trial Information */}
            {subscriptionStatus.trial_end && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Trial Period</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Your trial ends on {new Date(subscriptionStatus.trial_end).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Cancellation Information */}
            {subscriptionStatus.canceled_at && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Subscription Cancelled</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Your subscription will end on {new Date(subscriptionStatus.current_period_end || '').toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.plan_id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">
                    /{plan.billing_cycle}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features?.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Books: {plan.limits.books_per_month === -1 ? 'Unlimited' : plan.limits.books_per_month}/month</div>
                  <div>API Calls: {plan.limits.api_calls_per_month === -1 ? 'Unlimited' : plan.limits.api_calls_per_month}/month</div>
                  <div>Storage: {plan.limits.storage_gb} GB</div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.plan_id)}
                  disabled={actionLoading === `subscribe-${plan.plan_id}`}
                >
                  {actionLoading === `subscribe-${plan.plan_id}` ? 'Processing...' : 
                   subscriptionStatus?.plan_type === plan.plan_id ? 'Current Plan' : 
                   subscriptionStatus?.plan_type && ['free', 'basic'].includes(subscriptionStatus.plan_type) && ['pro', 'enterprise'].includes(plan.plan_id) ? 'Upgrade' :
                   'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
