import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Crown, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  BarChart3,
  MessageCircle,
  Palette,
  Code,
  BookOpen
} from 'lucide-react';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { cn } from '@/utils/utils';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
  usageType?: string;
  incrementOnAccess?: boolean;
}

interface UsageGateProps {
  usageType: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
  incrementOnAccess?: boolean;
}

// Feature icons mapping
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  analytics: BarChart3,
  priority_support: MessageCircle,
  custom_branding: Palette,
  api_access: Code,
  books_created: BookOpen,
  default: Lock
};

// Feature descriptions
const featureDescriptions: Record<string, string> = {
  analytics: 'Access to detailed analytics and reporting features',
  priority_support: 'Priority customer support with faster response times',
  custom_branding: 'Custom branding and white-label options',
  api_access: 'Access to our API for integrations and automation',
  books_created: 'Create and publish books',
  default: 'This feature requires a higher subscription plan'
};

// Plan requirements for features
const featurePlanRequirements: Record<string, string[]> = {
  analytics: ['basic', 'pro', 'enterprise'],
  priority_support: ['pro', 'enterprise'],
  custom_branding: ['pro', 'enterprise'],
  api_access: ['enterprise'],
  books_created: ['free', 'basic', 'pro', 'enterprise'] // All plans can create books, but with different limits
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  className,
  usageType,
  incrementOnAccess = false
}) => {
  const { hasFeatureAccess, enforceFeatureAccess, getCurrentPlan, isLoading } = useFeatureEnforcement();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Checking access...</span>
      </div>
    );
  }

  const hasAccess = hasFeatureAccess(feature);
  const currentPlan = getCurrentPlan();
  const requiredPlans = featurePlanRequirements[feature] || [];
  const FeatureIcon = featureIcons[feature] || featureIcons.default;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleUpgrade = () => {
    if (showUpgradePrompt) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <Card className={cn("border-dashed border-2 border-gray-200", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FeatureIcon className="h-8 w-8 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')} Not Available
          </h3>
          
          <p className="text-gray-600 mb-4 max-w-md">
            {featureDescriptions[feature] || featureDescriptions.default}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              Current: {currentPlan.name}
            </Badge>
            <span className="text-gray-400">→</span>
            <Badge className="text-xs">
              Required: {requiredPlans.map(plan => plan.charAt(0).toUpperCase() + plan.slice(1)).join(' or ')}
            </Badge>
          </div>
          
          {showUpgradePrompt && (
            <Button onClick={handleUpgrade} className="mt-2">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Access
            </Button>
          )}
        </CardContent>
      </Card>

      <CheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature={feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')}
        triggerSource="feature_gate"
      />
    </>
  );
};

export const UsageGate: React.FC<UsageGateProps> = ({
  usageType,
  children,
  fallback,
  showUpgradePrompt = true,
  className,
  incrementOnAccess = false
}) => {
  const { enforceUsageLimit, getUsageInfo, getCurrentPlan, isLoading } = useFeatureEnforcement();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;
      
      const canUse = await enforceUsageLimit(usageType, {
        showUpgradeModal: false,
        customMessage: undefined
      });
      setHasAccess(canUse);
    };

    checkAccess();
  }, [usageType, enforceUsageLimit, isLoading]);

  if (isLoading || hasAccess === null) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Checking usage...</span>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const usageInfo = getUsageInfo(usageType);
  const currentPlan = getCurrentPlan();
  const FeatureIcon = featureIcons[usageType] || featureIcons.default;

  const handleUpgrade = () => {
    if (showUpgradePrompt) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <Card className={cn("border-dashed border-2 border-orange-200", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Usage Limit Reached
          </h3>
          
          <p className="text-gray-600 mb-4 max-w-md">
            You've used {usageInfo.current} of {usageInfo.isUnlimited ? 'unlimited' : usageInfo.limit} {usageType.replace('_', ' ')} this period.
          </p>
          
          {!usageInfo.isUnlimited && (
            <div className="w-full max-w-xs mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Usage</span>
                <span>{usageInfo.current} / {usageInfo.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    usageInfo.percentage >= 90 ? "bg-red-500" :
                    usageInfo.percentage >= 75 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(usageInfo.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              Current: {currentPlan.name}
            </Badge>
          </div>
          
          {showUpgradePrompt && (
            <Button onClick={handleUpgrade} className="mt-2">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade for More
            </Button>
          )}
        </CardContent>
      </Card>

      <CheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredFeature={`More ${usageType.replace('_', ' ')}`}
        triggerSource="usage_gate"
      />
    </>
  );
};

// Higher-order component for feature gating
export const withFeatureGate = <P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  options: Omit<FeatureGateProps, 'feature' | 'children'> = {}
) => {
  return (props: P) => (
    <FeatureGate feature={feature} {...options}>
      <Component {...props} />
    </FeatureGate>
  );
};

// Higher-order component for usage gating
export const withUsageGate = <P extends object>(
  Component: React.ComponentType<P>,
  usageType: string,
  options: Omit<UsageGateProps, 'usageType' | 'children'> = {}
) => {
  return (props: P) => (
    <UsageGate usageType={usageType} {...options}>
      <Component {...props} />
    </UsageGate>
  );
};

// Utility component for conditional feature access
export const ConditionalFeature: React.FC<{
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ feature, children, fallback }) => {
  const { hasFeatureAccess, isLoading } = useFeatureEnforcement();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />;
  }

  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Utility component for conditional usage access
export const ConditionalUsage: React.FC<{
  usageType: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ usageType, children, fallback }) => {
  const { checkUsageLimit, isLoading } = useFeatureEnforcement();
  const [canUse, setCanUse] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;
      
      const usageLimit = await checkUsageLimit(usageType, false);
      setCanUse(usageLimit.canUse);
    };

    checkAccess();
  }, [usageType, checkUsageLimit, isLoading]);

  if (isLoading || canUse === null) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />;
  }

  if (canUse) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
