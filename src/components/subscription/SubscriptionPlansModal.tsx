import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { SubscriptionPlan } from '@/api/subscriptionService';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPlanId?: string;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  currentPlanId
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
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
        if (!currentPlanId || currentPlanId === 'free') {
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

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan || !user) {
      toast.error('Please select a plan');
      return;
    }

    if (selectedPlan.plan_id === currentPlanId) {
      toast.error('You are already on this plan');
      return;
    }

    setIsProcessing(true);
    try {
      // Create checkout session for the selected plan
      const checkoutData = {
        amount: selectedPlan.price,
        currency: 'USD',
        customer_email: user.email,
        customer_name: user.name || user.email,
        description: `${selectedPlan.name} Subscription`,
        success_url: `${window.location.origin}/account?subscription=success`,
        cancel_url: `${window.location.origin}/account?subscription=cancelled`,
        line_items: [{
          product_name: selectedPlan.name,
          product_description: selectedPlan.description || `${selectedPlan.name} subscription plan`,
          quantity: 1,
          unit_amount: paymentApi.convertToCents(selectedPlan.price),
          tax_amount: 0,
          tax_rate: 0
        }],
        metadata: {
          plan_id: selectedPlan.plan_id,
          billing_cycle: selectedPlan.billing_cycle,
          user_id: user.id
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      if (checkoutSession && checkoutSession.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutSession.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (plan.plan_id === 'free') return 0;
    return plan.price;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    if (plan.features && plan.features.length > 0) {
      return plan.features;
    }
    
    // Fallback features based on plan type
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
    
    return defaultFeatures[plan.plan_id as keyof typeof defaultFeatures] || [];
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return plan.plan_id === currentPlanId;
  };

  const isPopularPlan = (plan: SubscriptionPlan) => {
    return plan.popular || plan.plan_id === 'pro';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-1">
              Select the perfect plan for your publishing needs
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>


        {/* Plans Grid */}
        <div className="p-6">
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading plans...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans && Array.isArray(plans) && plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedPlan?.id === plan.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  } ${isCurrentPlan(plan) ? 'opacity-75' : ''}`}
                  onClick={() => !isCurrentPlan(plan) && handlePlanSelect(plan)}
                >
                  {isPopularPlan(plan) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan(plan) && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${getPlanPrice(plan)}
                      </span>
                      <span className="text-muted-foreground">/{plan.billing_cycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {(() => {
                        const features = getPlanFeatures(plan);
                        return features && Array.isArray(features) && features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ));
                      })()}
                    </ul>

                    {isCurrentPlan(plan) ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanSelect(plan);
                        }}
                        variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
                      >
                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedPlan ? (
                <span>
                  Selected: <strong>{selectedPlan.name}</strong> - ${getPlanPrice(selectedPlan)}/{selectedPlan.billing_cycle === 'monthly' ? 'month' : 'year'}
                </span>
              ) : (
                <span>Please select a plan to continue</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpgrade}
                disabled={!selectedPlan || isProcessing || isCurrentPlan(selectedPlan)}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
