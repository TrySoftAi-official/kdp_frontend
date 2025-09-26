import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  DollarSign,
  UserCheck,
  Building2,
  FileText
} from 'lucide-react';
import { AdminService } from '@/services/adminService';

interface Plan {
  id: number;
  plan_id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features: string[];
  limits: Record<string, any>;
  popular: boolean;
  active: boolean;
  sort_order: number;
  subscriber_count: number;
  created_at: string;
  updated_at?: string;
}

interface Invoice {
  id: number;
  invoice_id?: string;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  plan_name?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  paid_at?: string;
  subscription_id?: number;
  subscription_status?: string;
}

interface Analytics {
  users: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };
  subscriptions: {
    total: number;
    active: number;
    by_plan: Record<string, number>;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  organizations: {
    total: number;
  };
}

interface FrozenSubUser {
  id: number;
  email: string;
  username: string;
  role: string;
  parent_user_id: number;
  parent_user_email?: string;
  parent_user_plan?: string;
  organization_id?: number;
  created_at: string;
}

const OwnerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'analytics' | 'sub-users'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [frozenSubUsers, setFrozenSubUsers] = useState<FrozenSubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plan management states (for future use)
  // const [showCreatePlan, setShowCreatePlan] = useState(false);
  // const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Invoice management states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'plans':
          await loadPlans();
          break;
        case 'invoices':
          await loadInvoices();
          break;
        case 'analytics':
          await loadAnalytics();
          break;
        case 'sub-users':
          await loadFrozenSubUsers();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await AdminService.getPlans();
      setPlans(response.data);
    } catch (err) {
      // Fallback to mock data if API fails
      const mockPlans: Plan[] = [
      {
        id: 1,
        plan_id: 'free',
        name: 'Free',
        description: 'Basic features for getting started',
        price: 0,
        billing_cycle: 'monthly',
        features: ['Basic book creation', 'Limited storage'],
        limits: { books_per_month: 1, storage_gb: 0.1 },
        popular: false,
        active: true,
        sort_order: 1,
        subscriber_count: 150,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        plan_id: 'basic',
        name: 'Basic',
        description: 'Essential features for content creators',
        price: 9.99,
        billing_cycle: 'monthly',
        features: ['Enhanced book creation', 'Basic analytics'],
        limits: { books_per_month: 5, storage_gb: 1 },
        popular: false,
        active: true,
        sort_order: 2,
        subscriber_count: 75,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        plan_id: 'pro',
        name: 'Pro',
        description: 'Advanced features for professionals',
        price: 29.99,
        billing_cycle: 'monthly',
        features: ['Unlimited books', 'Advanced analytics', 'API access'],
        limits: { books_per_month: -1, storage_gb: 10 },
        popular: true,
        active: true,
        sort_order: 3,
        subscriber_count: 45,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        plan_id: 'enterprise',
        name: 'Enterprise',
        description: 'Full features for organizations',
        price: 99.99,
        billing_cycle: 'monthly',
        features: ['Everything in Pro', 'Organization management', 'Sub-users', 'Custom branding'],
        limits: { books_per_month: -1, storage_gb: 100 },
        popular: false,
        active: true,
        sort_order: 4,
        subscriber_count: 12,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
    setPlans(mockPlans);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await AdminService.getInvoices();
      setInvoices(response.data);
    } catch (err) {
      // Fallback to mock data if API fails
      const mockInvoices: Invoice[] = [
      {
        id: 1,
        invoice_id: 'inv_1234567890',
        customer_email: 'john@example.com',
        customer_name: 'John Doe',
        plan_name: 'Pro',
        amount: 29.99,
        currency: 'USD',
        status: 'succeeded',
        payment_method: 'card',
        description: 'Pro Subscription - Monthly',
        created_at: '2024-01-15T10:30:00Z',
        paid_at: '2024-01-15T10:30:00Z',
        subscription_id: 1,
        subscription_status: 'active'
      },
      {
        id: 2,
        invoice_id: 'inv_1234567891',
        customer_email: 'jane@example.com',
        customer_name: 'Jane Smith',
        plan_name: 'Enterprise',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        payment_method: 'card',
        description: 'Enterprise Subscription - Monthly',
        created_at: '2024-01-14T14:20:00Z',
        paid_at: '2024-01-14T14:20:00Z',
        subscription_id: 2,
        subscription_status: 'active'
      }
    ];
    setInvoices(mockInvoices);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await AdminService.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      // Fallback to mock data if API fails
      const mockAnalytics: Analytics = {
      users: {
        total: 282,
        active: 245,
        by_role: {
          guest: 150,
          admin: 2,
          owner: 1,
          marketer: 8,
          assistant: 12
        }
      },
      subscriptions: {
        total: 132,
        active: 128,
        by_plan: {
          free: 150,
          basic: 75,
          pro: 45,
          enterprise: 12
        }
      },
      revenue: {
        total: 15420.50,
        monthly: 2840.75
      },
      organizations: {
        total: 12
      }
    };
    setAnalytics(mockAnalytics);
    }
  };

  const loadFrozenSubUsers = async () => {
    try {
      const response = await AdminService.getFrozenSubUsers();
      setFrozenSubUsers(response.data);
    } catch (err) {
      // Fallback to mock data if API fails
      const mockFrozenUsers: FrozenSubUser[] = [
      {
        id: 1,
        email: 'marketer1@company.com',
        username: 'marketer1',
        role: 'marketer',
        parent_user_id: 10,
        parent_user_email: 'admin@company.com',
        parent_user_plan: 'pro',
        organization_id: 1,
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: 2,
        email: 'assistant1@company.com',
        username: 'assistant1',
        role: 'assistant',
        parent_user_id: 11,
        parent_user_email: 'manager@company.com',
        parent_user_plan: 'basic',
        organization_id: 2,
        created_at: '2024-01-12T11:30:00Z'
      }
    ];
    setFrozenSubUsers(mockFrozenUsers);
    }
  };

  const handleCreatePlan = () => {
    // TODO: Implement create plan functionality
    console.log('Create plan functionality to be implemented');
  };

  const handleEditPlan = (plan: Plan) => {
    // TODO: Implement edit plan functionality
    console.log('Edit plan functionality to be implemented for plan:', plan.id);
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Implement plan deletion API call
      console.log('Deleting plan:', planId);
      await loadPlans();
    } catch (err) {
      setError('Failed to delete plan');
    }
  };

  const handleRefundInvoice = async (invoiceId: number, amount?: number) => {
    try {
      // TODO: Implement refund API call
      console.log('Refunding invoice:', invoiceId, amount);
      setShowRefundModal(false);
      setSelectedInvoice(null);
      await loadInvoices();
    } catch (err) {
      setError('Failed to process refund');
    }
  };

  const handleUnfreezeSubUser = async (userId: number) => {
    try {
      // TODO: Implement unfreeze API call
      console.log('Unfreezing sub-user:', userId);
      await loadFrozenSubUsers();
    } catch (err) {
      setError('Failed to unfreeze sub-user');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Portal</h1>
          <p className="mt-2 text-gray-600">Manage your subscription system and monitor performance</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'plans', label: 'Plan Management', icon: Settings },
              { id: 'invoices', label: 'Invoice Management', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'sub-users', label: 'Sub-Users', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
              <button
                onClick={handleCreatePlan}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      {plan.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-sm text-gray-500">per {plan.billing_cycle}</div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Features:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Subscribers:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.subscriber_count}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
              <button
                onClick={loadInvoices}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_id || `#${invoice.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                          <div className="text-sm text-gray-500">{invoice.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {invoice.status === 'succeeded' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowRefundModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Analytics</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.users.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.users.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.revenue.monthly)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Organizations</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.organizations.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.users.by_role).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriptions by Plan</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.subscriptions.by_plan).map(([plan, count]) => (
                    <div key={plan} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">{plan}</span>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sub-users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Frozen Sub-Users</h2>
              <button
                onClick={loadFrozenSubUsers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub-User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {frozenSubUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.parent_user_email}</div>
                          <div className="text-sm text-gray-500">ID: {user.parent_user_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.parent_user_plan === 'enterprise' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.parent_user_plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUnfreezeSubUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Unfreeze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedInvoice && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Process Refund</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Refund for invoice {selectedInvoice.invoice_id || `#${selectedInvoice.id}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedInvoice(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRefundInvoice(selectedInvoice.id)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPortal;
