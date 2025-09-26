import React, { useState } from 'react';
import { PlanUpgradeModal } from '@/components/shared/PlanUpgradeModal';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { SubscriptionPlan } from '@/apis/subscription';

interface PlanUpgradeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requiredFeature?: string;
  currentPlan?: string;
  currentPlanId?: string;
  triggerSource?: string;
}

export const PlanUpgradeFlow: React.FC<PlanUpgradeFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requiredFeature,
  currentPlan = 'free',
  currentPlanId,
  triggerSource = 'plan_upgrade'
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleNavigateToCheckout = (plan: SubscriptionPlan) => {
    console.log('Navigating to checkout with plan:', plan);
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Don't close the entire flow, just the checkout modal
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Call the parent success callback
    if (onSuccess) {
      onSuccess();
    }
    // Close the entire flow
    onClose();
  };

  const handleFlowClose = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    onClose();
  };

  return (
    <>
      {/* Plan Selection Modal */}
      <PlanUpgradeModal
        isOpen={isOpen && !showCheckout}
        onClose={handleFlowClose}
        onSuccess={onSuccess}
        requiredFeature={requiredFeature}
        currentPlan={currentPlan}
        onNavigateToCheckout={handleNavigateToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        onSuccess={handleCheckoutSuccess}
        requiredFeature={requiredFeature}
        triggerSource={triggerSource}
      />
    </>
  );
};

export default PlanUpgradeFlow;
