import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface SubscriptionErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onContactSupport?: () => void;
  title?: string;
  showRetry?: boolean;
  showSupport?: boolean;
  className?: string;
}

export const SubscriptionErrorHandler: React.FC<SubscriptionErrorHandlerProps> = ({
  error,
  onRetry,
  onContactSupport,
  title = "Something went wrong",
  showRetry = true,
  showSupport = true,
  className = ""
}) => {
  if (!error) return null;

  const getErrorType = (errorMessage: string) => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('connection')) {
      return 'network';
    } else if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'permission';
    } else if (message.includes('payment') || message.includes('stripe')) {
      return 'payment';
    } else if (message.includes('subscription') || message.includes('plan')) {
      return 'subscription';
    } else if (message.includes('timeout')) {
      return 'timeout';
    }
    
    return 'general';
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return <ExternalLink className="h-4 w-4" />;
      case 'permission':
        return <AlertTriangle className="h-4 w-4" />;
      case 'payment':
        return <AlertTriangle className="h-4 w-4" />;
      case 'subscription':
        return <AlertTriangle className="h-4 w-4" />;
      case 'timeout':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorMessage = (errorType: string, originalError: string) => {
    switch (errorType) {
      case 'network':
        return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      case 'permission':
        return "You don't have permission to perform this action. Please contact support if you believe this is an error.";
      case 'payment':
        return "There was an issue processing your payment. Please check your payment information and try again.";
      case 'subscription':
        return "There was an issue with your subscription. Please try again or contact support for assistance.";
      case 'timeout':
        return "The request is taking longer than expected. Please try again.";
      default:
        return originalError;
    }
  };

  const getSuggestedActions = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return ['Check your internet connection', 'Try refreshing the page', 'Contact support if the issue persists'];
      case 'permission':
        return ['Verify your account permissions', 'Contact support for assistance', 'Check if your subscription is active'];
      case 'payment':
        return ['Verify your payment method', 'Check your billing information', 'Contact support for payment issues'];
      case 'subscription':
        return ['Refresh your subscription status', 'Check your plan details', 'Contact support for subscription help'];
      case 'timeout':
        return ['Try again in a few moments', 'Check your internet connection', 'Contact support if the issue persists'];
      default:
        return ['Try again', 'Contact support for assistance'];
    }
  };

  const errorType = getErrorType(error);
  const errorIcon = getErrorIcon(errorType);
  const errorMessage = getErrorMessage(errorType, error);
  const suggestedActions = getSuggestedActions(errorType);

  return (
    <Alert variant="destructive" className={className}>
      {errorIcon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{errorMessage}</p>
        
        {suggestedActions.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Suggested actions:</p>
            <ul className="text-sm space-y-1 ml-4">
              {suggestedActions.map((action, index) => (
                <li key={index} className="list-disc">{action}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
          
          {showSupport && onContactSupport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onContactSupport}
              className="h-8"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionErrorHandler;
