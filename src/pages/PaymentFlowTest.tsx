import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';
import { Crown, CreditCard, CheckCircle } from 'lucide-react';

export const PaymentFlowTest: React.FC = () => {
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const { user } = useAuth();

  const handleUpgradeSuccess = () => {
    toast.success('🎉 Payment successful! Your subscription has been upgraded.');
    setShowUpgradeFlow(false);
  };

  const handleUpgradeClick = () => {
    if (!user) {
      toast.error('Please log in to test the payment flow.');
      return;
    }
    setShowUpgradeFlow(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Payment Flow Test
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Test the complete subscription upgrade flow with Stripe integration
            </p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Ready to Test</h3>
              </div>
              <p className="text-green-700">
                This test page allows you to verify the complete payment flow:
              </p>
              <ul className="mt-3 space-y-2 text-green-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Plan selection (Basic, Pro, Enterprise)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Payment method selection (Card, Google Pay, Apple Pay, Klarna)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Stripe Checkout integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Success/failure page redirects
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Subscription status refresh
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Test Instructions</h3>
              <ol className="space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                  <span>Click the "Test Payment Flow" button below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                  <span>Select a subscription plan (Basic, Pro, or Enterprise)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                  <span>Choose a payment method and fill in the details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                  <span>Complete the payment through Stripe Checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">5</span>
                  <span>Verify you're redirected to the success page</span>
                </li>
              </ol>
            </div>

            <div className="text-center">
              <Button
                onClick={handleUpgradeClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              >
                <CreditCard className="h-6 w-6 mr-3" />
                Test Payment Flow
              </Button>
            </div>

            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Current User</h4>
                <p className="text-sm text-gray-600">
                  Logged in as: <strong>{user.email}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  User ID: <strong>{user.id}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {showUpgradeFlow && (
          <CheckoutModal
            isOpen={showUpgradeFlow}
            onClose={() => setShowUpgradeFlow(false)}
            onSuccess={handleUpgradeSuccess}
            requiredFeature="Payment Flow Test"
            triggerSource="payment_test"
          />
        )}
      </div>
    </div>
  );
};
