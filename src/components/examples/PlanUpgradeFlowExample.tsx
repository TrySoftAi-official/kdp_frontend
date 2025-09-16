import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanUpgradeFlow } from '@/components/subscription/PlanUpgradeFlow';
import { Crown, Zap, BarChart3, MessageCircle } from 'lucide-react';

export const PlanUpgradeFlowExample: React.FC = () => {
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  const handleUpgradeSuccess = () => {
    console.log('Upgrade successful!');
    // Here you would typically refresh subscription data
    // and update the UI to reflect the new plan
    setCurrentPlan('basic'); // Example: update to basic plan
  };

  const handleFeatureAccess = (feature: string) => {
    console.log(`Accessing restricted feature: ${feature}`);
    setShowUpgradeFlow(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Plan Upgrade Flow Example
          </CardTitle>
          <CardDescription>
            This example demonstrates the complete flow from PlanUpgradeModal to CheckoutModal
            with Stripe payment integration supporting Card, Google Pay, Apple Pay, and Klarna.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Current Plan Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">You're currently on the <strong>{currentPlan}</strong> plan</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgradeFlow(true)}
              >
                Upgrade Plan
              </Button>
            </div>
          </div>

          {/* Feature Access Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Book Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Create unlimited books with premium templates and advanced features.
                </p>
                <Button
                  onClick={() => handleFeatureAccess('book_creation')}
                  className="w-full"
                >
                  Access Book Creation
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Get detailed insights into your book performance and reader engagement.
                </p>
                <Button
                  onClick={() => handleFeatureAccess('analytics')}
                  className="w-full"
                >
                  Access Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Priority Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Get priority support with faster response times and dedicated assistance.
                </p>
                <Button
                  onClick={() => handleFeatureAccess('priority_support')}
                  className="w-full"
                >
                  Access Priority Support
                </Button>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Custom Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Customize your books with your own branding and white-label options.
                </p>
                <Button
                  onClick={() => handleFeatureAccess('custom_branding')}
                  className="w-full"
                >
                  Access Custom Branding
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Flow Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">How the Flow Works</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click any feature button above to trigger the upgrade flow</li>
              <li>PlanUpgradeModal shows available plans (Basic, Pro, Enterprise)</li>
              <li>Select a plan and click "Upgrade" to navigate to CheckoutModal</li>
              <li>CheckoutModal displays payment methods: Card, Google Pay, Apple Pay, Klarna</li>
              <li>Complete payment through Stripe Checkout</li>
              <li>On success: Navigate to /checkout/success and refresh subscription status</li>
              <li>On failure: Navigate to /checkout/failure with retry options</li>
            </ol>
          </div>

          {/* Direct Upgrade Button */}
          <div className="text-center">
            <Button
              onClick={() => setShowUpgradeFlow(true)}
              size="lg"
              className="px-8"
            >
              <Crown className="mr-2 h-5 w-5" />
              Start Plan Upgrade Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Upgrade Flow Modal */}
      <PlanUpgradeFlow
        isOpen={showUpgradeFlow}
        onClose={() => setShowUpgradeFlow(false)}
        onSuccess={handleUpgradeSuccess}
        currentPlan={currentPlan}
        currentPlanId={currentPlan}
        triggerSource="example"
      />
    </div>
  );
};

export default PlanUpgradeFlowExample;
