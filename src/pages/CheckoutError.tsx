import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Mail,
  Phone,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { toast } from '@/utils/toast';

export const CheckoutError: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const timestamp = searchParams.get('timestamp');

  useEffect(() => {
    // Show error notification
    const errorMessage = message || 'An unexpected error occurred during checkout';
    toast.error(errorMessage);
  }, [message]);

  const handleRetryCheckout = () => {
    // Navigate back to account page to retry
    navigate('/account');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    // Open support email
    const subject = encodeURIComponent('Checkout Error - ForgeKDP');
    const body = encodeURIComponent(`
Error Details:
- Error: ${error || 'Unknown'}
- Message: ${message || 'No additional details'}
- Timestamp: ${timestamp || new Date().toISOString()}
- User: ${user?.email || 'Not logged in'}
- URL: ${window.location.href}

Please describe what you were trying to do when this error occurred:
`);
    
    window.open(`mailto:support@forgekdp.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Checkout Error</CardTitle>
          <CardDescription className="text-lg">
            Something went wrong during the checkout process
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Details */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {message || 'An unexpected error occurred while processing your request. Please try again or contact support if the problem persists.'}
            </AlertDescription>
          </Alert>

          {/* Error Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">Error Details:</h3>
            <div className="text-sm space-y-1">
              {error && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Code:</span>
                  <span className="font-mono text-xs">{error}</span>
                </div>
              )}
              {timestamp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="text-xs">{new Date(timestamp).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="text-xs">{user?.email || 'Not logged in'}</span>
              </div>
            </div>
          </div>

          {/* Possible Causes */}
          <div className="space-y-3">
            <h3 className="font-semibold">This might be caused by:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Browser compatibility problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Server maintenance or high traffic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Payment processor issues</span>
              </li>
            </ul>
          </div>

          {/* Troubleshooting Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">Try these steps:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Refresh the page and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Clear your browser cache and cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>Try using a different browser or device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <span>Wait a few minutes and try again</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleRetryCheckout} 
              className="w-full" 
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome} 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleContactSupport} 
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Support Information */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Need Immediate Help?
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>support@forgekdp.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
            <p className="text-xs text-blue-700">
              Our support team is available 24/7 to help resolve any issues.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              If this error persists, please contact our support team with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
