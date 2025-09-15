import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { SubscriptionPlan, UserSubscription } from '@/api/subscriptionService';
import { toast } from '@/lib/toast';

interface EnhancedSubscriptionManagerProps {
  onClose?: () => void;
}

interface SubscriptionStatus {
  has_subscription: boolean;
  plan_type: string;
  status?: string;
  current_period_end?: string;
  restrictions: string[];
  can_generate_books: boolean;
  can_upload_books: boolean;
  can_view_analytics: boolean;
  can_manage_organization: boolean;
  can_manage_sub_users: boolean;
}

interface OrganizationInfo {
  id: number;
  name: string;
  slug: string;
  description?: string;
  owner_id: number;
}

interface SubUser {
  id: number;
  email: string;
  username: string;
  role: string;
  is_owner: boolean;
  created_at: string;
}

export const EnhancedSubscriptionManager: React.FC<EnhancedSubscriptionManagerProps> = ({
  onClose
}) => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo | null>(null);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'organization' | 'billing'>('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Load subscription status
      const statusResponse = await subscriptionApi.getSubscriptionStatus();
      setSubscriptionStatus(statusResponse);
      
      // Load available plans
      const plansResponse = await subscriptionApi.getAvailablePlans();
      setAvailablePlans(plansResponse);
      
      // Load current subscription if exists
      if (statusResponse.has_subscription) {
        const subscriptionResponse = await subscriptionApi.getMySubscription();
        setCurrentSubscription(subscriptionResponse);
      }
      
      // Load organization info if user has organization
      if (statusResponse.can_manage_organization) {
        try {
          const orgResponse = await subscriptionApi.getMyOrganization();
          setOrganizationInfo(orgResponse);
          
          // Load sub-users if user can manage them
          if (statusResponse.can_manage_sub_users) {
            const usersResponse = await subscriptionApi.getOrganizationUsers();
            setSubUsers(usersResponse);
          }
        } catch (error) {
          console.log('No organization found or user not authorized');
        }
      }
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      setIsLoading(true);
      
      const checkoutData = {
        amount: plan.price,
        currency: 'USD',
        customer_email: user?.email,
        customer_name: user?.name || user?.username,
        description: `${plan.name} Subscription`,
        success_url: `${window.location.origin}/account?subscription=success`,
        cancel_url: `${window.location.origin}/account?subscription=cancelled`,
        line_items: [{
          product_name: plan.name,
          product_description: plan.description || `${plan.name} subscription plan`,
          quantity: 1,
          unit_amount: paymentApi.convertToCents(plan.price),
          tax_amount: 0,
          tax_rate: 0
        }],
        metadata: {
          plan_id: plan.plan_id,
          user_id: user?.id
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      if (checkoutSession && checkoutSession.url) {
        window.location.href = checkoutSession.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await subscriptionApi.cancelSubscription({
          reason: 'User requested cancellation'
        });
        toast.success('Subscription cancelled successfully');
        loadSubscriptionData();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Failed to cancel subscription');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInviteSubUser = async (email: string, username: string, role: string) => {
    try {
      setIsLoading(true);
      const response = await subscriptionApi.inviteSubUser({
        email,
        username,
        role
      });
      toast.success(response.message);
      setShowInviteModal(false);
      loadSubscriptionData();
    } catch (error) {
      console.error('Error inviting sub-user:', error);
      toast.error('Failed to invite sub-user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSubUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to remove this user from your organization?')) {
      try {
        setIsLoading(true);
        await subscriptionApi.removeSubUser(userId);
        toast.success('User removed successfully');
        loadSubscriptionData();
      } catch (error) {
        console.error('Error removing sub-user:', error);
        toast.error('Failed to remove user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanFeatures = (planType: string) => {
    const features = {
      free: ['View books', 'Basic support'],
      basic: ['View books', 'Basic support'],
      pro: ['Generate books', 'Upload books', 'View analytics', 'API access', 'Priority support'],
      premium: ['All Pro features', 'Create organization', 'Manage sub-users', 'Custom branding', 'Unlimited usage']
    };
    return features[planType as keyof typeof features] || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage your subscription, organization, and team members</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'plans', label: 'Plans & Billing' },
            { id: 'organization', label: 'Organization' },
            { id: 'billing', label: 'Billing History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Subscription Plan</h3>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscriptionStatus?.status)}`}>
                    {subscriptionStatus?.plan_type.toUpperCase() || 'FREE'}
                  </span>
                  {subscriptionStatus?.status && (
                    <span className="text-sm text-gray-600">
                      {subscriptionStatus.status}
                    </span>
                  )}
                </div>
                {subscriptionStatus?.current_period_end && (
                  <p className="text-sm text-gray-600 mt-2">
                    Next billing: {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Available Features</h3>
                <div className="space-y-1">
                  {[
                    { key: 'can_generate_books', label: 'Generate Books' },
                    { key: 'can_upload_books', label: 'Upload Books' },
                    { key: 'can_view_analytics', label: 'View Analytics' },
                    { key: 'can_manage_organization', label: 'Manage Organization' },
                    { key: 'can_manage_sub_users', label: 'Manage Sub-Users' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        subscriptionStatus?.[feature.key as keyof SubscriptionStatus] ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-gray-600">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Restrictions */}
          {subscriptionStatus?.restrictions && subscriptionStatus.restrictions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Current Restrictions</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {subscriptionStatus.restrictions.map((restriction, index) => (
                  <li key={index}>• {restriction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {!subscriptionStatus?.has_subscription && (
                <button
                  onClick={() => setActiveTab('plans')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose a Plan
                </button>
              )}
              {subscriptionStatus?.can_manage_organization && !organizationInfo && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Organization
                </button>
              )}
              {subscriptionStatus?.can_manage_sub_users && organizationInfo && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Invite Team Member
                </button>
              )}
              {currentSubscription && (
                <button
                  onClick={handleCancelSubscription}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan) => (
              <div
                key={plan.plan_id}
                className={`bg-white rounded-lg shadow p-6 ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                } ${subscriptionStatus?.plan_type === plan.plan_id ? 'bg-blue-50' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/{plan.billing_cycle}</span>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {getPlanFeatures(plan.plan_id).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={subscriptionStatus?.plan_type === plan.plan_id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    subscriptionStatus?.plan_type === plan.plan_id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {subscriptionStatus?.plan_type === plan.plan_id ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          {organizationInfo ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Name</h3>
                    <p className="text-gray-600">{organizationInfo.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Slug</h3>
                    <p className="text-gray-600">{organizationInfo.slug}</p>
                  </div>
                  {organizationInfo.description && (
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{organizationInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {subscriptionStatus?.can_manage_sub_users && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Team Members</h2>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Invite Member
                    </button>
                  </div>
                  <div className="space-y-4">
                    {subUsers.map((subUser) => (
                      <div key={subUser.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {subUser.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{subUser.username}</h3>
                            <p className="text-sm text-gray-600">{subUser.email}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              subUser.role === 'assistant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {subUser.role}
                            </span>
                          </div>
                        </div>
                        {!subUser.is_owner && (
                          <button
                            onClick={() => handleRemoveSubUser(subUser.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">No Organization</h2>
              <p className="text-gray-600 mb-6">
                Create an organization to manage team members and collaborate on projects.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Organization
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteSubUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteSubUser}
        />
      )}
    </div>
  );
};

// Invite Sub-User Modal Component
interface InviteSubUserModalProps {
  onClose: () => void;
  onInvite: (email: string, username: string, role: string) => void;
}

const InviteSubUserModal: React.FC<InviteSubUserModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('assistant');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && username) {
      onInvite(email, username, role);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="assistant">Assistant</option>
              <option value="marketer">Marketer</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
