import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Crown,
  BarChart3
} from 'lucide-react';
import { toast } from '@/utils/toast';

interface AdminSubscriptionDashboardProps {
  className?: string;
}

interface SubscriptionAnalytics {
  total_subscribers: number;
  active_subscribers: number;
  subscribers_by_plan: Record<string, number>;
  monthly_revenue: number;
  churn_rate: number;
  growth_rate: number;
}

interface AdminSubscription {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  plan: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at?: string;
}

interface PlanConfig {
  id: number;
  plan: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  max_books_per_month: number;
  max_api_calls_per_month: number;
  max_storage_mb: number;
  max_sub_users: number;
  features?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const SubscriptionAdminDashboard: React.FC<AdminSubscriptionDashboardProps> = ({
  className = ''
}) => {
  // State
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // Form state for plan creation/editing
  const [planForm, setPlanForm] = useState({
    plan: '',
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_books_per_month: 0,
    max_api_calls_per_month: 0,
    max_storage_mb: 0,
    max_sub_users: 0,
    features: '',
    is_active: true
  });

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, subscriptionsData, plansData] = await Promise.all([
        fetch('/api/admin/subscription/analytics').then(res => res.json()),
        fetch('/api/admin/subscription/subscriptions').then(res => res.json()),
        fetch('/api/admin/subscription/plans').then(res => res.json())
      ]);

      setAnalytics(analyticsData);
      setSubscriptions(subscriptionsData);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    setIsCreatingPlan(true);
    try {
      const response = await fetch('/api/admin/subscription/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });

      if (response.ok) {
        toast.success('Plan created successfully');
        setPlanForm({
          plan: '',
          name: '',
          description: '',
          price_monthly: 0,
          price_yearly: 0,
          max_books_per_month: 0,
          max_api_calls_per_month: 0,
          max_storage_mb: 0,
          max_sub_users: 0,
          features: '',
          is_active: true
        });
        await loadDashboardData();
      } else {
        throw new Error('Failed to create plan');
      }
    } catch (error) {
      toast.error('Failed to create plan');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;

    setIsUpdatingPlan(true);
    try {
      const response = await fetch(`/api/admin/subscription/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });

      if (response.ok) {
        toast.success('Plan updated successfully');
        setSelectedPlan(null);
        await loadDashboardData();
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (error) {
      toast.error('Failed to update plan');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/admin/subscription/plans/${planId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Plan deleted successfully');
        await loadDashboardData();
      } else {
        throw new Error('Failed to delete plan');
      }
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/subscription/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediately: false })
      });

      if (response.ok) {
        toast.success('Subscription cancelled successfully');
        await loadDashboardData();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const editPlan = (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setPlanForm({
      plan: plan.plan,
      name: plan.name,
      description: plan.description || '',
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly || 0,
      max_books_per_month: plan.max_books_per_month,
      max_api_calls_per_month: plan.max_api_calls_per_month,
      max_storage_mb: plan.max_storage_mb,
      max_sub_users: plan.max_sub_users,
      features: plan.features || '',
      is_active: plan.is_active
    });
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage subscriptions, plans, and monitor analytics
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_subscribers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.active_subscribers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.monthly_revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analytics.growth_rate.toFixed(1)}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.churn_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Monthly churn rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.growth_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Monthly growth
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plan Management
          </CardTitle>
          <CardDescription>
            Create and manage subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="plan">Plan ID</Label>
              <Input
                id="plan"
                value={planForm.plan}
                onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })}
                placeholder="e.g., basic, pro, enterprise"
              />
            </div>
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g., Basic Plan"
              />
            </div>
            <div>
              <Label htmlFor="price_monthly">Monthly Price</Label>
              <Input
                id="price_monthly"
                type="number"
                value={planForm.price_monthly}
                onChange={(e) => setPlanForm({ ...planForm, price_monthly: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="price_yearly">Yearly Price</Label>
              <Input
                id="price_yearly"
                type="number"
                value={planForm.price_yearly}
                onChange={(e) => setPlanForm({ ...planForm, price_yearly: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="max_books">Max Books/Month</Label>
              <Input
                id="max_books"
                type="number"
                value={planForm.max_books_per_month}
                onChange={(e) => setPlanForm({ ...planForm, max_books_per_month: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_api_calls">Max API Calls/Month</Label>
              <Input
                id="max_api_calls"
                type="number"
                value={planForm.max_api_calls_per_month}
                onChange={(e) => setPlanForm({ ...planForm, max_api_calls_per_month: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_storage">Max Storage (MB)</Label>
              <Input
                id="max_storage"
                type="number"
                value={planForm.max_storage_mb}
                onChange={(e) => setPlanForm({ ...planForm, max_storage_mb: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_sub_users">Max Sub-users</Label>
              <Input
                id="max_sub_users"
                type="number"
                value={planForm.max_sub_users}
                onChange={(e) => setPlanForm({ ...planForm, max_sub_users: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={planForm.features}
                onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Plan description..."
            />
          </div>

          <div className="flex gap-2">
            {selectedPlan ? (
              <>
                <Button onClick={handleUpdatePlan} disabled={isUpdatingPlan}>
                  {isUpdatingPlan ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Plan
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleCreatePlan} disabled={isCreatingPlan}>
                {isCreatingPlan ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Plans List */}
          <div className="space-y-2">
            <h4 className="font-medium">Existing Plans</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${plan.price_monthly}/month
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPlan(plan)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant={plan.is_active ? 'default' : 'secondary'} className="mt-2">
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscriptions
          </CardTitle>
          <CardDescription>
            Manage user subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.plan}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Current Period</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user_name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subscription.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                        subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                        subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.billing_cycle}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(subscription.current_period_start).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(subscription.current_period_end).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {subscription.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
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
    </div>
  );
};

export default SubscriptionAdminDashboard;
