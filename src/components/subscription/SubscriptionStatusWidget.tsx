import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  Settings,
  Calendar,
  Zap,
  BarChart3,
  MessageCircle,
  Palette,
  Code,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';
import { toast } from '@/utils/toast';
import { 
  UserSubscriptionWithPlanResponse, 
  SubscriptionStatus
} from '@/apis/subscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';

interface SubscriptionStatusWidgetProps {
  showUpgradeButton?: boolean;
  showUsageDetails?: boolean;
  showManagementActions?: boolean;
  compact?: boolean;
  onUpgrade?: () => void;
  onSubscriptionChange?: () => void;
}

export const SubscriptionStatusWidget: React.FC<SubscriptionStatusWidgetProps> = ({
  showUpgradeButton = true,
  showUsageDetails = true,
  showManagementActions = false,
  compact = false,
  onUpgrade,
  onSubscriptionChange
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    subscriptionStatus: reduxSubscriptionStatus, 
    currentSubscription, 
    isLoading: reduxIsLoading, 
    fetchStatus, 
    fetchCurrent 
  } = useSubscription();
  const paymentApi = usePaymentApi();
  const { getUsageInfo, getCurrentPlan, getSubscriptionStatus } = useFeatureEnforcement();
  
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStatus(),
        fetchCurrent()
      ]);
      
      setSubscriptionStatus(reduxSubscriptionStatus);
      setSubscriptionData(currentSubscription);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription');
    }
  };

  const handleQuickUpgrade = async () => {
    if (!subscriptionStatus?.plan || subscriptionStatus.plan.plan_id === 'free') {
      setIsProcessing(true);
      try {
        // Get available plans and select the first paid plan
        const plans = await fetchPlans(true);
        const firstPaidPlan = plans?.find(plan => plan.plan_id !== 'free');
        
        if (firstPaidPlan) {
          const checkoutData = {
            amount: firstPaidPlan.price,
            currency: 'USD',
            customer_email: user?.email,
            customer_name: user?.name || user?.email,
            description: `${firstPaidPlan.name} Subscription`,
            success_url: `${window.location.origin}/subscription?subscription=success&plan=${firstPaidPlan.plan_id}`,
            cancel_url: `${window.location.origin}/subscription?subscription=cancelled`,
            line_items: [{
              product_name: firstPaidPlan.name,
              product_description: firstPaidPlan.description || `${firstPaidPlan.name} subscription plan`,
              quantity: 1,
              unit_amount: paymentApi.convertToCents(firstPaidPlan.price),
              tax_amount: 0,
              tax_rate: 0
            }],
            metadata: {
              plan_id: firstPaidPlan.plan_id,
              user_id: user?.id
            },
            payment_method_types: ['card'],
            idempotency_key: paymentApi.generateIdempotencyKey()
          };

          const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
          
          if (checkoutSession && checkoutSession.url) {
            window.location.href = checkoutSession.url;
          } else {
            toast.error('Failed to create checkout session');
          }
        }
      } catch (error) {
        console.error('Quick upgrade error:', error);
        toast.error('Failed to initiate upgrade');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'trialing':
        return <Crown className="h-4 w-4 text-blue-500" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
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
      <Card className={compact ? 'p-4' : ''}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading subscription...</span>
        </div>
      </Card>
    );
  }

  if (!subscriptionStatus) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : 'p-6'}>
          <div className="text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Unable to load subscription status</p>
            {showUpgradeButton && (
              <Button size="sm" onClick={handleUpgrade}>
                View Plans
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFreePlan = !subscriptionStatus?.has_subscription || subscriptionStatus?.plan?.plan_id === 'free';
  const isPastDue = subscriptionStatus?.status === 'past_due';
  const isCancelled = subscriptionStatus?.status === 'cancelled';

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(subscriptionStatus?.status || 'free')}
            <div>
              <p className="text-sm font-medium">
                {subscriptionStatus?.plan?.name || 'Free Plan'}
              </p>
              <Badge className={`text-xs ${getStatusColor(subscriptionStatus?.status || 'free')}`}>
                {subscriptionStatus?.status || 'Free'}
              </Badge>
            </div>
          </div>
          {showUpgradeButton && isFreePlan && (
            <Button size="sm" onClick={handleQuickUpgrade} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Upgrade'
              )}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Overview */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{subscriptionStatus.plan?.name || 'Free Plan'}</h3>
            <p className="text-sm text-muted-foreground">
              {subscriptionStatus.plan?.description || 'Basic features included'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {subscriptionStatus.plan?.price ? 
                subscriptionApi.formatCurrency(subscriptionStatus.plan.price) : 
                '$0'
              }/month
            </div>
            <Badge className={getStatusColor(subscriptionStatus?.status || 'free')}>
              <div className="flex items-center gap-1">
                {getStatusIcon(subscriptionStatus?.status || 'free')}
                {subscriptionApi.getStatusLabel(subscriptionStatus?.status || 'free')}
              </div>
            </Badge>
          </div>
        </div>

        {/* Status Messages */}
        {isPastDue && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Payment Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your payment is past due. Please update your payment method.
            </p>
          </div>
        )}

        {isCancelled && subscriptionStatus?.current_period_end && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Subscription Cancelled</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Access ends on {subscriptionApi.formatDate(subscriptionStatus.current_period_end)}
            </p>
          </div>
        )}

        {/* Usage Information */}
        {showUsageDetails && subscriptionStatus?.usage && subscriptionData?.subscription && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Usage This Period</h4>
            
            {/* Books Created */}
            {subscriptionStatus?.plan?.limits?.books_per_month && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Books Created</span>
                  <span className={`text-sm font-medium ${getUsageColor(
                    getUsagePercentage(
                      subscriptionData.subscription.books_created_this_period, 
                      subscriptionStatus.plan.limits.books_per_month
                    )
                  )}`}>
                    {subscriptionData.subscription.books_created_this_period} / {
                      subscriptionStatus.plan.limits.books_per_month === -1 ? 
                        '∞' : 
                        subscriptionStatus.plan.limits.books_per_month
                    }
                  </span>
                </div>
                {subscriptionStatus.plan.limits.books_per_month !== -1 && (
                  <Progress 
                    value={getUsagePercentage(
                      subscriptionData.subscription.books_created_this_period, 
                      subscriptionStatus.plan.limits.books_per_month
                    )} 
                    className="h-2"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Next Billing */}
        {subscriptionStatus?.current_period_end && !isCancelled && (
          <div className="text-sm text-muted-foreground">
            Next billing: {subscriptionApi.formatDate(subscriptionStatus.current_period_end)}
          </div>
        )}

        {/* Actions */}
        {showUpgradeButton && (
          <div className="flex gap-2 pt-2">
            {isFreePlan ? (
              <Button onClick={handleQuickUpgrade} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleUpgrade} className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Plan
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
