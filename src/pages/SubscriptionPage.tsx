import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SubscriptionService, 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionStatus,
  SubscriptionBilling 
} from '../api/subscriptionService';
import { PaymentService } from '../api/paymentService';
import { toast } from '../lib/toast';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  plans: SubscriptionPlan[];
  currentPlan?: SubscriptionPlan;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  plans,
  currentPlan
}) => {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  console.log('🔍 PlanSelectionModal rendered:', {
    isOpen,
    plansCount: plans.length,
    currentPlan: currentPlan?.name,
    currentPlanId: currentPlan?.plan_id
  });

  if (!isOpen) {
    console.log('❌ Modal not open, returning null');
    return null;
  }

  const handleSelectPlan = (planId: string) => {
    onSelectPlan(planId, selectedBillingCycle);
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (plan.plan_id === 'free') return 0;
    return selectedBillingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price; // 20% yearly discount
  };

  const getPlanDescription = (planId: string) => {
    const descriptions = {
      free: '1 book per month',
      basic: '5 books per month',
      pro: 'Unlimited books',
      enterprise: 'Advanced / SLA support'
    };
    return descriptions[planId as keyof typeof descriptions] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            {currentPlan && (
              <p className="text-gray-600 mt-1">
                Current plan: <span className="font-semibold text-blue-600">{currentPlan.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedBillingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedBillingCycle === 'yearly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.plan_id === plan.plan_id;
            const price = getPlanPrice(plan);
            const isPopular = plan.popular;

            return (
              <div
                key={plan.plan_id}
                className={`relative border rounded-lg p-6 ${
                  isPopular
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200'
                } ${isCurrentPlan ? 'bg-blue-50' : 'bg-white'}`}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                {!isCurrentPlan && currentPlan && plan.price > currentPlan.price && (
                  <div className="absolute -top-3 right-3">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Upgrade
                    </span>
                  </div>
                )}
                {!isCurrentPlan && currentPlan && plan.price < currentPlan.price && (
                  <div className="absolute -top-3 right-3">
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Downgrade
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {SubscriptionService.getPlanLabel(plan.plan_id)}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 ml-1">
                      / {selectedBillingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">
                    {getPlanDescription(plan.plan_id)}
                  </p>

                  <button
                    onClick={() => handleSelectPlan(plan.plan_id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : currentPlan && plan.price > currentPlan.price 
                        ? 'Upgrade' 
                        : currentPlan && plan.price < currentPlan.price 
                          ? 'Downgrade' 
                          : 'Choose Plan'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        {currentPlan && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Plan Changes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Upgrades:</strong> Take effect immediately with prorated billing</li>
              <li>• <strong>Downgrades:</strong> Take effect at the end of your current billing period</li>
              <li>• You'll be redirected to Stripe Checkout to complete the payment</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [billingHistory, setBillingHistory] = useState<SubscriptionBilling[]>([]);
  const [stripeInvoices, setStripeInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'settings'>('overview');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load plans
      const plansResponse = await SubscriptionService.getSubscriptionPlans();
      setPlans(plansResponse.data.plans);

      // Load subscription status
      const statusResponse = await SubscriptionService.getMySubscriptionStatus();
      setSubscriptionStatus(statusResponse.data);

      // Load subscription details if exists
      if (statusResponse.data.has_subscription) {
        const subscriptionResponse = await SubscriptionService.getMySubscription();
        setSubscription(subscriptionResponse.data.subscription);

        // Load billing history
        try {
          const billingResponse = await SubscriptionService.getBillingHistory();
          setBillingHistory(billingResponse.data);
        } catch (error) {
          console.warn('Could not load billing history:', error);
        }

        // Load Stripe invoices
        try {
          const invoicesResponse = await fetch('/api/subscription/billing/invoices', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`
            }
          });
          if (invoicesResponse.ok) {
            const invoices = await invoicesResponse.json();
            setStripeInvoices(invoices);
          }
        } catch (error) {
          console.warn('Could not load Stripe invoices:', error);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setProcessingPayment(true);
      setShowPlanModal(false);

      // Create subscription
      const response = await SubscriptionService.createSubscription({
        plan_id: planId,
        billing_cycle: billingCycle
      });

      if (response.data.success && response.data.checkout_data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.portal_url, '_blank');
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const handleSyncSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/fetch-and-save-stripe-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Subscription synced successfully');
          loadSubscriptionData();
        } else {
          toast.error(data.message || 'Failed to sync subscription');
        }
      } else {
        toast.error('Failed to sync subscription');
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast.error('Failed to sync subscription');
    }
  };

  const handleCreateSubscriptionFromPayment = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/subscription/create-subscription-from-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.message || 'Subscription created successfully!');
          loadSubscriptionData();
        } else {
          toast.error(data.message || 'Failed to create subscription.');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail?.error || 'Failed to create subscription.');
      }
    } catch (error: any) {
      console.error('Error creating subscription from payment:', error);
      toast.error('Failed to create subscription from payment.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscriptionStatus?.has_subscription && 
    subscriptionStatus.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
                <p className="text-gray-600">Manage your subscription, billing, and payment information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'billing', label: 'Billing History' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {!hasActiveSubscription ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-6">
                      You're currently on the free plan. Upgrade to unlock premium features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Plans
                      </button>
                      <button
                        onClick={handleCreateSubscriptionFromPayment}
                        disabled={isSyncing}
                        className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isSyncing ? 'Creating...' : 'Create from Payment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Subscription */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">
                            {subscriptionStatus.plan?.name || 'Active Subscription'}
                          </h3>
                          <p className="text-green-700">
                            Status: <span className="font-medium">{SubscriptionService.getStatusLabel(subscriptionStatus.status || 'active')}</span>
                          </p>
                          {subscriptionStatus.current_period_end && (
                            <p className="text-green-700 text-sm">
                              Next billing: {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900">
                            ${subscriptionStatus.plan?.price || 0}
                          </div>
                          <div className="text-green-700 text-sm">
                            / {subscription?.billing_cycle || 'month'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Usage Information */}
                    {subscriptionStatus.usage && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Usage This Period</h4>
                        {Object.entries(subscriptionStatus.usage).map(([key, usage]: [string, any]) => (
                          <div key={key} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-600">
                                {usage.current_usage} / {usage.limit === -1 ? '∞' : usage.limit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  usage.limit === -1 ? 'bg-green-500' :
                                  (usage.current_usage / usage.limit) >= 0.9 ? 'bg-red-500' :
                                  (usage.current_usage / usage.limit) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{
                                  width: usage.limit === -1 ? '100%' : `${Math.min((usage.current_usage / usage.limit) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          console.log('🔄 Change Plan button clicked');
                          console.log('📋 Current subscription:', subscriptionStatus);
                          console.log('📋 Plans available:', plans.length);
                          setShowPlanModal(true);
                          console.log('✅ Modal state set to true');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                      >
                        Change Plan
                      </button>
                      <button
                        onClick={handleManageBilling}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      >
                        Manage Billing
                      </button>
                      <button
                        onClick={handleSyncSubscription}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      >
                        Sync with Stripe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
                  <button
                    onClick={handleManageBilling}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Manage Billing
                  </button>
                </div>

                {/* Stripe Invoices */}
                {stripeInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {stripeInvoices.map((invoice) => (
                      <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Invoice #{invoice.number || invoice.id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(invoice.created * 1000).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`font-medium ${
                                invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {invoice.status}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ${invoice.amount_paid / 100}
                            </div>
                            {invoice.invoice_pdf && (
                              <a
                                href={invoice.invoice_pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Download PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No billing history available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">Sync with Stripe</h4>
                        <p className="text-sm text-gray-600">
                          Manually sync your subscription data with Stripe
                        </p>
                      </div>
                      <button
                        onClick={handleSyncSubscription}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                      >
                        Sync Now
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">Billing Portal</h4>
                        <p className="text-sm text-gray-600">
                          Manage payment methods, download invoices, and update billing info
                        </p>
                      </div>
                      <button
                        onClick={handleManageBilling}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      >
                        Open Portal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => {
          console.log('🔄 Closing modal');
          setShowPlanModal(false);
        }}
        onSelectPlan={handleSelectPlan}
        plans={plans}
        currentPlan={subscriptionStatus?.plan}
      />
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>Modal State: {showPlanModal ? 'OPEN' : 'CLOSED'}</div>
          <div>Plans: {plans.length}</div>
          <div>Current Plan: {subscriptionStatus?.plan?.name || 'None'}</div>
        </div>
      )}

      {/* Processing Payment Overlay */}
      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Redirecting to secure checkout...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
