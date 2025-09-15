import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { toast } from '@/lib/toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PaymentCallbackHandlerProps {
  onSuccess?: () => void;
  onError?: () => void;
  redirectTo?: string;
}

export const PaymentCallbackHandler: React.FC<PaymentCallbackHandlerProps> = ({
  onSuccess,
  onError,
  redirectTo = '/subscription'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    const subscriptionStatus = searchParams.get('subscription');
    const planId = searchParams.get('plan');
    const paymentId = searchParams.get('payment_id');
    const error = searchParams.get('error');

    try {
      if (subscriptionStatus === 'success') {
        setStatus('success');
        setMessage(`Welcome to ${planId || 'your new plan'}! Your subscription is now active.`);
        
        // Refresh subscription data
        setIsRefreshing(true);
        await subscriptionApi.getMySubscription();
        setIsRefreshing(false);
        
        toast.success('Payment successful! Your subscription has been activated.');
        onSuccess?.();
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('subscription');
        newUrl.searchParams.delete('plan');
        newUrl.searchParams.delete('payment_id');
        window.history.replaceState({}, document.title, newUrl.toString());
        
      } else if (subscriptionStatus === 'cancelled') {
        setStatus('cancelled');
        setMessage('Payment was cancelled. You can try again anytime.');
        toast.info('Payment was cancelled. You can try again anytime.');
        onError?.();
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('subscription');
        newUrl.searchParams.delete('plan');
        window.history.replaceState({}, document.title, newUrl.toString());
        
      } else if (error) {
        setStatus('error');
        setMessage(`Payment failed: ${error}`);
        toast.error(`Payment failed: ${error}`);
        onError?.();
        
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('payment_id');
        window.history.replaceState({}, document.title, newUrl.toString());
        
      } else if (paymentId) {
        // Check payment status
        setIsRefreshing(true);
        try {
          const paymentStatus = await paymentApi.getPaymentStatus(parseInt(paymentId));
          
          if (paymentStatus) {
            if (paymentApi.isPaymentSuccessful(paymentStatus.status)) {
              setStatus('success');
              setMessage('Payment successful! Your subscription has been activated.');
              toast.success('Payment successful! Your subscription has been activated.');
              onSuccess?.();
            } else if (paymentApi.isPaymentFailed(paymentStatus.status)) {
              setStatus('error');
              setMessage(`Payment failed: ${paymentStatus.error_message || 'Unknown error'}`);
              toast.error(`Payment failed: ${paymentStatus.error_message || 'Unknown error'}`);
              onError?.();
            } else {
              setStatus('loading');
              setMessage('Payment is being processed...');
            }
          } else {
            setStatus('error');
            setMessage('Unable to verify payment status. Please check your subscription.');
            toast.error('Unable to verify payment status. Please check your subscription.');
            onError?.();
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          setStatus('error');
          setMessage('Unable to verify payment status. Please check your subscription.');
          toast.error('Unable to verify payment status. Please check your subscription.');
          onError?.();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // No payment callback parameters, redirect to subscription page
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      setStatus('error');
      setMessage('An error occurred while processing your payment. Please contact support.');
      toast.error('An error occurred while processing your payment. Please contact support.');
      onError?.();
    }
  };

  const handleContinue = () => {
    navigate(redirectTo);
  };

  const handleRetry = () => {
    navigate('/subscription');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'error':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      default:
        return 'Processing Payment...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={getStatusColor()}>
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>
          
          {isRefreshing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating subscription status...
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {status === 'success' && (
              <Button onClick={handleContinue} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Subscription
              </Button>
            )}
            
            {(status === 'error' || status === 'cancelled') && (
              <>
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleContinue} className="w-full">
                  View Subscription
                </Button>
              </>
            )}
            
            {status === 'loading' && (
              <Button variant="outline" onClick={handleContinue} className="w-full">
                Continue
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            If you continue to experience issues, please contact our support team.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
