import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
  PaymentElement
} from '@stripe/react-stripe-js';
import { STRIPE_CONFIG, isStripeConfigured } from '@/config/stripe';
import { toast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Check, 
  CreditCard, 
  Smartphone, 
  X, 
  Shield,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { SubscriptionPlan } from '@/apis/subscription';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface StripeCheckoutProps {
  plan: SubscriptionPlan;
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

interface CheckoutFormProps {
  plan: SubscriptionPlan;
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  plan,
  clientSecret,
  onSuccess,
  onError,
  onClose
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  const planId = plan.plan_id || (plan as any).plan;
  const amount = (plan as any).price_monthly || plan.price || 0;

  useEffect(() => {
    if (stripe && amount > 0) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: `${plan.name} Plan`,
          amount: Math.round(amount * 100), // Convert to cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: false,
      });

      // Check if payment request is available
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      // Handle payment request success
      pr.on('paymentmethod', async (ev) => {
        setIsProcessing(true);
        try {
          const { error: confirmError } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete('fail');
            onError(confirmError);
          } else {
            ev.complete('success');
            onSuccess(ev.paymentMethod);
          }
        } catch (error) {
          ev.complete('fail');
          onError(error);
        } finally {
          setIsProcessing(false);
        }
      });
    }
  }, [stripe, amount, plan.name, clientSecret, onSuccess, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?plan=${planId}&amount=${amount}&billing=monthly&source=subscription`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Shield className="h-6 w-6" />;
      case 'basic':
        return <CreditCard className="h-6 w-6" />;
      case 'pro':
        return <Sparkles className="h-6 w-6" />;
      case 'enterprise':
        return <Lock className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-slate-500 to-slate-600';
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'pro':
        return 'from-purple-500 to-pink-500';
      case 'enterprise':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${getPlanGradient(planId)} text-white shadow-lg`}>
              {getPlanIcon(planId)}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Purchase
          </CardTitle>
          <CardDescription className="text-gray-600">
            Secure payment powered by Stripe
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{plan.name}</span>
              <Badge className="bg-green-100 text-green-800">Selected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="font-medium text-gray-900 capitalize">
                {plan.billing_cycle || 'monthly'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            {/* Apple Pay / Google Pay */}
            {canMakePayment && paymentRequest && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-3">
                  <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Quick Pay</span>
                </div>
                <PaymentRequestButtonElement
                  options={{
                    paymentRequest,
                    style: {
                      paymentRequestButton: {
                        theme: 'dark',
                        height: '48px',
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* Divider */}
            {canMakePayment && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or pay with card</span>
                </div>
              </div>
            )}

            {/* Card Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Information
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <PaymentElement
                    options={{
                      layout: 'tabs',
                      paymentMethodOrder: ['card', 'klarna', 'afterpay_clearpay'],
                    }}
                  />
                </div>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Instant Access</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!stripe || isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-blue-700">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                <span>Money Back</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  plan,
  clientSecret,
  onSuccess, // eslint-disable-line @typescript-eslint/no-unused-vars
  onError, // eslint-disable-line @typescript-eslint/no-unused-vars
  onClose
}) => {
  const navigate = useNavigate();

  // Check if Stripe is properly configured
  if (!isStripeConfigured()) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6">
            Stripe is not properly configured. Please contact support.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const handleSuccess = (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    toast.success('Payment successful! Redirecting...');
    
    // Navigate to success page with payment details
    navigate('/checkout/success', {
      state: {
        paymentIntent,
        plan,
        amount: (plan as any).price_monthly || plan.price || 0,
        billing: plan.billing_cycle || 'monthly',
        source: 'subscription'
      }
    });
  };

  const handleError = (error: any) => {
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
    
    // Navigate to failure page with error details
    navigate('/checkout/failure', {
      state: {
        error: error.message || 'Payment failed',
        plan,
        paymentIntent: error.payment_intent?.id
      }
    });
  };

  const options = {
    clientSecret,
    appearance: STRIPE_CONFIG.appearance,
    paymentMethodTypes: STRIPE_CONFIG.paymentMethodTypes,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Secure Checkout</h2>
              <p className="text-sm text-gray-500">Complete your subscription purchase</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              plan={plan}
              clientSecret={clientSecret}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
