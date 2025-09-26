/**
 * AdminPortalV2 Component
 * 
 * A comprehensive React component for admin portal functionality,
 * including plan management, subscriber management, and analytics.
 * Updated to use the new v2 API services.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Import the new v2 API services
import { SubscriptionServiceV2 } from '@/services/subscriptionServiceV2';
import { PaymentServiceV2 } from '@/services/paymentServiceV2';

// Types
interface SubscriptionPlanV2 {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  limits: Record<string, any>;
  permissions: Record<string, boolean>;
  popular: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

interface SubscriberV2 {
  user_id: number;
  email: string;
  username: string;
  plan_name: string;
  plan_type: string;
  status: string;
  current_period_end: string;
  total_paid: number;
  created_at: string;
}

interface InvoiceV2 {
  id: number;
  invoice_number: string;
  user_id: number;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

interface AnalyticsV2 {
  total_users: number;
  active_subscriptions: number;
  plan_distribution: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  churn_rate: number;
  average_revenue_per_user: number;
  monthly_recurring_revenue: number;
}

// Main Component
const AdminPortalV2: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlanV2[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberV2[]>([]);
  const [invoices, setInvoices] = useState<InvoiceV2[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialog states
  const [createPlanDialog, setCreatePlanDialog] = useState(false);
  const [editPlanDialog, setEditPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanV2 | null>(null);
  
  // Form states
  const [planForm, setPlanForm] = useState({
    plan_id: '',
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    features: '',
    limits: {
      books_per_month: 0,
      api_calls_per_month: 0,
      storage_gb: 0
    },
    permissions: {
      books_view: true,
      books_create: false,
      books_upload: false,
      analytics_view: false,
      organization_create: false,
      users_manage: false,
      api_access: false,
      priority_support: false,
      custom_branding: false
    },
    popular: false,
    active: true,
    sort_order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscribersResponse, invoicesResponse, analyticsResponse] = await Promise.all([
        SubscriptionServiceV2.getSubscriptionPlans(false), // Get all plans including inactive
        // Note: These endpoints would need to be implemented in the admin routes
        // For now, we'll use placeholder data
        Promise.resolve({ data: { subscribers: [], total: 0 } }),
        Promise.resolve({ data: { invoices: [], total: 0 } }),
        Promise.resolve({ data: null })
      ]);
      
      setPlans(plansResponse.data.plans);
      setSubscribers(subscribersResponse.data.subscribers);
      setInvoices(invoicesResponse.data.invoices);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setActionLoading('create-plan');
      // Note: This would need to be implemented in the admin routes
      // For now, we'll just close the dialog
      setCreatePlanDialog(false);
      resetPlanForm();
      await loadData();
    } catch (err) {
      setError('Failed to create plan');
      console.error('Error creating plan:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      setActionLoading('update-plan');
      // Note: This would need to be implemented in the admin routes
      // For now, we'll just close the dialog
      setEditPlanDialog(false);
      setSelectedPlan(null);
      resetPlanForm();
      await loadData();
    } catch (err) {
      setError('Failed to update plan');
      console.error('Error updating plan:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivatePlan = async (planId: number) => {
    try {
      setActionLoading(`deactivate-${planId}`);
      // Note: This would need to be implemented in the admin routes
      // For now, we'll just reload the data
      await loadData();
    } catch (err) {
      setError('Failed to deactivate plan');
      console.error('Error deactivating plan:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      plan_id: '',
      name: '',
      description: '',
      price: 0,
      billing_cycle: 'monthly',
      features: '',
      limits: {
        books_per_month: 0,
        api_calls_per_month: 0,
        storage_gb: 0
      },
      permissions: {
        books_view: true,
        books_create: false,
        books_upload: false,
        analytics_view: false,
        organization_create: false,
        users_manage: false,
        api_access: false,
        priority_support: false,
        custom_branding: false
      },
      popular: false,
      active: true,
      sort_order: 0
    });
  };

  const openEditDialog = (plan: SubscriptionPlanV2) => {
    setSelectedPlan(plan);
    setPlanForm({
      plan_id: plan.plan_id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      features: plan.features.join('\n'),
      limits: plan.limits,
      permissions: plan.permissions,
      popular: plan.popular,
      active: plan.active,
      sort_order: plan.sort_order
    });
    setEditPlanDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing': return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'past_due': return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled': return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadData} className="mt-2" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
        <p className="text-gray-600 mt-2">Manage subscription plans, subscribers, and analytics</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_users}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.active_subscriptions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.monthly_recurring_revenue}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.churn_rate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
            <Dialog open={createPlanDialog} onOpenChange={setCreatePlanDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetPlanForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Plan</DialogTitle>
                  <DialogDescription>
                    Create a new subscription plan with features and limits.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan_id">Plan ID</Label>
                      <Input
                        id="plan_id"
                        value={planForm.plan_id}
                        onChange={(e) => setPlanForm({...planForm, plan_id: e.target.value})}
                        placeholder="e.g., pro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                        placeholder="e.g., Pro Plan"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                      placeholder="Plan description"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({...planForm, price: Number(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_cycle">Billing Cycle</Label>
                      <select
                        id="billing_cycle"
                        value={planForm.billing_cycle}
                        onChange={(e) => setPlanForm({...planForm, billing_cycle: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={planForm.sort_order}
                        onChange={(e) => setPlanForm({...planForm, sort_order: Number(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      value={planForm.features}
                      onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="popular"
                      checked={planForm.popular}
                      onCheckedChange={(checked) => setPlanForm({...planForm, popular: checked})}
                    />
                    <Label htmlFor="popular">Popular Plan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={planForm.active}
                      onCheckedChange={(checked) => setPlanForm({...planForm, active: checked})}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreatePlanDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan} disabled={actionLoading === 'create-plan'}>
                    {actionLoading === 'create-plan' ? 'Creating...' : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {plan.popular && <Badge className="bg-blue-600 text-white">Popular</Badge>}
                        {!plan.active && <Badge variant="outline">Inactive</Badge>}
                      </CardTitle>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${plan.price}</div>
                      <div className="text-sm text-gray-600">/{plan.billing_cycle}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Features:</strong> {plan.features.join(', ')}
                      </div>
                      <div className="text-sm">
                        <strong>Limits:</strong> {plan.limits.books_per_month} books/month, {plan.limits.api_calls_per_month} API calls/month, {plan.limits.storage_gb} GB storage
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivatePlan(plan.id)}
                        disabled={actionLoading === `deactivate-${plan.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <h2 className="text-2xl font-bold">Subscribers</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscriber.username}</div>
                          <div className="text-sm text-gray-600">{subscriber.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{subscriber.plan_name}</TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell>{new Date(subscriber.current_period_end).toLocaleDateString()}</TableCell>
                      <TableCell>${subscriber.total_paid}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <h2 className="text-2xl font-bold">Invoices</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.user_id}</TableCell>
                      <TableCell>${invoice.amount} {invoice.currency}</TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics</h2>
          {analytics && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.plan_distribution).map(([plan, count]) => (
                        <div key={plan} className="flex justify-between">
                          <span className="capitalize">{plan}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.revenue_by_plan).map(([plan, revenue]) => (
                        <div key={plan} className="flex justify-between">
                          <span className="capitalize">{plan}</span>
                          <span className="font-medium">${revenue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanDialog} onOpenChange={setEditPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_plan_id">Plan ID</Label>
                <Input
                  id="edit_plan_id"
                  value={planForm.plan_id}
                  onChange={(e) => setPlanForm({...planForm, plan_id: e.target.value})}
                  placeholder="e.g., pro"
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Plan Name</Label>
                <Input
                  id="edit_name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  placeholder="e.g., Pro Plan"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={planForm.description}
                onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                placeholder="Plan description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_price">Price</Label>
                <Input
                  id="edit_price"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({...planForm, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit_billing_cycle">Billing Cycle</Label>
                <select
                  id="edit_billing_cycle"
                  value={planForm.billing_cycle}
                  onChange={(e) => setPlanForm({...planForm, billing_cycle: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit_sort_order">Sort Order</Label>
                <Input
                  id="edit_sort_order"
                  type="number"
                  value={planForm.sort_order}
                  onChange={(e) => setPlanForm({...planForm, sort_order: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_features">Features (one per line)</Label>
              <Textarea
                id="edit_features"
                value={planForm.features}
                onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_popular"
                checked={planForm.popular}
                onCheckedChange={(checked) => setPlanForm({...planForm, popular: checked})}
              />
              <Label htmlFor="edit_popular">Popular Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_active"
                checked={planForm.active}
                onCheckedChange={(checked) => setPlanForm({...planForm, active: checked})}
              />
              <Label htmlFor="edit_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan} disabled={actionLoading === 'update-plan'}>
              {actionLoading === 'update-plan' ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortalV2;
