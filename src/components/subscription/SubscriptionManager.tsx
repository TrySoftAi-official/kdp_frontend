import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Crown, 
  Shield, 
  Loader2,
  RefreshCw,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { 
  SubscriptionPlan, 
  SubscriptionBilling,
  UserSubscriptionWithPlanResponse 
} from '@/apis/subscription';
import { toast } from '@/utils/toast';

interface SubscriptionManagerProps {
  onUpgrade?: (planId: string) => void;
  onCancel?: () => void;
  showUpgradeButton?: boolean;
  showCancelButton?: boolean;
  className?: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  onUpgrade,
  onCancel,
  showUpgradeButton = true,
  showCancelButton = true,
  className = ''
}) => {
  const { currentSubscription: reduxCurrentSubscription, fetchCurrent } = useSubscription();
  
  // State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [billingHistory, setBillingHistory] = useState<SubscriptionBilling[]>([]);
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load subscription data
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      await subscriptionApi.loadAll();

      if (subscriptionApi.plans) setPlans(subscriptionApi.plans);
      if (subscriptionApi.currentSubscription) setCurrentSubscription(subscriptionApi.currentSubscription);
      if (subscriptionApi.billingHistory) setBillingHistory(subscriptionApi.billingHistory);
      if (subscriptionApi.features) setFeatures(subscriptionApi.features);

    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      const result = await subscriptionApi.upgradeSubscription({
        new_plan: planId,
        billing_cycle: 'monthly',
        immediate: false
      });

      if (result) {
        toast.success('Subscription upgraded successfully!');
        await loadSubscriptionData();
        onUpgrade?.(planId);
      } else {
        toast.error(subscriptionApi.error || 'Failed to upgrade subscription');
      }
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await subscriptionApi.cancelSubscription(false); // Cancel at period end

      if (result) {
        toast.success('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        await loadSubscriptionData();
        onCancel?.();
      } else {
        toast.error(subscriptionApi.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefresh = async () => {
    await loadSubscriptionData();
    toast.success('Subscription data refreshed');
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading subscription information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={subscriptionApi.isSubscriptionActive(currentSubscription.subscription) ? 'default' : 'secondary'}
                  className={subscriptionApi.getStatusColor(currentSubscription.subscription?.status || 'inactive')}
                >
                  {subscriptionApi.getStatusLabel(currentSubscription.subscription?.status || 'inactive')}
                </Badge>
                <span className="font-semibold">
                  {subscriptionApi.getPlanLabel(currentSubscription.plan.plan_id)}
                </span>
                <span className="text-muted-foreground">
                  {subscriptionApi.formatCurrency(currentSubscription.plan.price)}/{subscriptionApi.getBillingCycleLabel(currentSubscription.plan.billing_cycle)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Next billing: {currentSubscription.subscription?.current_period_end ? subscriptionApi.formatDate(currentSubscription.subscription.current_period_end) : 'N/A'}
              </div>
            </div>

            {/* Usage Stats */}
            {currentSubscription.plan.limits && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Books this period</span>
                  <span>
                    {currentSubscription.subscription?.books_created_this_period || 0} / {currentSubscription.plan.limits.books_per_month}
                  </span>
                </div>
                <Progress 
                  value={subscriptionApi.getUsagePercentage(
                    currentSubscription.subscription?.books_created_this_period || 0,
                    currentSubscription.plan.limits.books_per_month
                  )} 
                  className="h-2"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {showUpgradeButton && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpgrade?.(currentSubscription.plan.plan_id)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              {showCancelButton && subscriptionApi.isSubscriptionActive(currentSubscription.subscription) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="text-red-600 hover:text-red-700"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <div className="text-3xl font-bold">
                      {subscriptionApi.formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{subscriptionApi.getBillingCycleLabel(plan.billing_cycle)}
                      </span>
                    </div>
                    
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}

                    {/* Features */}
                    {plan.limits && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{plan.limits.books_per_month} books/month</span>
                        </div>
                        {plan.limits.analytics_access && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Analytics Access</span>
                          </div>
                        )}
                        {plan.limits.priority_support && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Priority Support</span>
                          </div>
                        )}
                        {plan.limits.custom_branding && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Custom Branding</span>
                          </div>
                        )}
                        {plan.limits.api_access && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>API Access</span>
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.plan_id)}
                      disabled={isUpgrading || currentSubscription?.plan.plan_id === plan.plan_id}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Upgrading...
                        </>
                      ) : currentSubscription?.plan.plan_id === plan.plan_id ? (
                        'Current Plan'
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Access */}
      {Object.keys(features).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Feature Access
            </CardTitle>
            <CardDescription>
              Your current plan features and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(features).map(([feature, hasAccess]) => (
                <div key={feature} className="flex items-center gap-3 p-3 border rounded-lg">
                  {hasAccess ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {subscriptionApi.getFeatureIcon(feature)} {subscriptionApi.getFeatureDescription(feature)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hasAccess ? 'Available' : 'Not available'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Billing History
            </CardTitle>
            <CardDescription>
              Your recent subscription payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((billing) => (
                <div key={billing.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      billing.payment_status === 'succeeded' ? 'bg-green-500' : 
                      billing.payment_status === 'failed' ? 'bg-red-500' : 
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {subscriptionApi.formatCurrency(billing.amount, billing.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subscriptionApi.formatDate(billing.billing_period_start)} - {subscriptionApi.formatDate(billing.billing_period_end)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className={subscriptionApi.getStatusColor(billing.payment_status)}
                    >
                      {subscriptionApi.getStatusLabel(billing.payment_status)}
                    </Badge>
                    {billing.paid_at && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Paid: {subscriptionApi.formatDate(billing.paid_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {subscriptionApi.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{subscriptionApi.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;

