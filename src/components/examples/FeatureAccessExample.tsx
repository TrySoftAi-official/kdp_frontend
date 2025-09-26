import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Code, 
  Lock,
  Crown,
  Zap
} from 'lucide-react';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { useAuth } from '@/redux/hooks/useAuth';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPlan: string;
  isPremium: boolean;
}

const features: Feature[] = [
  {
    id: 'book_creation',
    name: 'Book Creation',
    description: 'Create unlimited books with AI assistance',
    icon: BookOpen,
    requiredPlan: 'basic',
    isPremium: true
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights into your book performance',
    icon: BarChart3,
    requiredPlan: 'basic',
    isPremium: true
  },
  {
    id: 'team_collaboration',
    name: 'Team Collaboration',
    description: 'Invite team members and collaborate on projects',
    icon: Users,
    requiredPlan: 'pro',
    isPremium: true
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Integrate with external services via REST API',
    icon: Code,
    requiredPlan: 'enterprise',
    isPremium: true
  }
];

export const FeatureAccessExample: React.FC = () => {
  const { user } = useAuth();
  const { getCurrentPlan, checkFeatureAccess } = useFeatureEnforcement();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const currentPlan = getCurrentPlan();
  const currentPlanId = currentPlan?.plan_id || 'free';

  const handleFeatureClick = (feature: Feature) => {
    // Check if user has access to this feature
    const hasAccess = checkFeatureAccess(feature.id);
    
    if (hasAccess) {
      // User has access, proceed with the feature
      toast.success(`Accessing ${feature.name}...`);
      // Here you would navigate to the feature or open the feature modal
    } else {
      // User doesn't have access, show upgrade modal
      setSelectedFeature(feature);
      setCheckoutModalOpen(true);
    }
  };

  const getPlanBadge = (requiredPlan: string) => {
    const planColors = {
      basic: 'bg-blue-100 text-blue-800 border-blue-200',
      pro: 'bg-purple-100 text-purple-800 border-purple-200',
      enterprise: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const planIcons = {
      basic: Crown,
      pro: Zap,
      enterprise: Crown
    };

    const IconComponent = planIcons[requiredPlan as keyof typeof planIcons] || Crown;

    return (
      <Badge className={`${planColors[requiredPlan as keyof typeof planColors]} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan
      </Badge>
    );
  };

  const getFeatureIcon = (feature: Feature) => {
    const IconComponent = feature.icon;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Feature Access Demo
        </h1>
        <p className="text-gray-600">
          Click on any feature below to see how the subscription upgrade flow works.
          Your current plan: <Badge variant="outline">{currentPlanId}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const hasAccess = checkFeatureAccess(feature.id);
          const IconComponent = feature.icon;

          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                hasAccess 
                  ? 'border-green-200 bg-green-50 hover:border-green-300' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${
                    hasAccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {!hasAccess && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {getPlanBadge(feature.requiredPlan)}
                  
                  {hasAccess ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Access Feature
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeature(feature);
                        setCheckoutModalOpen(true);
                      }}
                    >
                      Upgrade to Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Plan Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{currentPlan?.name || 'Free Plan'}</p>
              <p className="text-sm text-gray-600">
                {currentPlan?.description || 'Basic features with limited access'}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setCheckoutModalOpen(true)}
            >
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => {
          setCheckoutModalOpen(false);
          setSelectedFeature(null);
        }}
        onSuccess={() => {
          setCheckoutModalOpen(false);
          setSelectedFeature(null);
          // Refresh the page or update state to reflect new subscription
          window.location.reload();
        }}
        currentPlanId={currentPlanId}
        restrictedFeature={selectedFeature?.name}
        featureDescription={selectedFeature?.description}
        triggerSource="feature_access"
        requiredFeature={selectedFeature?.id}
      />
    </div>
  );
};

export default FeatureAccessExample;
