import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ROASChart } from '@/components/analytics/ROASChart';
import { BooksTable } from '@/components/analytics/BooksTable';
import { DateRange, ChartData } from '@/types';
import { analyticsApi } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { RoleBased } from '@/components/shared/RoleBased';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { toast } from '@/lib/toast';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { addNotification } = useUIStore();

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    }
  }, [user]);

  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getChartData(dateRange);
      if (response.success) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load analytics data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simulate export functionality
    addNotification({
      title: 'Export Started',
      message: 'Your analytics report is being generated and will be emailed shortly.',
      type: 'info'
    });
  };

  const getTotalRevenue = () => {
    return chartData.reduce((sum, item) => sum + item.revenue, 0);
  };

  const getTotalAdSpend = () => {
    return chartData.reduce((sum, item) => sum + item.adSpend, 0);
  };

  const getAverageROAS = () => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.roas, 0) / chartData.length;
  };

  const getROASImprovement = () => {
    if (chartData.length < 2) return 0;
    const firstWeek = chartData.slice(0, Math.ceil(chartData.length / 2));
    const secondWeek = chartData.slice(Math.ceil(chartData.length / 2));
    
    const firstAvg = firstWeek.reduce((sum, item) => sum + item.roas, 0) / firstWeek.length;
    const secondAvg = secondWeek.reduce((sum, item) => sum + item.roas, 0) / secondWeek.length;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  return (
    <RoleBased allowedRoles={['admin', 'marketer']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track performance and optimize your book marketing campaigns
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${getTotalRevenue().toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ad Spend</p>
                <p className="text-2xl font-bold">
                  ${getTotalAdSpend().toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average ROAS</p>
                <p className="text-2xl font-bold">
                  {getAverageROAS().toFixed(2)}x
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROAS Improvement</p>
                <p className={`text-2xl font-bold ${
                  getROASImprovement() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getROASImprovement() >= 0 ? '+' : ''}
                  {getROASImprovement().toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={chartData} loading={loading} />
          <ROASChart data={chartData} loading={loading} />
        </div>

        {/* Top Books Table */}
        <BooksTable dateRange={dateRange} />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          setShowUpgradeModal(false);
          toast.success('Subscription upgraded successfully! You can now access analytics.');
        }}
        requiredFeature="Analytics & Performance Metrics"
        currentPlanId={user?.subscription?.plan || 'free'}
        triggerSource="analytics_access"
      />
    </RoleBased>
  );
};
