import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { useAuth } from '@/redux/hooks/useAuth';

// Example: How to use the updated CheckoutModal with embedded payment form
export const CheckoutModalUsage: React.FC = () => {
  const { user } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">CheckoutModal Usage Example</h1>
      
      <div className="space-y-4">
        <p>Click the button below to open the CheckoutModal with embedded payment form:</p>
        
        <Button onClick={() => setShowCheckoutModal(true)} size="lg">
          Open Checkout Modal
        </Button>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What happens when you click:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Modal opens with plan selection</li>
            <li>User selects a plan and clicks "Upgrade"</li>
            <li>Payment form appears with multiple payment methods</li>
            <li>User fills in payment details (card, Google Pay, Apple Pay, Klarna)</li>
            <li>User clicks "Complete Payment"</li>
            <li>Payment is processed and subscription is activated</li>
          </ol>
        </div>
      </div>

      {/* CheckoutModal with embedded payment form */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => {
          setShowCheckoutModal(false);
          // Handle successful subscription
          console.log('Subscription activated successfully!');
        }}
        currentPlanId={user?.subscription?.plan || 'free'}
        triggerSource="example_page"
      />
    </div>
  );
};

// Example: Feature-gated component
export const FeatureGatedComponent: React.FC = () => {
  const { user } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Simulate feature check
  const hasAnalyticsAccess = user?.subscription?.plan !== 'free';

  if (hasAnalyticsAccess) {
    return (
      <div className="p-4 border rounded-lg bg-green-50">
        <h3 className="font-semibold text-green-800">Analytics Dashboard</h3>
        <p className="text-green-600">You have access to analytics!</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <h3 className="font-semibold mb-2">Analytics Locked</h3>
      <p className="text-gray-600 mb-4">Upgrade your plan to access analytics</p>
      <Button onClick={() => setShowCheckoutModal(true)}>
        Upgrade to Access Analytics
      </Button>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => setShowCheckoutModal(false)}
        currentPlanId={user?.subscription?.plan || 'free'}
        requiredFeature="analytics"
        triggerSource="feature_gate"
      />
    </div>
  );
};
