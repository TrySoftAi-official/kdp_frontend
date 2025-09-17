
import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { STRIPE_CONFIG } from '@/config/stripe';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Smartphone, Globe, Check, ArrowLeft, Crown, Zap, Users, BarChart3 } from 'lucide-react';
import { SubscriptionPlan } from '@/api/subscriptionService';

interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  requiredFeature?: string;
  triggerSource?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  requiredFeature,
  triggerSource = 'checkout_modal'
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const { clientSecret, createPaymentIntent, clearPaymentIntent, error } = useStripePayment();
  
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Get URL parameters for backward compatibility
  const applicationID = searchParams.get("applicationID");
  const action = searchParams.get("action");

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
        setStripePromise(stripe);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        toast.error('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, []);

  useEffect(() => {
    if (isOpen && currentStep === 'plans') {
      loadSubscriptionPlans();
    }
  }, [isOpen, currentStep]);

  const loadSubscriptionPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await subscriptionApi.getSubscriptionPlans();
      if (response) {
        setPlans(response);
      }
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCreatePaymentIntent = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    const paymentData = {
      amount: plan.price,
      currency: 'usd',
      planName: plan.name,
      billingCycle: plan.billing_cycle,
      planId: plan.plan_id,
      triggerSource,
      requiredFeature
    };

    await createPaymentIntent(paymentData);
  };

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
    await handleCreatePaymentIntent(plan);
  };

  const handleBackToPlans = () => {
    setCurrentStep('plans');
    setSelectedPlan(null);
    clearPaymentIntent();
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // Default success behavior
      navigate(-1);
    }
  };

  const handleClose = () => {
    clearPaymentIntent();
    setCurrentStep('plans');
    setSelectedPlan(null);
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="h-6 w-6" />;
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <Crown className="h-6 w-6" />;
    }
  };

  const renderPlansStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your needs</p>
      </div>

      {loadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.plan_id} className="relative">
              {plan.plan_id === 'pro' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {renderPlanIcon(plan.plan_id)}
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">${plan.price}</div>
                  <div className="text-sm text-gray-500">per {plan.billing_cycle}</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {plan.limits?.books_per_month && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.limits.books_per_month} books per month</span>
                    </div>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.features.join(', ')}</span>
                    </div>
                  )}
                  {plan.description && (
                    <div className="text-xs text-gray-500 mt-2">
                      {plan.description}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full"
                  variant={plan.plan_id === 'pro' ? 'default' : 'outline'}
                >
                  {plan.plan_id === 'free' ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBackToPlans}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Complete Your Payment</h2>
          {selectedPlan && (
            <p className="text-gray-600">You're subscribing to the {selectedPlan.name} plan</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {stripePromise && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onSuccess={handleSuccess}
            onClose={handleClose}
            applicationID={applicationID}
            action={action}
            selectedPlan={selectedPlan}
          />
        </Elements>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Initializing payment system...</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-5 lg:px-24 py-10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Button variant="ghost" onClick={handleClose}>
              ×
            </Button>
          </div>

          {currentStep === 'plans' ? renderPlansStep() : renderPaymentStep()}
        </div>
      </div>
    </div>
  );
};


interface CheckoutFormProps {
  onSuccess: () => void;
  onClose: () => void;
  applicationID: string | null;
  action: string | null;
  selectedPlan?: SubscriptionPlan | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess,
  onClose,
  applicationID,
  action,
  selectedPlan
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        console.error('Payment error:', stripeError);
        // Navigate to failure page
        navigate('/checkout/failure', { 
          state: { 
            error: stripeError.message,
            plan: selectedPlan,
            paymentIntent: undefined
          } 
        });
      } else if (paymentIntent) {
        // Check if payment was successful
        if (paymentIntent.status === 'succeeded') {
          toast.success('Payment completed successfully!');
          // Navigate to success page with payment details
          navigate('/checkout/success', { 
            state: { 
              paymentIntent: paymentIntent,
              plan: selectedPlan,
              amount: selectedPlan?.price 
            } 
          });
          onSuccess();
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing, show success but note it's processing
          toast.success('Payment is being processed!');
          navigate('/checkout/success', { 
            state: { 
              paymentIntent: paymentIntent,
              plan: selectedPlan,
              amount: selectedPlan?.price,
              processing: true
            } 
          });
          onSuccess();
        } else if (paymentIntent.status === 'requires_action') {
          // Payment requires additional action (like 3D Secure)
          setError('Payment requires additional authentication. Please complete the verification.');
          // Don't navigate away, let user complete the action
        } else {
          // Payment failed or in unexpected state
          setError(`Payment failed with status: ${paymentIntent.status}`);
          navigate('/checkout/failure', { 
            state: { 
              error: `Payment failed with status: ${paymentIntent.status}`,
              plan: selectedPlan,
              paymentIntent: paymentIntent
            } 
          });
        }
      } else {
        // No payment intent returned
        setError('No payment intent received from Stripe');
        navigate('/checkout/failure', { 
          state: { 
            error: 'No payment intent received from Stripe',
            plan: selectedPlan,
            paymentIntent: undefined
          } 
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Payment error:', err);
      // Navigate to failure page for unexpected errors
      navigate('/checkout/failure', { 
        state: { 
          error: errorMessage,
          plan: selectedPlan,
          paymentIntent: undefined 
        } 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
      {/* Payment Form */}
      <Card className="lg:w-2/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Complete your payment securely with Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <PaymentElement />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
            type="submit"
                className="flex-1"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </Button>
        </div>
      </form>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="lg:w-1/3">
        <CardHeader>
          <CardTitle className="text-center">
            {action ? `${action} Summary` : 'Payment Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationID && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Application ID</span>
              <span className="font-semibold">{applicationID}</span>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Total Amount</span>
              <span className="text-lg font-bold">${selectedPlan?.price || 29.99}</span>
            </div>
            <p className="text-xs text-muted-foreground">USD</p>
            {selectedPlan && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p className="font-medium">{selectedPlan.name} Plan</p>
                <p className="text-gray-600">{selectedPlan.description}</p>
              </div>
            )}
        </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Credit & Debit Cards</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>Google Pay & Apple Pay</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-purple-600" />
              <span>Secure Payment Processing</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              Your payment is processed securely by Stripe. No setup fees or monthly fees.
              The same pricing applies to all payment methods.
            </p>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutModal;
