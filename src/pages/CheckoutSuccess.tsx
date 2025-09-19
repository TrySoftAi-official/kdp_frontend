import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '../lib/toast';
import { SubscriptionService } from '../api/subscriptionService';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [syncingSubscription, setSyncingSubscription] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    const amount = searchParams.get('amount');
    const source = searchParams.get('source');

    if (plan && billing && amount) {
      setSubscriptionData({
        plan,
        billing,
        amount: parseFloat(amount),
        source
      });
    }

    // Auto-sync subscription data from Stripe
    if (source === 'subscription') {
      syncSubscriptionFromStripe();
    }

    setLoading(false);
  }, [searchParams]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your subscription has been activated successfully
          </p>

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
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Subscription Details:
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">
                    {getPlanDisplayName(subscriptionData.plan)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {subscriptionData.billing}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">
                    ${subscriptionData.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              What's Next?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Your subscription is now active
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                You have access to all plan features
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Billing will be automatic going forward
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoToSubscription}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Go to My Subscription
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Download Receipt
            </button>
            <button
              onClick={handleManageBilling}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Manage Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;