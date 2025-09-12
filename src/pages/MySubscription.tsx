import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MySubscription } from '@/components/subscription/MySubscription';
import { BillingHistory } from '@/components/subscription/BillingHistory';
import { SubscriptionPlansModal } from '@/components/subscription/SubscriptionPlansModal';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { toast } from '@/lib/toast';
import { UserSubscriptionWithPlanResponse } from '@/api/subscriptionService';

export const MySubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentFlow = usePaymentFlow();
  
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

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

  const handleDownloadInvoice = async () => {
    try {
      // This would typically open a billing portal or download invoices
      toast.info('Billing portal feature coming soon');
    } catch (error) {
      toast.error('Failed to access billing portal');
    }
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
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Billing Portal
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
                  onClick={handleDownloadInvoice}
                >
                  <Download className="h-6 w-6" />
                  <span className="font-medium">Billing Portal</span>
                  <span className="text-xs text-muted-foreground">Manage payments</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('/support', '_blank')}
                >
                  <Settings className="h-6 w-6" />
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
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleUpgrade}>
                  Change Plan
                </Button>
                <Button variant="outline" onClick={handleDownloadInvoice}>
                  Billing Portal
                </Button>
                <Button variant="outline" onClick={() => window.open('/support', '_blank')}>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={handlePlansModalClose}
        onSuccess={() => {
          setShowPlansModal(false);
          loadSubscriptionData();
        }}
        currentPlanId={subscriptionData?.subscription?.plan?.plan_id}
      />
    </div>
  );
};
