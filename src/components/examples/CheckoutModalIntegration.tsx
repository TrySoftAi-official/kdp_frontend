import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';

// Example 1: Analytics Page Integration
export const AnalyticsWithCheckout: React.FC = () => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureEnforcement();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleAnalyticsAccess = () => {
    if (!hasFeatureAccess('analytics')) {
      setShowCheckoutModal(true);
      return;
    }
    // User has access, proceed with analytics
  };

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      {!hasFeatureAccess('analytics') ? (
        <div className="text-center p-8">
          <h2>Analytics Not Available</h2>
          <p>Upgrade your plan to access analytics</p>
          <Button onClick={() => setShowCheckoutModal(true)}>
            Upgrade to Access Analytics
          </Button>
        </div>
      ) : (
        <div>
          {/* Analytics content */}
          <p>Analytics dashboard content here...</p>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => {
          setShowCheckoutModal(false);
          // Refresh page or update state
        }}
        currentPlanId={user?.subscription?.plan || 'free'}
        requiredFeature="analytics"
        triggerSource="analytics_page"
      />
    </div>
  );
};

// Example 2: Feature Gate Integration
export const FeatureGateWithCheckout: React.FC<{ feature: string; children: React.ReactNode }> = ({ 
  feature, 
  children 
}) => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureEnforcement();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
      <h3>Feature Locked</h3>
      <p>This feature requires a higher plan</p>
      <Button onClick={() => setShowCheckoutModal(true)}>
        Upgrade to Unlock
      </Button>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => setShowCheckoutModal(false)}
        currentPlanId={user?.subscription?.plan || 'free'}
        requiredFeature={feature}
        triggerSource="feature_gate"
      />
    </div>
  );
};

// Example 3: Subscription Page Integration
export const SubscriptionPageWithCheckout: React.FC = () => {
  const { user } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  return (
    <div>
      <h1>My Subscription</h1>
      
      <div className="space-y-4">
        <div>
          <h2>Current Plan: {user?.subscription?.plan || 'Free'}</h2>
          <Button onClick={() => setShowCheckoutModal(true)}>
            Upgrade Plan
          </Button>
        </div>

        {/* Other subscription content */}
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => {
          setShowCheckoutModal(false);
          // Refresh subscription data
        }}
        currentPlanId={user?.subscription?.plan || 'free'}
        triggerSource="subscription_page"
      />
    </div>
  );
};

// Example 4: Dashboard Integration
export const DashboardWithCheckout: React.FC = () => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureEnforcement();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleUpgradeClick = () => {
    setShowCheckoutModal(true);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free features */}
        <div className="p-4 border rounded">
          <h3>Books</h3>
          <p>Manage your books</p>
        </div>

        {/* Premium features */}
        <div className="p-4 border rounded">
          <h3>Analytics</h3>
          {hasFeatureAccess('analytics') ? (
            <p>View analytics</p>
          ) : (
            <Button onClick={handleUpgradeClick} size="sm">
              Upgrade to Access
            </Button>
          )}
        </div>

        <div className="p-4 border rounded">
          <h3>Priority Support</h3>
          {hasFeatureAccess('priority_support') ? (
            <p>Get priority support</p>
          ) : (
            <Button onClick={handleUpgradeClick} size="sm">
              Upgrade to Access
            </Button>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={() => setShowCheckoutModal(false)}
        currentPlanId={user?.subscription?.plan || 'free'}
        triggerSource="dashboard"
      />
    </div>
  );
};
