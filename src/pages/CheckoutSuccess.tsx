import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [syncingSubscription, setSyncingSubscription] = useState(false);

  useEffect(() => {
    // Get data from location state (from embedded checkout) or URL params (from hosted checkout)
    const stateData = location.state as any;
    const plan = searchParams.get('plan') || stateData?.plan?.plan_id || stateData?.plan?.name;
    const billing = searchParams.get('billing') || stateData?.billing;
    const amount = searchParams.get('amount') || stateData?.amount;
    const source = searchParams.get('source') || stateData?.source;
    const paymentIntent = stateData?.paymentIntent;

    if (plan && billing && amount !== null) {
      setSubscriptionData({
        plan,
        billing,
        amount: parseFloat(amount.toString()),
        source,
        paymentIntent
      });
    }

    // Auto-sync subscription data from Stripe
    if (source === 'subscription') {
      syncSubscriptionFromStripe();
    }

    setLoading(false);
  }, [searchParams, location.state]);

  const syncSubscriptionFromStripe = async () => {
    try {
      setSyncingSubscription(true);
      
      // Wait a moment for Stripe webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First try to create subscription from payment
      const createResponse = await fetch('/api/subscription/create-subscription-from-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (createResponse.ok) {
        const data = await createResponse.json();
        if (data.success) {
          console.log('Subscription created successfully:', data);
          return;
        }
      }
      
      // If that fails, try to fetch and save from Stripe
      const response = await fetch('/api/subscription/fetch-and-save-stripe-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Subscription synced successfully:', data);
        } else {
          console.warn('Subscription sync failed:', data.message);
        }
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
    } finally {
      setSyncingSubscription(false);
    }
  };

  const handleGoToSubscription = () => {
    navigate('/subscription');
  };

  const handleDownloadReceipt = async () => {
    try {
      // Get the latest invoice from Stripe
      const response = await fetch('/api/subscription/billing/invoices?limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const invoices = await response.json();
        if (invoices.length > 0 && invoices[0].invoice_pdf) {
          window.open(invoices[0].invoice_pdf, '_blank');
        } else {
          toast.info('Receipt will be available shortly');
        }
      } else {
        toast.info('Receipt will be available shortly');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.info('Receipt will be available shortly');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.portal_url, '_blank');
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const getPlanDisplayName = (planId: string) => {
    const planNames = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Pro',
      enterprise: 'Enterprise'
    };
    return planNames[planId as keyof typeof planNames] || planId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {/* Success Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your subscription has been activated successfully
          </p>
          <p className="text-gray-500">
            Welcome to your new plan! You now have access to all premium features.
          </p>
        </div>

          {/* Syncing Indicator */}
          {syncingSubscription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800">Syncing subscription data...</span>
              </div>
            </div>
          )}

        {/* Subscription Details */}
        {subscriptionData && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Plan</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {getPlanDisplayName(subscriptionData.plan)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {subscriptionData.billing}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${subscriptionData.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-1">Subscription Active</h4>
                <p className="text-sm text-green-700">Your plan is now active and ready to use</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900 mb-1">Full Access</h4>
                <p className="text-sm text-blue-700">You have access to all premium features</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900 mb-1">Auto Billing</h4>
                <p className="text-sm text-purple-700">Billing will be automatic going forward</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToSubscription}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Go to My Subscription
          </Button>
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="px-8 py-3 text-lg font-semibold"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Receipt
          </Button>
          <Button
            onClick={handleManageBilling}
            variant="outline"
            className="px-8 py-3 text-lg font-semibold"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Manage Billing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
