import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Loader2, 
  Lock,
  Shield,
  Check,
  AlertCircle,
  Smartphone,
  Wallet
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

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
  selectedPaymentMethod?: 'card' | 'google_pay' | 'apple_pay' | 'klarna';
  onPaymentMethodChange?: (method: string) => void;
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
  selectedPaymentMethod = 'card',
  onPaymentMethodChange
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  console.log('StripePaymentForm rendered with:', {
    amount,
    currency,
    planName,
    billingCycle,
    stripe: !!stripe,
    elements: !!elements,
    isProcessing
  });
  
  console.log('Amount details:', {
    rawAmount: amount,
    amountType: typeof amount,
    formattedAmount: typeof amount === 'number' ? amount.toFixed(2) : 'Invalid amount',
    dividedBy100: typeof amount === 'number' ? (amount / 100).toFixed(2) : 'Invalid amount'
  });

  // Debug Stripe Elements loading
  useEffect(() => {
    if (stripe && elements) {
      console.log('Stripe and Elements loaded successfully');
    } else {
      console.log('Stripe or Elements not loaded:', { stripe: !!stripe, elements: !!elements });
    }
  }, [stripe, elements]);

  // Add error handling for PaymentElement
  useEffect(() => {
    const handleError = (event: any) => {
      console.error('Stripe Elements error:', event);
    };
    
    if (elements) {
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        console.log('PaymentElement found:', paymentElement);
        paymentElement.on('ready', () => {
          console.log('PaymentElement is ready');
        });
        paymentElement.on('change', (event) => {
          console.log('PaymentElement changed:', event);
        });
        paymentElement.on('focus', () => {
          console.log('PaymentElement focused');
        });
        paymentElement.on('blur', () => {
          console.log('PaymentElement blurred');
        });
      } else {
        console.log('PaymentElement not found in elements');
      }
    }
  }, [elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Get the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Get client secret from elements
      const { client_secret } = await stripe.retrievePaymentIntent(elements.getClientSecret());
      
      // Confirm payment with card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        setMessage(error.message || 'An unexpected error occurred.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        toast.success('Payment completed successfully!');
        onSuccess();
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

  // PaymentElement options - simplified to ensure it renders
  const paymentElementOptions = {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card'],
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        address: 'auto',
      },
    },
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
                ${amount.toFixed(2)}
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
        {/* Card Element - using CardElement for reliable card input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            {stripe && elements ? (
              <div>
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
                    console.log('CardElement onChange:', event);
                    setIsComplete(event.complete);
                    if (event.error) {
                      setMessage(event.error.message || null);
                    } else {
                      setMessage(null);
                    }
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Debug: Stripe={stripe ? 'Loaded' : 'Not loaded'}, Elements={elements ? 'Loaded' : 'Not loaded'}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading payment form...
                <div className="ml-2 text-xs">
                  Stripe: {stripe ? 'Loaded' : 'Loading...'}, Elements: {elements ? 'Loaded' : 'Loading...'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Billing Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Billing Address
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Address Line 1"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Address Line 2"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="City"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="State/Province"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Postal Code"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {message && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            message.includes('succeeded') || message.includes('Payment succeeded')
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          )}>
            {message.includes('succeeded') || message.includes('Payment succeeded') ? (
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
            Your payment information is encrypted and secure. We use Stripe's industry-standard security measures to protect your data.
          </p>
        </div>

        {/* Action Buttons */}
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
        </div>
      </form>

      {/* Payment Methods Info */}
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
