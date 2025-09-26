/**
 * AdminPortal Component
 * 
 * A comprehensive React component for admin portal functionality,
 * including plan management, subscriber management, and analytics.
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

// Types
interface SubscriptionPlan {
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

interface Subscriber {
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

interface Invoice {
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

interface Analytics {
  total_users: number;
  active_subscriptions: number;
  plan_distribution: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  churn_rate: number;
  average_revenue_per_user: number;
  monthly_recurring_revenue: number;
}

// API Service
class AdminAPI {
  private baseURL = '/api/v2';

  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.baseURL}/subscription/plans`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    return data.plans;
  }

  async createPlan(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const response = await fetch(`${this.baseURL}/admin/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(planData)
    });
    return response.json();
  }

  async updatePlan(planId: number, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const response = await fetch(`${this.baseURL}/admin/plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(planData)
    });
    return response.json();
  }

  async deactivatePlan(planId: number): Promise<void> {
    await fetch(`${this.baseURL}/admin/plans/${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  async getSubscribers(page: number = 1, limit: number = 20): Promise<{subscribers: Subscriber[], total: number}> {
    const response = await fetch(`${this.baseURL}/admin/subscribers?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    return data;
  }

  async getInvoices(page: number = 1, limit: number = 20): Promise<Invoice[]> {
    const response = await fetch(`${this.baseURL}/admin/invoices?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  async getAnalytics(): Promise<Analytics> {
    const response = await fetch(`${this.baseURL}/admin/analytics/subscription`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    return data;
  }

  async cancelUserSubscription(userId: number): Promise<void> {
    await fetch(`${this.baseURL}/admin/subscribers/${userId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}

// Plan Management Component
const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({});

  const api = new AdminAPI();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await api.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      await api.createPlan(formData);
      setShowCreateDialog(false);
      setFormData({});
      loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    
    try {
      await api.updatePlan(editingPlan.id, formData);
      setEditingPlan(null);
      setFormData({});
      loadPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeactivatePlan = async (planId: number) => {
    if (window.confirm('Are you sure you want to deactivate this plan?')) {
      try {
        await api.deactivatePlan(planId);
        loadPlans();
      } catch (error) {
        console.error('Error deactivating plan:', error);
      }
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plan Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>
                Create a new subscription plan with features and pricing.
              </DialogDescription>
            </DialogHeader>
            <PlanForm 
              formData={formData} 
              setFormData={setFormData}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeactivatePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-semibold">${plan.price}/{plan.billing_cycle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={plan.active ? 'default' : 'secondary'}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Popular:</span>
                  <Badge variant={plan.popular ? 'default' : 'outline'}>
                    {plan.popular ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details.
            </DialogDescription>
          </DialogHeader>
          <PlanForm 
            formData={formData} 
            setFormData={setFormData}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Plan Form Component
const PlanForm: React.FC<{
  formData: Partial<SubscriptionPlan>;
  setFormData: (data: Partial<SubscriptionPlan>) => void;
}> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan_id">Plan ID</Label>
          <Input
            id="plan_id"
            value={formData.plan_id || ''}
            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
            placeholder="e.g., premium"
          />
        </div>
        <div>
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Premium Plan"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Plan description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="29.99"
          />
        </div>
        <div>
          <Label htmlFor="billing_cycle">Billing Cycle</Label>
          <select
            id="billing_cycle"
            value={formData.billing_cycle || 'monthly'}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
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
            value={formData.sort_order || 0}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active || false}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="popular"
            checked={formData.popular || false}
            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
          />
          <Label htmlFor="popular">Popular</Label>
        </div>
      </div>
    </div>
  );
};

// Subscriber Management Component
const SubscriberManagement: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const api = new AdminAPI();

  useEffect(() => {
    loadSubscribers();
  }, [page]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await api.getSubscribers(page, 20);
      setSubscribers(data.subscribers);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (userId: number) => {
    if (window.confirm('Are you sure you want to cancel this user\'s subscription?')) {
      try {
        await api.cancelUserSubscription(userId);
        loadSubscribers();
      } catch (error) {
        console.error('Error canceling subscription:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing': return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'past_due': return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscribers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscriber Management</h2>
        <div className="text-sm text-gray-600">
          Total: {total} subscribers
        </div>
      </div>

      <Card>
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
                <TableCell>
                  <div>
                    <div className="font-medium">{subscriber.plan_name}</div>
                    <div className="text-sm text-gray-600">{subscriber.plan_type}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                <TableCell>
                  {new Date(subscriber.current_period_end).toLocaleDateString()}
                </TableCell>
                <TableCell>${subscriber.total_paid.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleCancelSubscription(subscriber.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span className="px-4 py-2 text-sm">Page {page}</span>
        <Button 
          variant="outline" 
          disabled={subscribers.length < 20}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const api = new AdminAPI();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Key Metrics */}
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
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.monthly_recurring_revenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.average_revenue_per_user.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.plan_distribution).map(([plan, count]) => (
              <div key={plan} className="flex justify-between items-center">
                <span className="capitalize">{plan} Plan</span>
                <Badge variant="outline">{count} users</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.revenue_by_plan).map(([plan, revenue]) => (
              <div key={plan} className="flex justify-between items-center">
                <span className="capitalize">{plan} Plan</span>
                <span className="font-semibold">${revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Portal Component
const AdminPortal: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
        <p className="text-gray-600 mt-2">Manage subscriptions, plans, and analytics</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="plans">Plan Management</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>

        <TabsContent value="plans">
          <PlanManagement />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscriberManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPortal;
