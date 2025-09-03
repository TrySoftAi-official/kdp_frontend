import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, BarChart3, MessageCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredFeature?: string;
  currentPlan?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  requiredFeature,
  currentPlan = 'free'
}) => {
  if (!isOpen) return null;

  const handleUpgrade = (planId: string) => {
    // In a real app, this would redirect to payment processing
    console.log(`Upgrading to ${planId} plan`);
    // For demo purposes, we'll just close the modal
    onClose();
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                    You're currently on the <span className="font-medium">{currentPlan}</span> plan
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {currentPlan}
                </Badge>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan;
                const isPopular = plan.popular;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={cn(
                      "relative border-2 transition-all duration-200 hover:shadow-lg",
                      isCurrentPlan 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300",
                      isPopular && "border-purple-500 shadow-lg"
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white px-3 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
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
                        <span className="text-gray-500">/month</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                        className={cn(
                          "w-full",
                          isCurrentPlan 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : isPopular 
                              ? "bg-purple-600 hover:bg-purple-700" 
                              : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
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

            {/* Close Button */}
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-8"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
