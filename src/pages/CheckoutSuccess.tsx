import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Home, RefreshCw, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { toast } from '@/lib/toast';
import { SubscriptionPlan } from '@/api/subscriptionService';

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  
  // Get data from navigation state
  const paymentData = location.state as {
    paymentIntent?: any;
    plan?: SubscriptionPlan;
    amount?: number;
  };
  
  const planId = searchParams.get('plan') || paymentData?.plan?.plan_id;
  const source = searchParams.get('source');

  useEffect(() => {
    // Refresh subscription status after successful payment
    refreshSubscriptionStatus();
  }, []);

  const refreshSubscriptionStatus = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      // Get current subscription data
      const subscription = await subscriptionApi.getMySubscription();
      if (subscription) {
        setCurrentSubscription(subscription);
      }
      toast.success('Subscription status updated successfully!');
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
      toast.error('Failed to refresh subscription status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContinue = () => {
    // Navigate based on source or default to dashboard
    switch (source) {
      case 'plan_upgrade':
        navigate('/dashboard');
        break;
      case 'subscription_manager':
        navigate('/subscription');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Information */}
          {paymentData?.paymentIntent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Payment Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Payment ID:</span>
                  <span className="font-mono text-green-800">{paymentData.paymentIntent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Amount:</span>
                  <span className="font-semibold text-green-800">
                    ${Number(paymentData.amount || paymentData.plan?.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Status:</span>
                  <Badge className="bg-green-600 text-white">Paid</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Date:</span>
                  <span className="text-green-800">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Plan Information */}
          {(paymentData?.plan || planId) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Subscription Plan</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Plan:</span>
                  <span className="font-semibold text-blue-800 capitalize">
                    {paymentData?.plan?.name || planId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Billing:</span>
                  <span className="text-blue-800 capitalize">
                    {paymentData?.plan?.billing_cycle || 'monthly'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Status:</span>
                  <Badge className="bg-blue-600 text-white">Active</Badge>
                </div>
                {paymentData?.plan?.description && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-blue-600 text-xs">
                      {paymentData.plan.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Subscription Details */}
          {currentSubscription && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Current Subscription</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-600">Plan:</span>
                  <span className="font-semibold text-purple-800">
                    {currentSubscription.plan?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Status:</span>
                  <Badge className="bg-purple-600 text-white">
                    {currentSubscription.status || 'Active'}
                  </Badge>
                </div>
                {currentSubscription.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-purple-600">Next Billing:</span>
                    <span className="text-purple-800">
                      {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Information */}
          {user && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Account Details</h3>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              {user.name && (
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {user.name}
                </p>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your subscription is now active</li>
              <li>• You can access all premium features</li>
              <li>• Check your email for confirmation</li>
              <li>• Manage your subscription anytime</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleContinue}
              className="w-full"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={refreshSubscriptionStatus}
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
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
              Need help? Contact our{' '}
              <button
                onClick={() => navigate('/support')}
                className="text-blue-600 hover:underline"
              >
                support team
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;