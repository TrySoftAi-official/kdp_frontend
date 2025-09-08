import React, { useEffect, useState } from 'react';
import { Book, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/types';
import { analyticsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// Simple Metric Card Component
const SimpleMetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
  const { title, value, change, isPositive, icon: Icon, color } = metric;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <div className={`flex items-center text-xs font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? '↗' : '↘'} {change}
              </div>
            </div>
          </div>
          
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await analyticsApi.getMetrics();
        if (response.success) {
          // Add icons to metrics
          const metricsWithIcons = response.data.map((metric, index) => ({
            ...metric,
            icon: [Book, DollarSign, Target, AlertTriangle][index] || Book
          }));
          setMetrics(metricsWithIcons);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Fallback metrics
        setMetrics([
          {
            title: 'Total Books',
            value: 24,
            change: '+12%',
            isPositive: true,
            icon: Book,
            color: 'bg-blue-500'
          },
          {
            title: 'Revenue',
            value: '$12,450',
            change: '+8.2%',
            isPositive: true,
            icon: DollarSign,
            color: 'bg-green-500'
          },
          {
            title: 'ROAS',
            value: '6.2x',
            change: '+0.3x',
            isPositive: true,
            icon: Target,
            color: 'bg-purple-500'
          },
          {
            title: 'Active Campaigns',
            value: 8,
            change: '-2',
            isPositive: false,
            icon: AlertTriangle,
            color: 'bg-orange-500'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600">
          Welcome to ForgeKDP! Your AI-powered book creation and publishing platform.
        </p>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <SimpleMetricCard key={index} metric={metric} />
          ))}
        </div>
      )}

      {/* Recent Events */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Book Published Successfully</p>
                <p className="text-sm text-gray-600">Digital Marketing Mastery has been published</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">High Ad Spend Alert</p>
                <p className="text-sm text-gray-600">Romance in Paris campaign exceeded budget</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">New Order Received</p>
                <p className="text-sm text-gray-600">Order for "Cooking Basics" received</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <a href="/create" className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 font-medium transition-colors text-center">
              Create New Book
            </a>
            <a href="/books" className="p-4 bg-green-100 hover:bg-green-200 rounded-lg text-green-800 font-medium transition-colors text-center">
              View My Books
            </a>
            <a href="/publish" className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 font-medium transition-colors text-center">
              Publish Books
            </a>
            <a href="/analytics" className="p-4 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-800 font-medium transition-colors text-center">
              View Analytics
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
