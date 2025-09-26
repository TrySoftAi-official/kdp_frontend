import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Star, Zap, Crown, Building2 } from 'lucide-react';
import { cn } from '@/utils/utils';
import { SubscriptionPlan } from '@/services/subscriptionService';
import PaymentFlowModal from '@/components/payment/PaymentFlowModal';

interface EnhancedSubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentPlan?: SubscriptionPlan;
  onPlanSelect?: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
}

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  plans,
  currentPlan,
  onPlanSelect,
  isLoading = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Building2 className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-600 bg-gray-100';
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'pro':
        return 'text-purple-600 bg-purple-100';
      case 'enterprise':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-50 to-gray-100';
      case 'basic':
        return 'from-blue-50 to-blue-100';
      case 'pro':
        return 'from-purple-50 to-purple-100';
      case 'enterprise':
        return 'from-yellow-50 to-yellow-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyYearlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyYearlyTotal - yearlyPrice) / monthlyYearlyTotal) * 100);
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
    if (onPlanSelect && selectedPlan) {
      onPlanSelect(selectedPlan, billingCycle);
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return currentPlan?.plan_id === plan.plan_id;
  };

  const canUpgrade = (plan: SubscriptionPlan) => {
    if (!currentPlan) return true;
    if (plan.plan_id === 'free') return false;
    
    const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan.plan_id);
    const targetIndex = planHierarchy.indexOf(plan.plan_id);
    
    return targetIndex > currentIndex;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === 'monthly' ? "text-gray-900" : "text-gray-500"
        )}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === 'yearly' ? "text-gray-900" : "text-gray-500"
        )}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            Save up to 20%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const canUpgradePlan = canUpgrade(plan);
          const savings = billingCycle === 'yearly' && plan.plan_id !== 'free' 
            ? calculateSavings(plan.price, plan.price * 10) // Assuming 20% yearly discount
            : 0;

          return (
            <Card
              key={plan.plan_id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg",
                plan.popular && "ring-2 ring-purple-500 shadow-lg scale-105",
                isCurrent && "ring-2 ring-green-500 bg-green-50"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className={cn(
                "text-center pb-4 bg-gradient-to-br",
                getPlanGradient(plan.plan_id)
              )}>
                <div className="flex justify-center mb-2">
                  <div className={cn(
                    "p-3 rounded-full",
                    getPlanColor(plan.plan_id)
                  )}>
                    {getPlanIcon(plan.plan_id)}
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.plan_id === 'free' ? '0' : plan.price.toFixed(0)}
                    </span>
                    {plan.plan_id !== 'free' && (
                      <span className="text-lg text-gray-500 ml-1">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save {savings}% with yearly billing
                    </div>
                  )}
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Limits */}
                {plan.limits && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Limits</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {plan.limits.books_per_month === -1 ? (
                        <div>Unlimited books per month</div>
                      ) : (
                        <div>{plan.limits.books_per_month} books per month</div>
                      )}
                      {plan.limits.analytics_access && (
                        <div>✓ Analytics access</div>
                      )}
                      {plan.limits.priority_support && (
                        <div>✓ Priority support</div>
                      )}
                      {plan.limits.custom_branding && (
                        <div>✓ Custom branding</div>
                      )}
                      {plan.limits.api_access && (
                        <div>✓ API access</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.plan_id === 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      Select Free Plan
                    </Button>
                  ) : canUpgradePlan ? (
                    <Button
                      className="w-full"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.plan_id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Downgrade Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentFlowModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EnhancedSubscriptionPlans;
