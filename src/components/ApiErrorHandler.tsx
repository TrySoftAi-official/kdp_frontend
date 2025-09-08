import React from 'react';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, WifiOff, Clock, Shield } from 'lucide-react';

interface ApiErrorHandlerProps {
  error: Error | null;
  isLoading?: boolean;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  isLoading = false,
  onRetry,
  title,
  description,
  showRetry = true,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!error) return null;

  // Determine error type and appropriate icon/message
  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        type: 'network'
      };
    }
    
    if (message.includes('timeout')) {
      return {
        icon: <Clock className="h-4 w-4" />,
        title: 'Request Timeout',
        description: 'The request took too long to complete. Please try again.',
        type: 'timeout'
      };
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        icon: <Shield className="h-4 w-4" />,
        title: 'Authentication Required',
        description: 'Please log in to access this content.',
        type: 'auth'
      };
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        icon: <Shield className="h-4 w-4" />,
        title: 'Access Denied',
        description: 'You do not have permission to access this resource.',
        type: 'permission'
      };
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        type: 'notfound'
      };
    }
    
    if (message.includes('server') || message.includes('500')) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        type: 'server'
      };
    }
    
    // Default error
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: title || 'An Error Occurred',
      description: description || error.message || 'Something went wrong. Please try again.',
      type: 'generic'
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {errorInfo.icon}
          <div className="flex-1">
            <h4 className="font-medium text-red-800">{errorInfo.title}</h4>
            <p className="text-sm text-red-700 mt-1">{errorInfo.description}</p>
            
            {showRetry && onRetry && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="bg-transparent border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
            
            {(
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-red-600">Technical Details</summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
                  {error.stack || error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Specialized error handlers for different scenarios
export const NetworkErrorHandler: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ApiErrorHandler
    error={new Error('Network connection failed')}
    onRetry={onRetry}
    title="No Internet Connection"
    description="Please check your internet connection and try again."
  />
);

export const AuthErrorHandler: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ApiErrorHandler
    error={new Error('Authentication required')}
    onRetry={onRetry}
    title="Please Log In"
    description="You need to be logged in to access this content."
  />
);

export const ServerErrorHandler: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ApiErrorHandler
    error={new Error('Server error')}
    onRetry={onRetry}
    title="Server Unavailable"
    description="Our servers are temporarily unavailable. Please try again in a few minutes."
  />
);
