import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, ArrowLeft, RefreshCw, Home, MessageCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { SubscriptionPlan } from '@/apis/subscription';

export const CheckoutFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get data from navigation state
  const errorData = location.state as {
    error?: string;
    plan?: SubscriptionPlan;
    paymentIntent?: string;
  };
  
  const planId = searchParams.get('plan') || errorData?.plan?.plan_id;
  const source = searchParams.get('source');

  const handleRetry = () => {
    // Navigate back to the appropriate page based on source
    switch (source) {
      case 'plan_upgrade':
        navigate('/dashboard');
        break;
      case 'subscription_manager':
        navigate('/subscription');
        break;
      default:
        navigate('/subscription');
    }
  };

  const handleContactSupport = () => {
    navigate('/support');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-800 mb-2">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-xl text-gray-600">
            We couldn't process your payment at this time
          </CardDescription>
          <p className="text-gray-500 mt-2">
            Don't worry, no charges were made to your account.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Information */}
          {errorData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Error Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-600">Error:</span>
                  <span className="font-semibold text-red-800">{errorData.error}</span>
                </div>
                {errorData.paymentIntent && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Payment ID:</span>
                    <span className="font-mono text-red-800">{errorData.paymentIntent}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-red-600">Date:</span>
                  <span className="text-red-800">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Plan Information */}
          {(errorData?.plan || planId) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Attempted Purchase</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-600">Plan:</span>
                  <span className="font-semibold text-orange-800 capitalize">
                    {errorData?.plan?.name || planId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Amount:</span>
                  <span className="font-semibold text-orange-800">
                    ${Number(errorData?.plan?.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Status:</span>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </div>
            </div>
          )}

          {/* User Information */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Account Details</h3>
              <p className="text-sm text-blue-600">
                <strong>Email:</strong> {user.email}
              </p>
              {user.name && (
                <p className="text-sm text-blue-600">
                  <strong>Name:</strong> {user.name}
                </p>
              )}
            </div>
          )}

          {/* Common Issues */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Common Issues</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card information</li>
              <li>• Card expired or blocked</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Having trouble? Our support team is here to help.{' '}
              <button
                onClick={handleContactSupport}
                className="text-blue-600 hover:underline"
              >
                Get in touch
              </button>
            </p>
          </div>

          {/* Alternative Payment Methods */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Alternative Options</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
              <li>• Use a different card or account</li>
              <li>• Check your internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutFailure;
