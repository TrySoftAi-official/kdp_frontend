import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Smartphone, Check, AlertCircle, X } from 'lucide-react';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/utils';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/redux/hooks/useAuth';
import { SubscriptionPlan } from '@/services/subscriptionService';
import { StripeProvider } from '@/components/providers/StripeProvider';
import EnhancedStripePaymentForm from './EnhancedStripePaymentForm';

interface PaymentFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
}

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { createPaymentIntent, clientSecret, isCreatingIntent, error, clearPaymentIntent } = useStripePayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Calculate pricing
  const getPrice = () => {
    if (plan.plan_id === 'free') return 0;
    return plan.price;
  };

  const price = getPrice();

  useEffect(() => {
    if (isOpen && plan.plan_id !== 'free' && !clientSecret && !isCreatingIntent) {
      createPaymentIntent({
        amount: price,
        currency: 'USD',
        planId: plan.plan_id,
        planName: plan.name,
        billingCycle,
        triggerSource: 'modal',
        requiredFeature: 'subscription_upgrade',
      });
    }
  }, [isOpen, plan, billingCycle, price, createPaymentIntent, clientSecret, isCreatingIntent]);

  useEffect(() => {
    if (error) {
      setPaymentError(error);
    }
  }, [error]);

  const handleSuccess = () => {
    setIsProcessing(false);
    toast.success('Payment completed successfully!');
    onSuccess();
    onClose();
  };

  const handleError = (error: string) => {
    setIsProcessing(false);
    setPaymentError(error);
    toast.error(error);
  };

  const handleCancel = () => {
    clearPaymentIntent();
    setPaymentError(null);
    onClose();
  };

  const handleRetry = () => {
    setPaymentError(null);
    clearPaymentIntent();
    createPaymentIntent({
      amount: price,
      currency: 'USD',
      planId: plan.plan_id,
      planName: plan.name,
      billingCycle,
      triggerSource: 'modal_retry',
      requiredFeature: 'subscription_upgrade',
    });
  };

  if (plan.plan_id === 'free') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Free Plan Selected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You've selected the free plan. No payment is required.
            </p>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={onSuccess} className="flex-1">
                Activate Free Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Subscription
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-blue-800">{plan.name}</CardTitle>
                  <p className="text-sm text-blue-600">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} subscription
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {plan.popular ? 'Most Popular' : 'Selected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-800">
                  ${price.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">
                  per {billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {isCreatingIntent ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Preparing payment form...</p>
              </div>
            </div>
          ) : paymentError && !clientSecret ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Payment Setup Failed</span>
                </div>
                <p className="text-red-700 text-sm mb-4">{paymentError}</p>
                <div className="flex gap-3">
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Try Again
                  </Button>
                  <Button onClick={handleCancel} variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <EnhancedStripePaymentForm
                amount={price}
                currency="USD"
                planName={plan.name}
                billingCycle={billingCycle}
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={handleCancel}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                clientSecret={clientSecret}
                onRetry={handleRetry}
                customerEmail={user?.email}
                customerName={user?.name || user?.username}
              />
            </StripeProvider>
          ) : (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Payment Not Available</span>
                </div>
                <p className="text-yellow-700 text-sm mb-4">
                  Unable to initialize payment. Please try again.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Retry
                  </Button>
                  <Button onClick={handleCancel} variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and processed securely by Stripe. 
                  We never store your payment details on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFlowModal;
