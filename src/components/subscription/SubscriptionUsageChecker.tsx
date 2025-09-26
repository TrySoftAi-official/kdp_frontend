import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  TrendingUp,
  BookOpen,
  BarChart3,
  Shield,
  Settings
} from 'lucide-react';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { 
  SubscriptionUsageCheckRequest,
  SubscriptionUsageCheckResponse,
  UserSubscriptionWithPlanResponse 
} from '@/apis/subscription';
import { toast } from '@/utils/toast';

interface SubscriptionUsageCheckerProps {
  onUpgrade?: () => void;
  className?: string;
}

export const SubscriptionUsageChecker: React.FC<SubscriptionUsageCheckerProps> = ({
  onUpgrade,
  className = ''
}) => {
  const subscriptionApi = useSubscriptionApi();
  
  // State
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscriptionWithPlanResponse | null>(null);
  const [usageChecks, setUsageChecks] = useState<Record<string, SubscriptionUsageCheckResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Load subscription data with caching
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const subscriptionData = await subscriptionApi.getMySubscription();
      if (subscriptionData) {
        setCurrentSubscription(subscriptionData);
        // Only check common usage types if user explicitly requests it
        // Removed automatic checking to reduce API calls
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCommonUsageTypes = async () => {
    const commonUsageTypes = ['book_creation', 'file_upload', 'api_calls', 'analytics_access'];
    
    // Check usage types with a small delay between calls to avoid overwhelming the API
    for (let i = 0; i < commonUsageTypes.length; i++) {
      await checkUsage(commonUsageTypes[i], false);
      // Add small delay between API calls
      if (i < commonUsageTypes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const checkUsage = async (usageType: string, increment: boolean = false) => {
    setIsChecking(true);
    try {
      const result = await subscriptionApi.checkUsageLimits({
        usage_type: usageType,
        increment
      });

      if (result) {
        setUsageChecks(prev => ({
          ...prev,
          [usageType]: result
        }));
        
        if (!result.can_use && increment) {
          toast.error(result.message || `Usage limit exceeded for ${usageType}`);
        } else if (result.can_use && increment) {
          toast.success(`Usage recorded for ${usageType}`);
        }
      } else {
        toast.error(subscriptionApi.error || 'Failed to check usage limits');
      }
    } catch (error) {
      toast.error('Failed to check usage limits');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRefresh = async () => {
    await loadSubscriptionData();
    toast.success('Usage data refreshed');
  };

  const getUsageIcon = (usageType: string) => {
    const icons: Record<string, React.ReactNode> = {
      book_creation: <BookOpen className="h-4 w-4" />,
      file_upload: <Settings className="h-4 w-4" />,
      api_calls: <Shield className="h-4 w-4" />,
      analytics_access: <BarChart3 className="h-4 w-4" />,
    };
    return icons[usageType] || <CheckCircle className="h-4 w-4" />;
  };

  const getUsageLabel = (usageType: string) => {
    const labels: Record<string, string> = {
      book_creation: 'Book Creation',
      file_upload: 'File Upload',
      api_calls: 'API Calls',
      analytics_access: 'Analytics Access',
    };
    return labels[usageType] || usageType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading usage information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usage & Limits</h2>
          <p className="text-muted-foreground">
            Monitor your subscription usage and limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkCommonUsageTypes}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Usage
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Subscription Overview */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Current Plan: {subscriptionApi.getPlanLabel(currentSubscription.plan.plan_id)}
            </CardTitle>
            <CardDescription>
              {subscriptionApi.formatCurrency(currentSubscription.plan.price)}/{subscriptionApi.getBillingCycleLabel(currentSubscription.plan.billing_cycle)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentSubscription.subscription.books_created_this_period}
                </div>
                <div className="text-sm text-blue-600">Books Created</div>
                <div className="text-xs text-muted-foreground">This period</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentSubscription.plan.limits?.books_per_month || '∞'}
                </div>
                <div className="text-sm text-green-600">Monthly Limit</div>
                <div className="text-xs text-muted-foreground">Books per month</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {subscriptionApi.getUsagePercentage(
                    currentSubscription.subscription.books_created_this_period,
                    currentSubscription.plan.limits?.books_per_month
                  ).toFixed(0)}%
                </div>
                <div className="text-sm text-purple-600">Usage</div>
                <div className="text-xs text-muted-foreground">Of monthly limit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Checks */}
      {Object.keys(usageChecks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Status
            </CardTitle>
            <CardDescription>
              Check your usage limits for different features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(usageChecks).map(([usageType, usage]) => (
                <div key={usageType} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getUsageIcon(usageType)}
                      <div>
                        <div className="font-medium">{getUsageLabel(usageType)}</div>
                        <div className="text-sm text-muted-foreground">
                          {usage.message || 'Usage status check'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {usage.can_use ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          Limited
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {usage.usage_limit && usage.usage_limit > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Usage: {usage.current_usage} / {usage.usage_limit}</span>
                        <span className={subscriptionApi.getUsageColor(
                          subscriptionApi.getUsagePercentage(usage.current_usage, usage.usage_limit)
                        )}>
                          {usage.remaining_usage !== undefined ? `${usage.remaining_usage} remaining` : ''}
                        </span>
                      </div>
                      <Progress 
                        value={subscriptionApi.getUsagePercentage(usage.current_usage, usage.usage_limit)} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Reset Date */}
                  {usage.reset_date && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Resets on: {subscriptionApi.formatDate(usage.reset_date)}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => checkUsage(usageType, false)}
                      disabled={isChecking}
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Check Status'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => checkUsage(usageType, true)}
                      disabled={isChecking || !usage.can_use}
                    >
                      Record Usage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Usage Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manual Usage Check
          </CardTitle>
          <CardDescription>
            Check usage limits for specific features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['book_creation', 'file_upload', 'api_calls', 'analytics_access'].map((usageType) => (
                <div key={usageType} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getUsageIcon(usageType)}
                    <span className="font-medium">{getUsageLabel(usageType)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => checkUsage(usageType, false)}
                      disabled={isChecking}
                    >
                      Check
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => checkUsage(usageType, true)}
                      disabled={isChecking}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {currentSubscription && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Need more usage?</div>
                  <div className="text-sm text-blue-700">
                    Upgrade your plan to get higher limits and more features
                  </div>
                </div>
              </div>
              <Button 
                onClick={onUpgrade}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {subscriptionApi.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{subscriptionApi.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionUsageChecker;

