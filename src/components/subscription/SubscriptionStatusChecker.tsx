import React, { useState, useEffect } from 'react';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';

interface SubscriptionStatusCheckerProps {
  onStatusChange?: (status: any) => void;
  refreshInterval?: number; // in milliseconds
  showRefreshButton?: boolean;
  className?: string;
}

export const SubscriptionStatusChecker: React.FC<SubscriptionStatusCheckerProps> = ({
  onStatusChange,
  refreshInterval = 30000, // 30 seconds
  showRefreshButton = true,
  className = ""
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await subscriptionApi.getMySubscriptionStatus();
      if (status) {
        setSubscriptionStatus(status);
        setLastChecked(new Date());
        onStatusChange?.(status);
      } else {
        setError('Failed to fetch subscription status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription status';
      setError(errorMessage);
      console.error('Subscription status check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();

    // Set up automatic refresh
    if (refreshInterval > 0) {
      const interval = setInterval(checkSubscriptionStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [user, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'past_due':
      case 'incomplete':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'past_due':
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleRefresh = async () => {
    await checkSubscriptionStatus();
    toast.success('Subscription status refreshed');
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Please log in to view subscription status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Status</CardTitle>
          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading && !subscriptionStatus ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Checking subscription status...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : subscriptionStatus ? (
          <div className="space-y-3">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {getStatusIcon(subscriptionStatus.status)}
              <Badge className={getStatusColor(subscriptionStatus.status)}>
                {subscriptionStatus.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>

            {/* Plan Information */}
            {subscriptionStatus.plan && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Plan:</span>
                  <span className="text-sm">{subscriptionStatus.plan.name}</span>
                </div>
                
                {subscriptionStatus.current_period_end && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next billing:</span>
                    <span className="text-sm">{formatDate(subscriptionStatus.current_period_end)}</span>
                  </div>
                )}

                {subscriptionStatus.trial_end && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Trial ends:</span>
                    <span className="text-sm">{formatDate(subscriptionStatus.trial_end)}</span>
                  </div>
                )}

                {subscriptionStatus.canceled_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cancelled:</span>
                    <span className="text-sm">{formatDate(subscriptionStatus.canceled_at)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Usage Information */}
            {subscriptionStatus.usage && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium">Usage This Period</h4>
                {Object.entries(subscriptionStatus.usage).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No subscription found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusChecker;
