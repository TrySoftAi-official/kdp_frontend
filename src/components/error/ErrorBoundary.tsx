import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Copy,
  Mail
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show error toast
    toast.error('An unexpected error occurred. Please try again.');
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast.success('Error details copied to clipboard');
  };

  handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}

Please describe what you were doing when this error occurred:
`);

    window.open(`mailto:support@forgekdp.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Something went wrong</CardTitle>
              <CardDescription className="text-lg">
                An unexpected error occurred. We're sorry for the inconvenience.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error?.message}
                    </div>
                    <div>
                      <strong>Time:</strong> {new Date().toLocaleString()}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Stack Trace (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Stack Trace (Development)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Component Stack (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Component Stack (Development)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={this.handleReload} className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={this.handleGoHome}>
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button variant="outline" onClick={this.handleCopyError}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Error Details
                  </Button>
                </div>
                
                <Button variant="outline" onClick={this.handleContactSupport} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Troubleshooting Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Try refreshing the page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Try using a different browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Check your internet connection</span>
                  </li>
                </ul>
              </div>

              {/* Support Information */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  If this error persists, please contact our support team with the Error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error boundary context
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You can add additional error reporting logic here
    // e.g., send to error tracking service
    
    toast.error('An error occurred. Please try again.');
  };

  return { handleError };
};
