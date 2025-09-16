import { useState, useCallback } from 'react';
import { usePaymentApi } from './usePaymentApi';
import { useAuth } from './useAuth';
import { toast } from '@/lib/toast';

interface PaymentIntentData {
  amount: number;
  currency: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  planId: string;
  triggerSource?: string;
  requiredFeature?: string;
}

interface UseStripePaymentReturn {
  clientSecret: string | null;
  isCreatingIntent: boolean;
  createPaymentIntent: (data: PaymentIntentData) => Promise<string | null>;
  clearPaymentIntent: () => void;
  error: string | null;
}

export const useStripePayment = (): UseStripePaymentReturn => {
  const { user } = useAuth();
  const paymentApi = usePaymentApi();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (data: PaymentIntentData): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to make a payment');
      return null;
    }

    setIsCreatingIntent(true);
    setError(null);

    try {
      // Prepare payment intent data
      // Backend expects amount in dollars and converts to cents internally
      console.log('Amount (dollars):', data.amount);
      
      const paymentIntentData = {
        amount: data.amount, // Send amount in dollars, backend will convert to cents
        currency: data.currency.toLowerCase(),
        customer_email: user.email,
        customer_name: user.name || user.email,
        description: `${data.planName} Subscription - ${data.billingCycle}`,
        metadata: {
          plan_id: data.planId,
          billing_cycle: data.billingCycle,
          user_id: String(user.id), // Ensure user ID is a string
          action: data.triggerSource || 'upgrade',
          required_feature: data.requiredFeature,
          timestamp: new Date().toISOString(),
        },
        payment_method_types: ['card'], // Only use card for now, other methods need to be enabled in Stripe dashboard
        idempotency_key: paymentApi.generateIdempotencyKey(),
        confirm: false, // Don't confirm immediately, let Stripe Elements handle it
        capture_method: 'automatic' as const,
      };

      console.log('Creating payment intent with data:', paymentIntentData);
      console.log('User data:', { id: user.id, email: user.email, name: user.name });

      // Create payment intent
      const response = await paymentApi.createPaymentIntent(paymentIntentData);
      
      console.log('Payment intent response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');

      // Extract client secret from response
      let clientSecretValue = null;
      if (response) {
        if (typeof response === 'string') {
          clientSecretValue = response;
        } else if (response.client_secret) {
          clientSecretValue = response.client_secret;
        } else if ((response as any).data?.client_secret) {
          clientSecretValue = (response as any).data.client_secret;
        } else if ((response as any).client_secret) {
          clientSecretValue = (response as any).client_secret;
        }
      }

      console.log('Extracted client secret:', clientSecretValue);

      if (clientSecretValue) {
        setClientSecret(clientSecretValue);
        console.log('Payment intent created successfully:', clientSecretValue);
        return clientSecretValue;
      } else {
        console.error('No client secret found in response:', response);
        throw new Error('Failed to create payment intent - no client secret received');
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      
      let errorMessage = 'Failed to create payment intent';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsCreatingIntent(false);
    }
  }, [user, paymentApi]);

  const clearPaymentIntent = useCallback(() => {
    setClientSecret(null);
    setError(null);
  }, []);

  return {
    clientSecret,
    isCreatingIntent,
    createPaymentIntent,
    clearPaymentIntent,
    error,
  };
};

export default useStripePayment;
