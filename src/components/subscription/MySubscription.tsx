import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { toast } from '@/lib/toast';
import { UserSubscriptionWithPlanResponse } from '@/api/subscriptionService';

interface MySubscriptionProps {
  onUpgrade?: () => void;
  onCancel?: () => void;
}

export const MySubscription: React.FC<MySubscriptionProps> = ({
  onUpgrade,
  onCancel
}) => {
  const subscriptionApi = useSubscriptionApi();
  
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionApi.getMySubscription();
      if (data) {
        setSubscriptionData(data);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await subscriptionApi.cancelSubscription({
        cancel_at_period_end: true,
        cancellation_reason: 'User requested cancellation',
        feedback: 'Cancelled via account settings'
      });

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
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscriptionData?.subscription) return;

    setIsProcessing(true);
    try {
      // This would typically call an API to reactivate the subscription
      toast.info('Subscription reactivation feature coming soon');
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getUsagePercentage = (current: number, limit?: number) => {
    if (!limit || limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading subscription details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-4">
              You're currently on the free plan. Upgrade to unlock premium features.
            </p>
            <Button onClick={onUpgrade}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { subscription, plan } = subscriptionData || {};
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';
  const isPastDue = subscription?.status === 'past_due';

  // If no subscription data, show the no subscription state
  if (!subscriptionData || !subscriptionData.subscription || !subscriptionData.plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-4">
              You're currently on the free plan. Upgrade to unlock premium features.
            </p>
            <Button onClick={onUpgrade}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Subscription
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadSubscriptionData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Overview */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{plan?.name || 'Free Plan'}</h3>
            <p className="text-muted-foreground">{plan?.description || 'Basic features included'}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrency(plan?.price || 0)}/{subscription?.billing_cycle || 'month'}
            </div>
            <Badge className={getStatusColor(subscription?.status || 'free')}>
              <div className="flex items-center gap-1">
                {getStatusIcon(subscription?.status || 'free')}
                {subscriptionApi.getStatusLabel(subscription?.status || 'free')}
              </div>
            </Badge>
          </div>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Period</label>
            <p className="text-sm">
              {subscription?.current_period_start && subscription?.current_period_end ? 
                `${formatDate(subscription.current_period_start)} - ${formatDate(subscription.current_period_end)}` :
                'No active subscription'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Next Billing Date</label>
            <p className="text-sm">
              {isCancelled ? 'No future billing' : 
                subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'No active subscription'
              }
            </p>
          </div>
        </div>

        {/* Trial Information */}
        {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Trial Period</span>
            </div>
            <p className="text-sm text-blue-800">
              Your trial ends on {formatDate(subscription.trial_end)}. 
              You'll be automatically charged {formatCurrency(plan?.price || 0)} on that date.
            </p>
          </div>
        )}

        {/* Cancellation Notice */}
        {isCancelled && subscription?.canceled_at && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Subscription Cancelled</span>
            </div>
            <p className="text-sm text-yellow-800">
              Your subscription was cancelled on {formatDate(subscription.canceled_at)}. 
              You'll retain access until {subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'the end of your billing period'}.
            </p>
          </div>
        )}

        {/* Past Due Notice */}
        {isPastDue && (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900">Payment Required</span>
            </div>
            <p className="text-sm text-red-800">
              Your payment is past due. Please update your payment method to continue using premium features.
            </p>
          </div>
        )}

        {/* Usage Information */}
        {plan?.limits && (
          <div className="space-y-4">
            <h4 className="font-medium">Usage This Period</h4>
            
            {/* Books Created */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Books Created</span>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription?.books_created_this_period || 0, plan.limits.books_per_month))}`}>
                  {subscription?.books_created_this_period || 0} / {plan.limits.books_per_month === -1 ? '∞' : plan.limits.books_per_month}
                </span>
              </div>
              {plan.limits.books_per_month !== -1 && (
                <Progress 
                  value={getUsagePercentage(subscription?.books_created_this_period || 0, plan.limits.books_per_month)} 
                  className="h-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Plan Features */}
        {plan?.features && Array.isArray(plan.features) && plan.features.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {!isCancelled && (
            <Button variant="outline" onClick={onUpgrade}>
              <Settings className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
          )}
          
          {isCancelled && (
            <Button variant="outline" onClick={handleReactivateSubscription} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reactivate
            </Button>
          )}
          
          {isActive && !isCancelled && (
            <Button 
              variant="outline" 
              onClick={handleCancelSubscription} 
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Cancel Subscription
            </Button>
          )}
          
          <Button variant="outline" onClick={() => window.open('/billing', '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            Billing Portal
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
