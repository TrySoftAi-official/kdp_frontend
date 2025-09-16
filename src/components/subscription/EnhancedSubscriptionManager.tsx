import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { toast } from '@/lib/toast';
import { 
  UserSubscriptionWithPlanResponse, 
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionService
} from '@/api/subscriptionService';
import { cn } from '@/lib/utils';

interface EnhancedSubscriptionManagerProps {
  onSubscriptionChange?: () => void;
  showUpgradePrompt?: boolean;
  className?: string;
}

export const EnhancedSubscriptionManager: React.FC<EnhancedSubscriptionManagerProps> = ({
  onSubscriptionChange,
  showUpgradePrompt = false,
  className
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationFeedback, setCancellationFeedback] = useState('');

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [subscriptionResponse, statusResponse] = await Promise.all([
        subscriptionApi.getMySubscription(),
        subscriptionApi.getMySubscriptionStatus()
      ]);
      
      if (subscriptionResponse.data) {
        setSubscriptionData(subscriptionResponse.data);
      }
      
      if (statusResponse.data) {
        setSubscriptionStatus(statusResponse.data);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  }, [user, subscriptionApi]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Handle subscription upgrade
  const handleUpgrade = useCallback(async (plan: SubscriptionPlan) => {
    // Comprehensive validation
    if (!user) {
      toast.error('You must be logged in to upgrade your subscription');
      return;
    }

    if (!plan) {
      toast.error('Please select a plan');
      return;
    }

    if (!plan.price || plan.price <= 0) {
      toast.error('Invalid plan pricing. Please try again.');
      return;
    }

    if (!user.email) {
      toast.error('Email address is required for payment processing');
      return;
    }

    setIsProcessing(true);
    
    try {
      const checkoutData = {
        amount: plan.price,
        currency: 'USD',
        customer_email: user.email,
        customer_name: user.name || user.email,
        description: `${plan.name} Subscription`,
        success_url: `${window.location.origin}/checkout/success?plan=${plan.plan_id}&source=subscription_manager`,
        cancel_url: `${window.location.origin}/checkout/failure?plan=${plan.plan_id}&source=subscription_manager`,
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
          billing_cycle: plan.billing_cycle || 'monthly',
          user_id: user.id,
          action: 'upgrade',
          timestamp: new Date().toISOString()
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      console.log('Creating checkout session with data:', checkoutData);

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      console.log('Checkout session response:', checkoutSession);

      // Handle different response formats
      let checkoutUrl = null;
      if (checkoutSession) {
        checkoutUrl = checkoutSession.url || checkoutSession.data?.url;
      }

      if (checkoutUrl) {
        console.log('Redirecting to checkout URL:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        console.error('No checkout URL received:', checkoutSession);
        toast.error('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to process upgrade. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('forbidden') || error.message.includes('403')) {
          errorMessage = 'Access denied. Please contact support.';
        } else if (error.message.includes('validation') || error.message.includes('400')) {
          errorMessage = 'Invalid request. Please check your information and try again.';
        } else if (error.message.includes('server') || error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [user, paymentApi]);

  // Handle subscription cancellation
  const handleCancel = useCallback(async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscriptionData?.subscription) return;

    setIsProcessing(true);
    try {
      await subscriptionApi.cancelSubscription({
        cancel_at_period_end: cancelAtPeriodEnd,
        cancellation_reason: cancellationReason,
        feedback: cancellationFeedback
      });

      toast.success(
        cancelAtPeriodEnd 
          ? 'Subscription will be cancelled at the end of the current billing period'
          : 'Subscription has been cancelled immediately'
      );
      
      setShowCancelModal(false);
      setCancellationReason('');
      setCancellationFeedback('');
      await loadSubscriptionData();
      onSubscriptionChange?.();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptionData, cancellationReason, cancellationFeedback, subscriptionApi, loadSubscriptionData, onSubscriptionChange]);

  // Handle subscription downgrade
  const handleDowngrade = useCallback(async (newPlanId: string) => {
    if (!subscriptionData?.subscription) return;

    setIsProcessing(true);
    try {
      await subscriptionApi.downgradeSubscription({
        new_plan_id: newPlanId,
        prorate: true,
        immediate: false
      });

      toast.success('Subscription has been downgraded successfully');
      setShowDowngradeModal(false);
      await loadSubscriptionData();
      onSubscriptionChange?.();
    } catch (error) {
      console.error('Downgrade error:', error);
      toast.error('Failed to downgrade subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptionData, subscriptionApi, loadSubscriptionData, onSubscriptionChange]);

  // Handle subscription reactivation
  const handleReactivate = useCallback(async () => {
    if (!subscriptionData?.subscription) return;

    setIsProcessing(true);
    try {
      await subscriptionApi.reactivateSubscription();
      toast.success('Subscription has been reactivated successfully');
      await loadSubscriptionData();
      onSubscriptionChange?.();
    } catch (error) {
      console.error('Reactivation error:', error);
      toast.error('Failed to reactivate subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptionData, subscriptionApi, loadSubscriptionData, onSubscriptionChange]);

  // Get subscription status info
  const getSubscriptionStatusInfo = () => {
    if (!subscriptionData?.subscription) {
      return { status: 'No Subscription', color: 'text-gray-600 bg-gray-100', icon: XCircle };
    }

    const status = subscriptionData.subscription.status;
    const isActive = SubscriptionService.isSubscriptionActive(subscriptionData.subscription);
    
    if (isActive) {
      return { status: 'Active', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    } else if (status === 'cancelled') {
      return { status: 'Cancelled', color: 'text-red-600 bg-red-100', icon: XCircle };
    } else if (status === 'past_due') {
      return { status: 'Past Due', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle };
    } else {
      return { status: SubscriptionService.getStatusLabel(status), color: SubscriptionService.getStatusColor(status), icon: AlertTriangle };
    }
  };

  const statusInfo = getSubscriptionStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading subscription...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing preferences
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Current Plan</span>
                </div>
                <div className="text-2xl font-bold">
                  {subscriptionData.plan.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {SubscriptionService.formatCurrency(subscriptionData.plan.price)}/{subscriptionData.plan.billing_cycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Next Billing</span>
                </div>
                <div className="text-lg font-semibold">
                  {SubscriptionService.formatDate(subscriptionData.subscription.current_period_end)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {subscriptionData.subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
                </div>
              </div>

              {/* Usage Information */}
              {subscriptionData.usage && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Usage This Period</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {subscriptionData.usage.usage_count} / {subscriptionData.usage.usage_limit || '∞'} books
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {subscriptionData.usage.usage_limit ? 
                      `${Math.round((subscriptionData.usage.usage_count / subscriptionData.usage.usage_limit) * 100)}% used` :
                      'Unlimited'
                    }
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Get started with a subscription to unlock all features
              </p>
              <Button onClick={() => setShowUpgradeModal(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Choose a Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management Actions */}
      {subscriptionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Subscription
            </CardTitle>
            <CardDescription>
              Upgrade, downgrade, or cancel your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upgrade Button */}
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setShowUpgradeModal(true)}
                disabled={isProcessing}
              >
                <ArrowUp className="h-6 w-6 text-green-600" />
                <span className="font-medium">Upgrade Plan</span>
                <span className="text-xs text-muted-foreground">Get more features</span>
              </Button>

              {/* Downgrade Button */}
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setShowDowngradeModal(true)}
                disabled={isProcessing || subscriptionData.subscription.status !== 'active'}
              >
                <ArrowDown className="h-6 w-6 text-yellow-600" />
                <span className="font-medium">Downgrade</span>
                <span className="text-xs text-muted-foreground">Reduce plan features</span>
              </Button>

              {/* Cancel/Reactivate Button */}
              {subscriptionData.subscription.status === 'cancelled' ? (
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={handleReactivate}
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Reactivate</span>
                  <span className="text-xs text-muted-foreground">Restore subscription</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="font-medium">Cancel</span>
                  <span className="text-xs text-muted-foreground">End subscription</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Access Information */}
      {subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Access</CardTitle>
            <CardDescription>
              Features available with your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionStatus.limits ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Books per month:</span>
                    <Badge variant="outline">
                      {subscriptionStatus.limits.books_per_month === -1 ? 'Unlimited' : subscriptionStatus.limits.books_per_month}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Analytics:</span>
                    <Badge variant={subscriptionStatus.limits.analytics_access ? "default" : "secondary"}>
                      {subscriptionStatus.limits.analytics_access ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority Support:</span>
                    <Badge variant={subscriptionStatus.limits.priority_support ? "default" : "secondary"}>
                      {subscriptionStatus.limits.priority_support ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">API Access:</span>
                    <Badge variant={subscriptionStatus.limits.api_access ? "default" : "secondary"}>
                      {subscriptionStatus.limits.api_access ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No feature information available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          setShowUpgradeModal(false);
          loadSubscriptionData();
          onSubscriptionChange?.();
        }}
        currentPlanId={subscriptionData?.subscription?.plan?.plan_id}
        triggerSource="subscription_manager"
      />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Cancel Subscription
              </CardTitle>
              <CardDescription>
                Are you sure you want to cancel your subscription?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for cancellation (optional)</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Help us improve by sharing your reason..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional feedback (optional)</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={cancellationFeedback}
                  onChange={(e) => setCancellationFeedback(e.target.value)}
                  placeholder="Any additional comments..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancel(true)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel at Period End'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-yellow-600" />
                Downgrade Subscription
              </CardTitle>
              <CardDescription>
                Choose a lower plan for your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Downgrading will take effect at the end of your current billing period.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDowngrade('basic')}
                    disabled={isProcessing}
                  >
                    <span className="font-medium">Basic Plan</span>
                    <span className="ml-auto text-sm text-muted-foreground">$9/month</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDowngrade('free')}
                    disabled={isProcessing}
                  >
                    <span className="font-medium">Free Plan</span>
                    <span className="ml-auto text-sm text-muted-foreground">$0/month</span>
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDowngradeModal(false)}
                  className="flex-1"
                >
                  Keep Current Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};