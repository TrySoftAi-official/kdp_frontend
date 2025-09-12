import { useState, useCallback } from 'react';
import { usePaymentApi } from './usePaymentApi';
import { useSubscriptionApi } from './useSubscriptionApi';
import { useAuth } from './useAuth';
import { toast } from '@/lib/toast';
import { SubscriptionPlan } from '@/api/subscriptionService';

interface PaymentFlowState {
  isProcessing: boolean;
  currentStep: 'idle' | 'creating_session' | 'redirecting' | 'processing' | 'success' | 'error';
  error: string | null;
  checkoutUrl: string | null;
}

interface UsePaymentFlowReturn {
  state: PaymentFlowState;
  initiatePayment: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => Promise<boolean>;
  handlePaymentSuccess: () => Promise<void>;
  handlePaymentError: (error: string) => void;
  resetFlow: () => void;
}

export const usePaymentFlow = (): UsePaymentFlowReturn => {
  const { user } = useAuth();
  const paymentApi = usePaymentApi();
  const subscriptionApi = useSubscriptionApi();
  
  const [state, setState] = useState<PaymentFlowState>({
    isProcessing: false,
    currentStep: 'idle',
    error: null,
    checkoutUrl: null
  });

  const initiatePayment = useCallback(async (
    plan: SubscriptionPlan, 
    billingCycle: 'monthly' | 'yearly'
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to make a payment');
      return false;
    }

    if (plan.plan_id === 'free') {
      toast.error('Cannot process payment for free plan');
      return false;
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'creating_session',
      error: null
    }));

    try {
      // Create checkout session
      const checkoutData = {
        amount: plan.price,
        currency: 'USD',
        customer_email: user.email,
        customer_name: user.name || user.username,
        description: `${plan.name} Subscription - ${billingCycle}`,
        success_url: `${window.location.origin}/account?subscription=success&plan=${plan.plan_id}`,
        cancel_url: `${window.location.origin}/account?subscription=cancelled`,
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
          billing_cycle: billingCycle,
          user_id: user.id,
          plan_name: plan.name
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      setState(prev => ({ ...prev, currentStep: 'creating_session' }));

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      if (checkoutSession && checkoutSession.url) {
        setState(prev => ({
          ...prev,
          currentStep: 'redirecting',
          checkoutUrl: checkoutSession.url
        }));

        // Redirect to Stripe Checkout
        window.location.href = checkoutSession.url;
        return true;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'error',
        error: errorMessage
      }));

      toast.error(errorMessage);
      return false;
    }
  }, [user, paymentApi]);

  const handlePaymentSuccess = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'processing',
      error: null
    }));

    try {
      // Refresh subscription data to get the latest status
      await subscriptionApi.getMySubscription();
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'success'
      }));

      toast.success('Payment successful! Your subscription has been activated.');
    } catch (error) {
      console.error('Payment success handling error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'error',
        error: 'Failed to update subscription status'
      }));
    }
  }, [subscriptionApi]);

  const handlePaymentError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
      currentStep: 'error',
      error
    }));

    toast.error(error);
  }, []);

  const resetFlow = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: 'idle',
      error: null,
      checkoutUrl: null
    });
  }, []);

  return {
    state,
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentError,
    resetFlow
  };
};
