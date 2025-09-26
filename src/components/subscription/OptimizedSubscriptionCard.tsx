import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useOptimizedSubscription } from '@/hooks/useOptimizedSubscription';
import { toast } from '@/utils/toast';

interface OptimizedSubscriptionCardProps {
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  showActions?: boolean;
  className?: string;
}

export const OptimizedSubscriptionCard: React.FC<OptimizedSubscriptionCardProps> = ({
  onUpgrade,
  onManageBilling,
  showActions = true,
  className = ''
}) => {
  const {
    data,
    isLoading,
    error,
    hasActiveSubscription,
    isFreePlan,
    planName,
    statusText,
    isExpiringSoon,
    refreshData,
    getUsagePercentage
  } = useOptimizedSubscription();

  const handleRefresh = async () => {
    try {
      await refreshData(true);
      toast.success('Subscription data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh subscription data');
    }
  };

  if (isLoading && !data) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading subscription data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <XCircle className="h-5 w-5" />
            Subscription Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('mailto:support@forgekdp.com', '_blank')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No subscription data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const booksUsage = getUsagePercentage('books');
  const apiUsage = getUsagePercentage('api_calls');
  const storageUsage = getUsagePercentage('storage');

  const getStatusIcon = () => {
    if (isExpiringSoon) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (hasActiveSubscription) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = () => {
    if (isExpiringSoon) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (hasActiveSubscription) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            My Subscription
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1">{statusText}</span>
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{planName}</h3>
            <span className="text-2xl font-bold">
              ${data.plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                /{data.plan.billing_cycle}
              </span>
            </span>
          </div>
          
          <p className="text-muted-foreground">{data.plan.description}</p>
          
          {isExpiringSoon && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Your subscription expires on {data.current_period_end ? new Date(data.current_period_end).toLocaleDateString() : 'soon'}
              </span>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage This Month</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Books Created</span>
                <span>{data.usage.books_uploaded} / {data.plan.limits.books_per_month}</span>
              </div>
              <Progress value={booksUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Calls</span>
                <span>{data.usage.api_calls} / {data.plan.limits.api_calls_per_month}</span>
              </div>
              <Progress value={apiUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage Used</span>
                <span>{(data.usage.storage_used_mb / 1024).toFixed(2)} / {data.plan.limits.storage_gb} GB</span>
              </div>
              <Progress value={storageUsage} className="h-2" />
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-2">
          <h4 className="font-medium">Plan Features</h4>
          <div className="grid grid-cols-1 gap-1">
            {data.plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Details */}
        {hasActiveSubscription && data.subscription && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm">Subscription Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-1 font-medium">{data.subscription.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Billing:</span>
                <span className="ml-1 font-medium capitalize">{data.subscription.billing_cycle}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Next billing:</span>
                <span className="ml-1 font-medium">
                  {data.current_period_end ? new Date(data.current_period_end).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {data.subscription.trial_end && (
                <div>
                  <span className="text-muted-foreground">Trial ends:</span>
                  <span className="ml-1 font-medium">
                    {new Date(data.subscription.trial_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {isFreePlan ? (
              <Button onClick={onUpgrade} className="flex-1">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onUpgrade} className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                {data.subscription?.stripe_customer_id && (
                  <Button variant="outline" onClick={onManageBilling} className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Billing Portal
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
