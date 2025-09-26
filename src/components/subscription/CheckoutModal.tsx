
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { toast } from '@/utils/toast';
import { useAuth } from '@/redux/hooks/useAuth';
import CookieManager from '@/utils/cookies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Check, 
  Crown, 
  Zap, 
  Users, 
  BarChart3, 
  X, 
  Star, 
  ArrowRight, 
  Shield, 
  Clock, 
  Sparkles,
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react';
import { SubscriptionPlan } from '@/apis/subscription';
import StripeCheckout from './StripeCheckout';

interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen = true,
  onClose
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    createCheckout,
    fetchPlans,
    plans, 
    currentSubscription, 
    isLoading: loadingPlans, 
    error: subscriptionError 
  } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Load subscription plans when component mounts (only once)
  useEffect(() => {
    if (isOpen && plans.length === 0 && !loadingPlans) {
      // Only load plans if we don't have them and we're not already loading
      const loadPlans = async () => {
        try {
          await fetchPlans();
        } catch (error) {
          console.error('Failed to load subscription plans:', error);
        }
      };
      loadPlans();
    }
  }, [isOpen]); // Only depend on isOpen to prevent infinite loop
  
  // Debug logging
  console.log('CheckoutModal - Hook data:', {
    plans: plans,
    plansLength: plans?.length,
    currentSubscription: currentSubscription,
    isLoading: loadingPlans,
    error: subscriptionError,
    isAuthenticated: isAuthenticated,
    user: user
  });

  // Check if a plan is the current subscription plan
  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentSubscription) return false;
    
    const planId = plan.plan_id || (plan as any).plan;
    
    // Check if user has a paid subscription
    if (currentSubscription.subscription) {
      // For paid subscriptions, compare plan IDs
      const currentPlanId = currentSubscription.subscription.plan_id;
      return currentPlanId === planId;
    } else if (currentSubscription.plan) {
      // For users with plan data, compare plan IDs
      const currentPlanId = currentSubscription.plan.plan_id;
      return currentPlanId === planId;
    } else {
      // For free plan users without explicit plan data
      return planId === 'free';
    }
  };

  // Get plan hierarchy for upgrade/downgrade detection
  const getPlanHierarchy = () => {
    return {
      'free': 0,
      'basic': 1,
      'pro': 2,
      'enterprise': 3
    };
  };

  // Get current plan ID
  const getCurrentPlanId = () => {
    if (!currentSubscription) return 'free';
    
    if (currentSubscription.subscription) {
      return currentSubscription.subscription.plan_id;
    } else if (currentSubscription.plan) {
      return currentSubscription.plan.plan_id;
    } else {
      return 'free';
    }
  };

  // Check if selected plan is an upgrade
  const isUpgrade = (selectedPlan: SubscriptionPlan) => {
    if (!currentSubscription) return true; // If no current subscription, it's an upgrade
    
    const hierarchy = getPlanHierarchy();
    const currentPlanId = getCurrentPlanId();
    const selectedPlanId = selectedPlan.plan_id || (selectedPlan as any).plan;
    
    return hierarchy[selectedPlanId as keyof typeof hierarchy] > hierarchy[currentPlanId as keyof typeof hierarchy];
  };

  // Check if selected plan is a downgrade
  const isDowngrade = (selectedPlan: SubscriptionPlan) => {
    if (!currentSubscription) return false;
    
    const hierarchy = getPlanHierarchy();
    const currentPlanId = getCurrentPlanId();
    const selectedPlanId = selectedPlan.plan_id || (selectedPlan as any).plan;
    
    return hierarchy[selectedPlanId as keyof typeof hierarchy] < hierarchy[currentPlanId as keyof typeof hierarchy];
  };

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    // Prevent selecting current plan
    if (isCurrentPlan(plan)) {
      toast.info('This is your current plan. You can only change plans after your current subscription expires.');
      return;
    }

    // Debug authentication state
    console.log('🔍 [CheckoutModal] Current auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      tokenAvailable: !!CookieManager.getAccessToken(),
      tokenPreview: CookieManager.getAccessToken()?.substring(0, 50) + '...'
    });

    // Check authentication before proceeding
    if (!isAuthenticated) {
      console.error('❌ User needs to log in');
      console.log('🔐 Auth status:', { isAuthenticated, user });
      toast.error('Please log in to continue with your subscription.');
      navigate('/login');
      return;
    }

    const planId = plan.plan_id || (plan as any).plan;
    const amount = (plan as any).price_monthly || plan.price || 0;

    // Handle free plan
    if (planId === 'free' || amount === 0) {
      setSelectedPlan(plan);
      setIsProcessing(true);
      
      try {
        console.log('🔄 Creating free subscription for plan:', plan);
        
        const checkoutData = {
          plan: planId?.toLowerCase(),
          billing_cycle: plan.billing_cycle || 'monthly',
          success_url: `${window.location.origin}/checkout/success?plan=${planId}&amount=0&billing=monthly&source=subscription`,
          cancel_url: `${window.location.origin}/subscription?canceled=true&plan=${planId}`
        };

        const result = await createCheckout(checkoutData);
        
        if (result && result.payload) {
          console.log('✅ Free subscription created successfully');
          toast.success('Free plan activated successfully!');
          onClose?.();
          navigate('/checkout/success', {
            state: {
              plan,
              amount: 0,
              billing: 'monthly',
              source: 'subscription'
            }
          });
        }
      } catch (error) {
        console.error('❌ Failed to create free subscription:', error);
        toast.error('Failed to activate free plan. Please try again.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle paid plans - create payment intent and show Stripe checkout
    setSelectedPlan(plan);
    setIsProcessing(true);
    
    try {
      console.log('🔄 Creating payment intent for plan:', plan);
      
      const checkoutData = {
        plan: planId?.toLowerCase(),
        billing_cycle: plan.billing_cycle || 'monthly',
        success_url: `${window.location.origin}/checkout/success?plan=${planId}&amount=${amount}&billing=monthly&source=subscription`,
        cancel_url: `${window.location.origin}/checkout/failure?plan=${planId}&source=subscription`
      };

      console.log('📋 Checkout data:', checkoutData);
      const result = await createCheckout(checkoutData);

      console.log('📋 API result:', result);

      if (result && result.payload && typeof result.payload === 'object' && result.payload !== null && 'url' in result.payload) {
        // Redirect to Stripe hosted checkout page
        console.log('💳 Redirecting to Stripe hosted checkout:', result.payload);
        toast.info('Redirecting to payment page...');
        window.location.href = (result.payload as any).url;
      } else {
        throw new Error('No valid checkout URL received from server');
      }
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      toast.error(`Failed to initialize payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };



  const handleClose = () => {
    setSelectedPlan(null);
    setShowStripeCheckout(false);
    setClientSecret('');
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleStripeCheckoutClose = () => {
    setShowStripeCheckout(false);
    setClientSecret('');
  };

  if (!isOpen) {
    console.log('🚫 CheckoutModal is closed');
    return null;
  }

  console.log('✅ CheckoutModal is open, plans count:', plans.length);
  console.log('📋 Selected plan:', selectedPlan);
  console.log('📋 Plans array:', plans);

  const renderPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="h-8 w-8" />;
      case 'basic':
        return <Zap className="h-8 w-8" />;
      case 'pro':
        return <Crown className="h-8 w-8" />;
      case 'enterprise':
        return <BarChart3 className="h-8 w-8" />;
      default:
        return <Crown className="h-8 w-8" />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-slate-500 to-slate-600';
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'pro':
        return 'from-purple-500 to-pink-500';
      case 'enterprise':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const planId = plan.plan_id || (plan as any).plan;
    const baseFeatures = [];
    
    if (plan.limits?.books_per_month) {
      baseFeatures.push(`${plan.limits.books_per_month} books per month`);
    }
    
    if (plan.features) {
      if (Array.isArray(plan.features)) {
        baseFeatures.push(...plan.features);
      } else if (typeof plan.features === 'string') {
        baseFeatures.push(plan.features);
      }
    }

    // Add plan-specific features
    switch (planId) {
      case 'free':
        return [
          ...baseFeatures,
          'Basic support',
          'Standard templates',
          'Community access'
        ];
      case 'basic':
        return [
          ...baseFeatures,
          'Priority support',
          'Advanced templates',
          'Export options',
          'Basic analytics'
        ];
      case 'pro':
        return [
          ...baseFeatures,
          '24/7 premium support',
          'Premium templates',
          'Advanced analytics',
          'Custom branding',
          'API access',
          'Team collaboration'
        ];
      case 'enterprise':
        return [
          ...baseFeatures,
          'Dedicated support',
          'Custom integrations',
          'Advanced security',
          'SLA guarantee',
          'Custom training',
          'White-label options'
        ];
      default:
        return baseFeatures;
    }
  };

  const renderPlansStep = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Choose Your Perfect Plan</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Unlock Your Potential
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs and start creating amazing content today
        </p>
      </div>

      {/* Loading State */}
      {loadingPlans ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Loading Plans</h3>
              <p className="text-gray-600">Preparing your subscription options...</p>
            </div>
          </div>
        </div>
      ) : (plans || []).length === 0 ? (
        <div className="text-center py-16">
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plans Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're setting up amazing subscription plans for you. Please check back in a few moments.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {(plans || []).map((plan, index) => {
            const isCurrent = isCurrentPlan(plan);
            const isPro = (plan.plan_id || (plan as any).plan) === 'pro';
            const isUpgradePlan = isUpgrade(plan);
            const isDowngradePlan = isDowngrade(plan);
            const planId = plan.plan_id || (plan as any).plan;
            const features = getPlanFeatures(plan);
            const gradient = getPlanGradient(planId);
            
            return (
              <div
                key={plan.id || plan.plan_id || (plan as any).plan}
                className={`group relative transition-all duration-300 hover:scale-105 ${
                  isCurrent ? 'scale-105 animate-pulse' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 shadow-xl border-2 border-green-600 font-semibold animate-pulse">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Badge>
                  </div>
                )}
                {!isCurrent && isUpgradePlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-500 text-white px-4 py-1 shadow-lg">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Upgrade
                    </Badge>
                  </div>
                )}
                {!isCurrent && isDowngradePlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-orange-500 text-white px-4 py-1 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Downgrade
                    </Badge>
                  </div>
                )}
                {!isCurrent && !isUpgradePlan && !isDowngradePlan && isPro && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Card */}
                <Card 
                  className={`relative h-full transition-all duration-300 ${
                    isCurrent 
                      ? 'ring-4 ring-green-500 border-4 border-green-500 shadow-2xl shadow-green-200 bg-gradient-to-br from-green-50 to-green-100/50 transform scale-105' 
                      : isUpgradePlan 
                        ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 hover:scale-105' 
                        : isDowngradePlan 
                          ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-100 hover:shadow-xl hover:shadow-orange-200 hover:scale-105'
                          : 'shadow-lg hover:shadow-xl hover:shadow-gray-200 hover:scale-105'
                  } ${isPro && !isCurrent ? 'border-2 border-purple-200' : ''}`}
                >
                  {/* Gradient Header */}
                  <div className={`h-3 bg-gradient-to-r ${
                    isCurrent 
                      ? 'from-green-500 to-green-600' 
                      : gradient
                  } rounded-t-lg`}></div>
                  
                  <CardHeader className="text-center pb-4">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${
                        isCurrent 
                          ? 'from-green-500 to-green-600' 
                          : gradient
                      } text-white shadow-lg`}>
                        {renderPlanIcon(planId)}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    
                    {/* Description */}
                    <CardDescription className="text-gray-600 text-base">
                      {plan.description}
                    </CardDescription>
                    
                    {/* Current Plan Info */}
                    {isCurrent && currentSubscription?.subscription && (
                      <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            Expires: {new Date(currentSubscription.subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${(plan as any).price_monthly || plan.price || 0}
                        </span>
                        <span className="text-gray-500 text-lg">
                          /{plan.billing_cycle || 'month'}
                        </span>
                      </div>
                      {planId === 'free' && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Forever free
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {features.slice(0, 6).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {features.length > 6 && (
                        <div className="text-xs text-gray-500 text-center pt-2">
                          +{features.length - 6} more features
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          if (isCurrent) {
                            console.log('🎯 Current plan clicked - no action needed');
                            return;
                          }
                          console.log('🎯 Plan selected:', plan);
                          handlePlanSelect(plan);
                        }}
                        className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                          isCurrent 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : isPro 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                              : isUpgradePlan
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                : isDowngradePlan
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                                  : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                        }`}
                        disabled={isCurrent || isProcessing}
                      >
                        {isProcessing && selectedPlan?.id === plan.id ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrent ? (
                          <>
                            <Check className="h-5 w-5 mr-2" />
                            Active Plan
                          </>
                        ) : (() => {
                          const planId = plan.plan_id || (plan as any).plan;
                          if (planId === 'free') return (
                            <>
                              Get Started
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          );
                          
                          if (isUpgradePlan) return (
                            <>
                              Upgrade Now
                              <TrendingUp className="h-5 w-5 ml-2" />
                            </>
                          );
                          if (isDowngradePlan) return (
                            <>
                              Downgrade
                              <Clock className="h-5 w-5 ml-2" />
                            </>
                          );
                          return (
                            <>
                              Choose Plan
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          );
                        })()}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust Indicators */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-600" />
            <span>Global support</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-600" />
            <span>Privacy protected</span>
          </div>
        </div>
        
        {/* Plan Change Notice */}
        {currentSubscription && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <Clock className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Plan Change Policy</p>
                <p>You can only change your subscription plan after your current billing period expires. Changes take effect immediately for upgrades, and at the end of the current period for downgrades.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // Show Stripe checkout if a plan is selected and client secret is available
  if (showStripeCheckout && selectedPlan && clientSecret) {
    return (
      <StripeCheckout
        plan={selectedPlan}
        clientSecret={clientSecret}
        onSuccess={(paymentIntent) => {
          console.log('Payment successful:', paymentIntent);
          handleClose();
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
          handleStripeCheckoutClose();
        }}
        onClose={handleStripeCheckoutClose}
      />
    );
  }


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
              <p className="text-sm text-gray-500">Choose the perfect plan for your needs</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-12 py-8 overflow-y-auto max-h-[calc(95vh-80px)]">
          {renderPlansStep()}
        </div>
      </div>
    </div>
  );
};



export default CheckoutModal;
