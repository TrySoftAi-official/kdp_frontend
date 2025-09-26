import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, BarChart3, MessageCircle, Loader2 } from 'lucide-react';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { useAuth } from '@/redux/hooks/useAuth';
import { toast } from '@/utils/toast';
import { SubscriptionPlan } from '@/services/subscriptionService';
import { cn } from '@/utils/utils';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requiredFeature?: string;
  currentPlan?: string;
  currentPlanId?: string;
  onNavigateToCheckout?: (selectedPlan: SubscriptionPlan) => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  requiredFeature,
  currentPlan = 'free',
  currentPlanId,
  onNavigateToCheckout
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Load subscription plans
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    console.log('🔄 Loading subscription plans...');
    setIsLoadingPlans(true);
    try {
      const plansData = await subscriptionApi.getSubscriptionPlans(true);
      console.log('📋 Plans data received:', plansData);
      
      if (plansData && Array.isArray(plansData)) {
        console.log('✅ Plans loaded successfully:', plansData.length, 'plans');
        setPlans(plansData);
        // Auto-select the first paid plan if no current plan
        const effectiveCurrentPlan = currentPlanId || currentPlan;
        if (!effectiveCurrentPlan || effectiveCurrentPlan === 'free') {
          const firstPaidPlan = plansData.find(plan => plan.plan_id !== 'free');
          if (firstPaidPlan) {
            setSelectedPlan(firstPaidPlan);
          }
        }
      } else {
        console.log('❌ No plans data or not an array:', plansData);
        setPlans([]);
      }
    } catch (error) {
      console.error('❌ Failed to load subscription plans:', error);
      toast.error('Failed to load subscription plans');
      setPlans([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    // Comprehensive validation
    if (!user) {
      toast.error('You must be logged in to upgrade your subscription');
      return;
    }

    if (!plan) {
      toast.error('Please select a plan');
      return;
    }

    const effectiveCurrentPlan = currentPlanId || currentPlan;
    if (plan.plan_id === effectiveCurrentPlan) {
      toast.error('You are already on this plan');
      return;
    }

    if (!plan.price || plan.price <= 0) {
      toast.error('Invalid plan pricing. Please try again.');
      return;
    }

    if (!user.email) {
      toast.error('Email address is required for payment processing');
      return;
    }

    setIsProcessing(true);

    // If onNavigateToCheckout is provided, use it to navigate to CheckoutModal
    if (onNavigateToCheckout) {
      console.log('Navigating to CheckoutModal with plan:', plan);
      onNavigateToCheckout(plan);
      onClose(); // Close the PlanUpgradeModal
      setIsProcessing(false);
      return;
    }

    // Fallback: If no navigation handler is provided, show helpful message
    toast.info('Please use the PlanUpgradeFlow component for the complete upgrade experience with payment processing.');
    setIsProcessing(false);
  };

  const getDefaultFeatures = (planId: string) => {
    const defaultFeatures = {
      free: [
        '1 book per month',
        'Basic templates',
        'Community support',
        'Standard publishing'
      ],
      basic: [
        '5 books per month',
        'Premium templates',
        'Email support',
        'Advanced publishing tools',
        'Basic analytics'
      ],
      pro: [
        'Unlimited books',
        'All templates',
        'Priority support',
        'Custom branding',
        'Advanced analytics',
        'API access'
      ],
      enterprise: [
        'Everything in Pro',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee'
      ]
    };
    
    return defaultFeatures[planId as keyof typeof defaultFeatures] || [];
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Upgrade Your Plan
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {requiredFeature ? (
                <>
                  To access <span className="font-semibold text-blue-600">{requiredFeature}</span>, 
                  you need to upgrade your subscription
                </>
              ) : (
                'Unlock premium features and take your book publishing to the next level'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Current Plan Status */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Current Plan</h3>
                  <p className="text-sm text-gray-600">
                    You're currently on the <span className="font-medium">{currentPlanId || currentPlan}</span> plan
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {currentPlanId || currentPlan}
                </Badge>
              </div>
            </div>


            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoadingPlans ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading plans...</span>
                </div>
              ) : (
                plans && Array.isArray(plans) && plans.map((plan) => {
                  const effectiveCurrentPlan = currentPlanId || currentPlan;
                  const isCurrentPlan = plan.plan_id === effectiveCurrentPlan;
                  const isPopular = plan.popular || plan.plan_id === 'pro';
                  const isSelected = selectedPlan?.id === plan.id;
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={cn(
                        "relative border-2 transition-all duration-200 hover:shadow-lg cursor-pointer",
                        isCurrentPlan 
                          ? "border-blue-500 bg-blue-50" 
                          : isSelected
                            ? "border-purple-500 bg-purple-50 shadow-lg"
                            : "border-gray-200 hover:border-blue-300",
                        isPopular && "border-purple-500 shadow-lg"
                      )}
                      onClick={() => !isCurrentPlan && setSelectedPlan(plan)}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white px-3 py-1">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <Badge variant="secondary">
                            Current Plan
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {plan.name}
                        </CardTitle>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.price}
                          </span>
                          <span className="text-gray-500">/{plan.billing_cycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {plan.description}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {(() => {
                            const features = plan.features && plan.features.length > 0 ? plan.features : getDefaultFeatures(plan.plan_id);
                            return features && Array.isArray(features) && features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </li>
                            ));
                          })()}
                        </ul>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrentPlan) {
                              handleUpgrade(plan);
                            }
                          }}
                          disabled={isCurrentPlan || isProcessing}
                          className={cn(
                            "w-full",
                            isCurrentPlan 
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                              : isPopular 
                                ? "bg-purple-600 hover:bg-purple-700" 
                                : "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            'Upgrade Now'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Additional Benefits */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Why Upgrade?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Unlimited Creation</h4>
                  <p className="text-sm text-gray-600">
                    Create as many books as you want without restrictions
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Analytics</h4>
                  <p className="text-sm text-gray-600">
                    Get detailed insights into your book performance
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Priority Support</h4>
                  <p className="text-sm text-gray-600">
                    Get help when you need it with dedicated support
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {selectedPlan ? (
                  <span>
                    Selected: <strong>{selectedPlan.name}</strong> - ${selectedPlan.price}/{selectedPlan.billing_cycle === 'monthly' ? 'month' : 'year'}
                  </span>
                ) : (
                  <span>Please select a plan to continue</span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Maybe Later
                </Button>
                {selectedPlan && selectedPlan.plan_id !== (currentPlanId || currentPlan) && (
                  <Button
                    onClick={() => handleUpgrade(selectedPlan)}
                    disabled={isProcessing}
                    className="px-6"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade Now'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
