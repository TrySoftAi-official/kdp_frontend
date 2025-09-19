
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, Zap, Users, BarChart3 } from 'lucide-react';
import { SubscriptionPlan } from '@/api/subscriptionService';

interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen = true,
  onClose
}) => {
  const navigate = useNavigate();
  const subscriptionApi = useSubscriptionApi();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Remove the Stripe initialization since we're using direct checkout redirects
  // useEffect(() => {
  //   const initializeStripe = async () => {
  //     try {
  //       const stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
  //       setStripePromise(stripe);
  //     } catch (error) {
  //       console.error('Failed to load Stripe:', error);
  //       toast.error('Failed to initialize payment system');
  //     }
  //   };

  //   initializeStripe();
  // }, []);

  useEffect(() => {
    if (isOpen) {
      loadSubscriptionPlans();
    }
  }, [isOpen]);

  const loadSubscriptionPlans = async () => {
    setLoadingPlans(true);
    try {
      console.log('🔄 Loading subscription plans...');
      const response = await subscriptionApi.getSubscriptionPlans();
      console.log('📋 Subscription plans response:', response);
      if (response) {
        setPlans(response);
        console.log(`✅ Loaded ${response.length} subscription plans`);
        console.log('📋 Plans data:', response.map(plan => ({
          plan_id: plan.plan_id,
          name: plan.name,
          price: plan.price,
          billing_cycle: plan.billing_cycle
        })));
      } else {
        console.warn('⚠️ No subscription plans received');
      }
    } catch (error) {
      console.error('❌ Failed to load subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };


  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    
    try {
      console.log('🔄 Creating subscription for plan:', plan);
      console.log('📋 Plan details:', {
        plan_id: plan.plan_id,
        name: plan.name,
        price: plan.price,
        billing_cycle: plan.billing_cycle
      });
      
      // Use the new createSubscription API
      const result = await subscriptionApi.createSubscription({
        plan_id: plan.plan_id,
        billing_cycle: plan.billing_cycle || 'monthly' // Default to monthly if not set
      });

      console.log('📋 Subscription creation result:', result);

      if (result) {
        if (result.success) {
          if (result.checkout_data && result.checkout_data.url) {
            // For paid plans, redirect directly to Stripe checkout
            console.log('💳 Paid plan selected, redirecting to Stripe checkout:', result.checkout_data.url);
            window.location.href = result.checkout_data.url;
          } else {
            // Free plan - subscription created successfully
            console.log('✅ Free subscription created successfully');
            toast.success(result.message || 'Subscription created successfully!');
            handleSuccess();
          }
        } else {
          console.error('❌ Subscription creation failed:', result.message);
          toast.error(result.message || 'Failed to create subscription');
        }
      } else {
        // Check if there's an error from the API hook
        const errorMessage = subscriptionApi.error || 'Failed to create subscription. Please try again.';
        console.error('❌ No result returned, error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Exception during subscription creation:', error);
      const errorMessage = subscriptionApi.error || 'Failed to create subscription. Please try again.';
      toast.error(errorMessage);
    }
  };


  const handleSuccess = () => {
    // Redirect to success page with plan details
    const planId = selectedPlan?.plan_id || 'unknown';
    const billingCycle = selectedPlan?.billing_cycle || 'monthly';
    const amount = selectedPlan?.price || 0;
    
    console.log('🎉 Payment successful, redirecting to success page:', {
      selectedPlan,
      planId,
      billingCycle,
      amount
    });
    
    // If we don't have plan details, try to get them from the plans array
    if (planId === 'unknown' && selectedPlan) {
      const planFromArray = plans.find(p => p.plan_id === selectedPlan.plan_id);
      if (planFromArray) {
        console.log('📋 Found plan in array:', planFromArray);
        const successUrl = `/checkout/success?plan=${planFromArray.plan_id}&billing=${planFromArray.billing_cycle}&amount=${planFromArray.price}`;
        window.location.href = successUrl;
        return;
      }
    }
    
    const successUrl = `/checkout/success?plan=${planId}&billing=${billingCycle}&amount=${amount}`;
    window.location.href = successUrl;
  };

  const handleClose = () => {
    setSelectedPlan(null);
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
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
        return <Users className="h-6 w-6" />;
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <Crown className="h-6 w-6" />;
    }
  };

  const renderPlansStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your needs</p>
      </div>

      {loadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.plan_id} className="relative">
              {plan.plan_id === 'pro' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {renderPlanIcon(plan.plan_id)}
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">${plan.price}</div>
                  <div className="text-sm text-gray-500">per {plan.billing_cycle}</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {plan.limits?.books_per_month && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.limits.books_per_month} books per month</span>
                    </div>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.features.join(', ')}</span>
                    </div>
                  )}
                  {plan.description && (
                    <div className="text-xs text-gray-500 mt-2">
                      {plan.description}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => {
                    console.log('🎯 Plan selected:', plan);
                    handlePlanSelect(plan);
                  }}
                  className="w-full"
                  variant={plan.plan_id === 'pro' ? 'default' : 'outline'}
                >
                  {plan.plan_id === 'free' ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-5 lg:px-24 py-10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Button variant="ghost" onClick={handleClose}>
              ×
            </Button>
          </div>

          {renderPlansStep()}
        </div>
      </div>
    </div>
  );
};



export default CheckoutModal;
