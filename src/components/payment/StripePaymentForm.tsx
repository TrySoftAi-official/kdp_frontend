import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, Loader2, Lock, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/utils';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  clientSecret: string; // ✅ pass this down from backend when creating PaymentIntent
  onRetry?: () => void; // Optional retry callback
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  planName,
  billingCycle,
  onSuccess,
  onError,
  onCancel,
  isProcessing,
  setIsProcessing,
  clientSecret,
  onRetry,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (stripe && elements) {
      console.log('Stripe and Elements loaded successfully');
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Check if client secret is still valid
      if (!clientSecret) {
        throw new Error('Payment session has expired. Please try again.');
      }

      // ✅ Use confirmCardPayment with clientSecret passed from props
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        
        // Handle specific Stripe errors
        if (error.code === 'payment_intent_unexpected_state') {
          setMessage('Payment session has expired. Please try again.');
          onError('Payment session has expired. Please try again.');
        } else if (error.type === 'card_error') {
          setMessage(error.message || 'Card payment failed.');
          onError(error.message || 'Card payment failed.');
        } else if (error.type === 'validation_error') {
          setMessage('Invalid payment information. Please check your card details.');
          onError('Invalid payment information. Please check your card details.');
        } else {
          setMessage(error.message || 'An unexpected error occurred.');
          onError(error.message || 'Payment failed');
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        toast.success('Payment completed successfully!');
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        setMessage('Payment requires additional verification. Please complete the verification process.');
        // Don't call onError here as this is a normal flow for 3D Secure
      } else {
        setMessage('Payment status: ' + paymentIntent?.status);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">{planName}</h3>
              <p className="text-sm text-blue-600">
                {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} subscription
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800">
                ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
              </div>
              <div className="text-sm text-blue-600">
                per {billingCycle === 'monthly' ? 'month' : 'year'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            {stripe && elements ? (
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
                onChange={(event) => {
                  setIsComplete(event.complete);
                  if (event.error) {
                    setMessage(event.error.message || null);
                  } else {
                    setMessage(null);
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-20 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading payment form...
              </div>
            )}
          </div>
        </div>

        {/* Error / Success Message */}
        {message && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              message.includes('succeeded')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            )}
          >
            {message.includes('succeeded') ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message}
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your payment information is encrypted and secure. We use Stripe&apos;s industry-standard security measures to protect your data.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Back to Plans
          </Button>
          {message && message.includes('expired') && onRetry ? (
            <Button
              type="button"
              onClick={onRetry}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Retry Payment
                </>
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!stripe || !elements || !isComplete || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Footer Info */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span>Visa, Mastercard, Amex</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>PCI Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;
