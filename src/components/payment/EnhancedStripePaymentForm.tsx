import React, { useState, useEffect } from 'react';
import {
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, Loader2, Lock, Check, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/utils';

interface EnhancedStripePaymentFormProps {
  amount: number;
  currency: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  clientSecret: string;
  onRetry?: () => void;
  customerEmail?: string;
  customerName?: string;
}

export const EnhancedStripePaymentForm: React.FC<EnhancedStripePaymentFormProps> = ({
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
  customerEmail,
  customerName,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google_pay' | 'apple_pay'>('card');

  useEffect(() => {
    if (stripe && elements) {
      console.log('Stripe and Elements loaded successfully');
      
      // Initialize Payment Request for Google Pay/Apple Pay
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: currency.toLowerCase(),
        total: {
          label: `${planName} Subscription`,
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
          console.log('Payment Request available:', result);
        }
      });

      // Handle payment request events
      pr.on('paymentmethod', async (ev) => {
        console.log('Payment Request payment method:', ev);
        
        if (!clientSecret) {
          ev.complete('fail');
          onError('Payment session has expired. Please try again.');
          return;
        }

        setIsProcessing(true);
        setMessage('Processing payment...');

        try {
          // Confirm the PaymentIntent with the payment method from Payment Request
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (error) {
            console.error('Payment Request payment failed:', error);
            ev.complete('fail');
            onError(error.message || 'Payment failed');
          } else if (paymentIntent.status === 'requires_action') {
            // Handle 3D Secure authentication
            const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
            if (confirmError) {
              ev.complete('fail');
              onError(confirmError.message || 'Payment authentication failed');
            } else {
              ev.complete('success');
              setMessage('Payment succeeded!');
              toast.success('Payment completed successfully!');
              onSuccess();
            }
          } else {
            ev.complete('success');
            setMessage('Payment succeeded!');
            toast.success('Payment completed successfully!');
            onSuccess();
          }
        } catch (err) {
          console.error('Payment Request error:', err);
          ev.complete('fail');
          onError('An unexpected error occurred');
        } finally {
          setIsProcessing(false);
        }
      });
    }
  }, [stripe, elements, clientSecret, amount, currency, planName, onSuccess, onError]);

  const handleCardSubmit = async (event: React.FormEvent) => {
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

      if (!clientSecret) {
        throw new Error('Payment session has expired. Please try again.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        
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

  const handlePaymentMethodChange = (method: 'card' | 'google_pay' | 'apple_pay') => {
    setPaymentMethod(method);
    setMessage(null);
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
                ${amount.toFixed(2)} {currency.toUpperCase()}
              </div>
              <div className="text-sm text-blue-600">
                per {billingCycle === 'monthly' ? 'month' : 'year'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Choose Payment Method</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Google Pay / Apple Pay */}
          {canMakePayment && paymentRequest && (
            <div className="space-y-2">
              <Button
                type="button"
                variant={paymentMethod === 'google_pay' ? 'default' : 'outline'}
                className="w-full h-12 text-sm font-medium"
                onClick={() => handlePaymentMethodChange('google_pay')}
                disabled={isProcessing}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Pay with Google Pay / Apple Pay
              </Button>
              
              {paymentMethod === 'google_pay' && (
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
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
            </div>
          )}

          {/* Card Payment */}
          <div className="space-y-2">
            <Button
              type="button"
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="w-full h-12 text-sm font-medium"
              onClick={() => handlePaymentMethodChange('card')}
              disabled={isProcessing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay with Card
            </Button>
          </div>
        </div>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleCardSubmit} className="space-y-6">
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
      )}

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

export default EnhancedStripePaymentForm;
