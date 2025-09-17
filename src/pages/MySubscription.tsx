import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Settings, Download, ExternalLink, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MySubscription } from '@/components/subscription/MySubscription';
import { BillingHistory } from '@/components/subscription/BillingHistory';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { toast } from '@/lib/toast';
import { UserSubscriptionWithPlanResponse } from '@/api/subscriptionService';

export const MySubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [isLoadingBillingPortal, setIsLoadingBillingPortal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
    
    // Handle payment success/cancellation from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    const planId = urlParams.get('plan');
    
    if (subscriptionStatus === 'success') {
      toast.success(`Welcome to ${planId || 'your new plan'}! Your subscription is now active.`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const data = await subscriptionApi.getMySubscription();
      if (data) {
        setSubscriptionData(data);
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    }
  };

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    try {
      await loadSubscriptionData();
      toast.success('Subscription data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh subscription data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpgrade = () => {
    setShowPlansModal(true);
  };

  const handlePlansModalClose = () => {
    setShowPlansModal(false);
    // Refresh subscription data in case user completed a payment
    loadSubscriptionData();
  };

  const handleCancel = () => {
    // Refresh subscription data after cancellation
    loadSubscriptionData();
  };

  const handleBillingPortal = async () => {
    if (!user || !subscriptionData?.subscription?.stripe_customer_id) {
      toast.error('Customer information not available');
      return;
    }

    setIsLoadingBillingPortal(true);
    try {
      const response = await paymentApi.createBillingPortalSession({
        customer_id: subscriptionData.subscription.stripe_customer_id,
        return_url: `${window.location.origin}/subscription`
      });

      if (response && response.url) {
        // Redirect to Stripe billing portal
        window.location.href = response.url;
      } else {
        throw new Error('No billing portal URL received');
      }
    } catch (error) {
      console.error('Failed to create billing portal session:', error);
      toast.error('Failed to access billing portal. Please try again.');
    } finally {
      setIsLoadingBillingPortal(false);
    }
  };

  const handleContactSupport = () => {
    // Open support email or redirect to support page
    const subject = encodeURIComponent('Subscription Support Request');
    const body = encodeURIComponent(`Hi there,

I need help with my subscription:

User ID: ${user?.id}
Email: ${user?.email}
Current Plan: ${subscriptionData?.plan?.name || 'Unknown'}

Please describe your issue here...

Best regards,
${user?.name || user?.email}`);
    
    window.open(`mailto:support@forgekdp.com?subject=${subject}&body=${body}`, '_blank');
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
          <p className="text-muted-foreground">
            Please log in to view your subscription details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing, and payment information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleBillingPortal}
            disabled={isLoadingBillingPortal || !subscriptionData?.subscription?.stripe_customer_id}
          >
            {isLoadingBillingPortal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Billing Portal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MySubscription 
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
          />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={handleUpgrade}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="font-medium">Change Plan</span>
                  <span className="text-xs text-muted-foreground">Upgrade or downgrade</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={handleBillingPortal}
                  disabled={isLoadingBillingPortal || !subscriptionData?.subscription?.stripe_customer_id}
                >
                  {isLoadingBillingPortal ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ExternalLink className="h-6 w-6" />
                  )}
                  <span className="font-medium">Billing Portal</span>
                  <span className="text-xs text-muted-foreground">Manage payments</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={handleContactSupport}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="font-medium">Support</span>
                  <span className="text-xs text-muted-foreground">Get help</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingHistory limit={20} showHeader={true} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Manage your subscription preferences and notifications.</p>
                <p className="mt-2">
                  For billing inquiries or subscription changes, please contact our support team.
                </p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> If you just completed a payment but don't see your subscription updated, 
                    try clicking the "Refresh" button above or wait a few minutes for the system to sync.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleUpgrade}>
                  Change Plan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBillingPortal}
                  disabled={isLoadingBillingPortal || !subscriptionData?.subscription?.stripe_customer_id}
                >
                  {isLoadingBillingPortal ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Billing Portal
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleContactSupport}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Plans Modal */}
      <CheckoutModal
        isOpen={showPlansModal}
        onClose={handlePlansModalClose}
        onSuccess={() => {
          setShowPlansModal(false);
          loadSubscriptionData();
        }}
        triggerSource="my_subscription"
      />
    </div>
  );
};
