import React, { useState, useEffect } from 'react';
import { Crown, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionIntegration } from '@/hooks/useSubscriptionIntegration';
import { toast } from '@/utils/toast';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredFeature?: string;
  requiredPlan?: string;
  fallbackComponent?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
  onUpgradeClick?: () => void;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredFeature,
  requiredPlan,
  fallbackComponent,
  showUpgradePrompt = true,
  upgradeMessage,
  onUpgradeClick
}) => {
  const subscriptionIntegration = useSubscriptionIntegration();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [requiredFeature, requiredPlan]);

  const checkAccess = async () => {
    setIsChecking(true);
    
    try {
      let access = true;

      // Check feature access
      if (requiredFeature) {
        access = access && subscriptionIntegration.hasFeature(requiredFeature);
      }

      // Check plan access
      if (requiredPlan) {
        const currentPlan = subscriptionIntegration.getCurrentPlan();
        access = access && currentPlan?.plan_id === requiredPlan;
      }

      setHasAccess(access);
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      subscriptionIntegration.showUpgradeModal();
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Checking access...</span>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const getUpgradeMessage = () => {
    if (upgradeMessage) return upgradeMessage;
    
    if (requiredFeature) {
      return `This feature requires ${requiredFeature}. Upgrade your plan to access this feature.`;
    }
    
    if (requiredPlan) {
      return `This feature requires the ${requiredPlan} plan. Upgrade your plan to access this feature.`;
    }
    
    return 'This feature requires a premium subscription. Upgrade your plan to access this feature.';
  };

  const getCurrentPlanName = () => {
    const currentPlan = subscriptionIntegration.getCurrentPlan();
    return currentPlan?.name || 'Free Plan';
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Premium Feature</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            {getUpgradeMessage()}
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              Current: {getCurrentPlanName()}
            </Badge>
            {requiredPlan && (
              <Badge variant="outline">
                Required: {requiredPlan}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => subscriptionIntegration.navigateToSubscription()}
            className="w-full"
          >
            View All Plans
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Upgrade to unlock this feature and many more premium capabilities.
        </div>
      </CardContent>
    </Card>
  );
};

// Feature-specific guards
export const AnalyticsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SubscriptionGuard
    requiredFeature="analytics_access"
    upgradeMessage="Analytics and reporting features require a premium subscription."
  >
    {children}
  </SubscriptionGuard>
);

export const APIGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SubscriptionGuard
    requiredFeature="api_access"
    upgradeMessage="API access requires a premium subscription."
  >
    {children}
  </SubscriptionGuard>
);

export const CustomBrandingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SubscriptionGuard
    requiredFeature="custom_branding"
    upgradeMessage="Custom branding features require a premium subscription."
  >
    {children}
  </SubscriptionGuard>
);

export const PrioritySupportGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SubscriptionGuard
    requiredFeature="priority_support"
    upgradeMessage="Priority support requires a premium subscription."
  >
    {children}
  </SubscriptionGuard>
);

// Usage-based guards
interface UsageGuardProps {
  children: React.ReactNode;
  usageType: string;
  maxUsage?: number;
  showUpgradePrompt?: boolean;
}

export const UsageGuard: React.FC<UsageGuardProps> = ({
  children,
  usageType,
  maxUsage,
  showUpgradePrompt = true
}) => {
  const subscriptionIntegration = useSubscriptionIntegration();
  const [canUse, setCanUse] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkUsage();
  }, [usageType]);

  const checkUsage = async () => {
    setIsChecking(true);
    
    try {
      const hasAccess = await subscriptionIntegration.checkUsageLimit(usageType);
      setCanUse(hasAccess);
    } catch (error) {
      console.error('Error checking usage limit:', error);
      setCanUse(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Checking usage...</span>
      </div>
    );
  }

  if (canUse) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardContent className="text-center p-6">
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="font-semibold mb-2">Usage Limit Reached</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You've reached your monthly limit for {usageType}. Upgrade your plan to continue.
        </p>
        <Button onClick={() => subscriptionIntegration.showUpgradeModal()} className="w-full">
          <Crown className="mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
};

export const BookCreationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UsageGuard usageType="books_per_month">
    {children}
  </UsageGuard>
);
