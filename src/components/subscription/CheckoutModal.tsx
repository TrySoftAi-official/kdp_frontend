import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Crown, 
  Check, 
  Loader2, 
  Zap,
  Users,
  BarChart3,
  MessageCircle,
  Palette,
  Code,
  ArrowRight,
  Star,
  Lock,
  Shield,
  BookOpen,
  TrendingUp,
  Globe,
  Headphones,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from '@/lib/toast';
import { SubscriptionPlan, SubscriptionService } from '@/api/subscriptionService';
import { cn } from '@/lib/utils';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPlanId?: string;
  requiredFeature?: string;
  triggerSource?: string;
  // New props for feature access restriction
  restrictedFeature?: string;
  featureDescription?: string;
  // New props for plan upgrade flow
  preselectedPlan?: SubscriptionPlan;
  onPlanSelected?: (plan: SubscriptionPlan) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlanId = 'free',
  requiredFeature,
  triggerSource = 'upgrade',
  restrictedFeature,
  featureDescription,
  preselectedPlan,
  onPlanSelected
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const { getCurrentPlan, getSubscriptionStatus } = useFeatureEnforcement();
  const { 
    clientSecret, 
    isCreatingIntent, 
    createPaymentIntent, 
    clearPaymentIntent, 
    error: stripeError 
  } = useStripePayment();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const currentPlan = getCurrentPlan();
  const subscriptionStatus = getSubscriptionStatus();

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    } else {
      // Clear payment intent when modal closes
      clearPaymentIntent();
      setShowPaymentForm(false);
    }
  }, [isOpen, clearPaymentIntent]);

  // Handle preselected plan
  useEffect(() => {
    if (preselectedPlan && isOpen) {
      setSelectedPlan(preselectedPlan);
      if (onPlanSelected) {
        onPlanSelected(preselectedPlan);
      }
    }
  }, [preselectedPlan, isOpen, onPlanSelected]);

  const loadPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await subscriptionApi.getSubscriptionPlans();
      console.log('Plans response:', response);
      
      if (response && 'data' in response && (response.data as any)?.plans) {
        const availablePlans = (response.data as any).plans.filter((plan: SubscriptionPlan) => 
          plan.plan_id !== 'free' && plan.active
        );
        setPlans(availablePlans);
        
        // Auto-select the first paid plan or recommended plan
        if (availablePlans.length > 0) {
          const recommendedPlan = getRecommendedPlan(availablePlans);
          setSelectedPlan(recommendedPlan);
        }
      } else if (Array.isArray(response)) {
        // Handle direct array response
        const availablePlans = response.filter((plan: SubscriptionPlan) => 
          plan.plan_id !== 'free' && plan.active
        );
        setPlans(availablePlans);
        
        // Auto-select the first paid plan or recommended plan
        if (availablePlans.length > 0) {
          const recommendedPlan = getRecommendedPlan(availablePlans);
          setSelectedPlan(recommendedPlan);
        }
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to load subscription plans - unexpected response format');
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const getRecommendedPlan = (availablePlans: SubscriptionPlan[]): SubscriptionPlan => {
    // If there's a required feature, find the cheapest plan that supports it
    if (requiredFeature) {
      const featurePlanMap: Record<string, string[]> = {
        'analytics': ['basic', 'pro', 'enterprise'],
        'priority_support': ['pro', 'enterprise'],
        'custom_branding': ['pro', 'enterprise'],
        'api_access': ['enterprise']
      };
      
      const requiredPlans = featurePlanMap[requiredFeature] || [];
      const supportingPlans = availablePlans.filter(plan => 
        requiredPlans.includes(plan.plan_id)
      );
      
      if (supportingPlans.length > 0) {
        return supportingPlans[0]; // Return the cheapest supporting plan
      }
    }
    
    // Default to the first available plan
    return availablePlans[0];
  };

  const handleUpgrade = async () => {
    console.log('handleUpgrade called with:', {
      user: user?.id,
      selectedPlan: selectedPlan?.plan_id,
      currentPlanId,
      showPaymentForm,
      selectedPlanPrice: selectedPlan?.price,
      userEmail: user?.email
    });

    // Validation checks
    if (!user) {
      toast.error('You must be logged in to upgrade your subscription');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    if (selectedPlan.plan_id === currentPlanId) {
      toast.error('You are already on this plan');
      return;
    }

    if (!selectedPlan.price || selectedPlan.price <= 0) {
      toast.error('Invalid plan pricing. Please try again.');
      return;
    }

    if (!user.email) {
      toast.error('Email address is required for payment processing');
      return;
    }

    console.log('All validations passed, creating payment intent...');
    console.log('Selected plan details:', {
      plan: selectedPlan,
      price: selectedPlan.price,
      priceType: typeof selectedPlan.price,
      priceAsNumber: Number(selectedPlan.price)
    });
    setIsProcessing(true);
    
    try {
      // Ensure amount is a number
      const amount = typeof selectedPlan.price === 'number' ? selectedPlan.price : Number(selectedPlan.price);
      
      // Create payment intent for Stripe Elements
      const clientSecretValue = await createPaymentIntent({
        amount: amount,
        currency: 'USD',
        planName: selectedPlan.name,
        billingCycle: selectedBillingCycle,
        planId: selectedPlan.plan_id,
        triggerSource,
        requiredFeature
      });

      console.log('Payment intent response:', clientSecretValue);

      if (clientSecretValue) {
        console.log('Payment intent created successfully, showing payment form...');
        setShowPaymentForm(true);
      } else {
        console.error('Failed to create payment intent - no client secret returned');
        toast.error('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleUpgrade:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    toast.success('Payment completed successfully!');
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Close modal
    onClose();
    
    // Clear payment intent
    clearPaymentIntent();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(error);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setShowPaymentForm(false);
    clearPaymentIntent();
  };

  const getFeatureIcon = (feature: string) => {
    const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
      'analytics': BarChart3,
      'priority_support': MessageCircle,
      'custom_branding': Palette,
      'api_access': Code,
      'unlimited_books': Zap,
      'team_collaboration': Users,
      'book_creation': BookOpen,
      'advanced_analytics': TrendingUp,
      'white_label': Globe,
      'dedicated_support': Headphones,
      'basic_templates': BookOpen,
      'premium_templates': Crown,
      'email_support': MessageCircle,
      'community_support': Users,
      'standard_publishing': BookOpen,
      'advanced_publishing': Zap,
      'basic_analytics': BarChart3,
      'advanced_reporting': TrendingUp,
      'custom_integrations': Code,
      'sla_guarantee': Shield
    };
    
    const IconComponent = featureIcons[feature] || Check;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlanColor = (planId: string) => {
    const colors: Record<string, string> = {
      'basic': 'border-blue-200 bg-blue-50',
      'pro': 'border-purple-200 bg-purple-50',
      'enterprise': 'border-yellow-200 bg-yellow-50'
    };
    return colors[planId] || 'border-gray-200 bg-gray-50';
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return plan.plan_id === currentPlanId;
  };

  const isSelectedPlan = (plan: SubscriptionPlan) => {
    return selectedPlan?.plan_id === plan.plan_id;
  };

  const getSavingsPercentage = (plan: SubscriptionPlan) => {
    if (selectedBillingCycle === 'yearly') {
      const yearlyPrice = plan.price * 12;
      const savings = ((yearlyPrice - plan.price) / yearlyPrice) * 100;
      return Math.round(savings);
    }
    return 0;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {showPaymentForm ? (
              <>
                <CreditCard className="h-6 w-6 text-blue-600" />
                Complete Your Payment
              </>
            ) : (
              <>
                <Crown className="h-6 w-6 text-yellow-600" />
                {restrictedFeature ? 'Upgrade Your Plan' : 'Choose Your Plan'}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {showPaymentForm ? (
              `Complete your ${selectedPlan?.name} subscription`
            ) : restrictedFeature ? (
              <>
                <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Feature Restricted</span>
                  </div>
                  <p className="text-amber-700 mt-1">
                    To access <strong>{restrictedFeature}</strong>, you need to upgrade your subscription.
                    {featureDescription && (
                      <span className="block mt-1 text-sm">{featureDescription}</span>
                    )}
                  </p>
                </div>
                <p className="text-gray-600">Choose a plan below to unlock this feature and more:</p>
              </>
            ) : requiredFeature ? (
              `Unlock ${requiredFeature} and more with a premium plan`
            ) : (
              'Select the perfect plan for your publishing needs'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading plans...</span>
          </div>
        ) : showPaymentForm && clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            <StripePaymentForm
              amount={typeof selectedPlan?.price === 'number' ? selectedPlan.price : Number(selectedPlan?.price || 0)}
              currency="USD"
              planName={selectedPlan?.name || ''}
              billingCycle={selectedBillingCycle}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </StripeProvider>
        ) : showPaymentForm && isCreatingIntent ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Initializing payment...</span>
          </div>
        ) : showPaymentForm && stripeError ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Payment Initialization Failed</p>
              <p className="text-sm text-gray-600 mt-1">{stripeError}</p>
            </div>
            <Button onClick={handlePaymentCancel} variant="outline">
              Back to Plans
            </Button>
          </div>
        ) : (
          // Plan Selection
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <Tabs value={selectedBillingCycle} onValueChange={(value: any) => setSelectedBillingCycle(value)}>
                <TabsList className="grid  max-w-md grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly
                    <Badge className="ml-2 bg-green-600 text-white text-xs">Save 20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.plan_id}
                  className={cn(
                    "relative cursor-pointer transition-all hover:shadow-lg",
                    getPlanColor(plan.plan_id),
                    isSelectedPlan(plan) && "ring-2 ring-primary",
                    isCurrentPlan(plan) && "opacity-75"
                  )}
                  onClick={() => !isCurrentPlan(plan) && setSelectedPlan(plan)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {SubscriptionService.formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per {selectedBillingCycle === 'monthly' ? 'month' : 'year'}
                      </div>
                      {selectedBillingCycle === 'yearly' && getSavingsPercentage(plan) > 0 && (
                        <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                          Save {getSavingsPercentage(plan)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      {plan.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {getFeatureIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Limits */}
                    {plan.limits && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span>Books per month:</span>
                          <span className="font-medium">
                            {plan.limits.books_per_month === -1 ? 'Unlimited' : plan.limits.books_per_month}
                          </span>
                        </div>
                        {plan.limits.analytics_access && (
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics Dashboard</span>
                          </div>
                        )}
                        {plan.limits.priority_support && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="h-4 w-4" />
                            <span>Priority Support</span>
                          </div>
                        )}
                        {plan.limits.api_access && (
                          <div className="flex items-center gap-2 text-sm">
                            <Code className="h-4 w-4" />
                            <span>API Access</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="pt-4">
                      {isCurrentPlan(plan) ? (
                        <Button disabled className="">
                          <Check className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant={isSelectedPlan(plan) ? "default" : "outline"}
                          className=""
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                          }}
                        >
                          {isSelectedPlan(plan) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Select Plan'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Plan Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.name} - {subscriptionStatus.status}
                  </p>
                </div>
                <Badge variant="outline">
                  {SubscriptionService.formatCurrency(currentPlan.price)}/month
                </Badge>
              </div>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">Debug Info</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>User: {user?.id} ({user?.email})</p>
                  <p>Selected Plan: {selectedPlan?.name} (${selectedPlan?.price})</p>
                  <p>Billing Cycle: {selectedBillingCycle}</p>
                  <p>Client Secret: {clientSecret ? 'Present' : 'None'}</p>
                  <p>Creating Intent: {isCreatingIntent ? 'Yes' : 'No'}</p>
                  <p>Stripe Error: {stripeError || 'None'}</p>
                </div>
              </div>
            )}

            {/* Upgrade Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleUpgrade}
                disabled={!selectedPlan || isProcessing || isCurrentPlan(selectedPlan)}
                size="lg"
                className="px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Upgrade to {selectedPlan?.name}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Security Notice */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                🔒 Secure payment powered by Stripe. Cancel anytime.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
