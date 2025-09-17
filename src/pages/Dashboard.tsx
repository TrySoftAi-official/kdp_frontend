import React, { useEffect, useState } from 'react';
import { 
  Book, DollarSign, Target, AlertTriangle, 
  Users, Upload, CheckCircle, XCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/types';
import { analyticsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getAllAccounts, getAccountStatus, AccountStatus, ConnectedAccount } from '@/api/additionalService';

// 🔹 Simple Metric Card
const SimpleMetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
  const { title, value, change, isPositive, icon: Icon, color } = metric;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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

  // 🔹 All connected accounts
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // 🔹 Current account status
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await analyticsApi.getMetrics();
        if (response.success) {
          const metricsWithIcons = response.data.map((metric, index) => ({
            ...metric,
            icon: [Book, DollarSign, Target, AlertTriangle][index] || Book,
          }));
          setMetrics(metricsWithIcons);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setMetrics([
          { title: 'Total Books', value: 24, change: '+12%', isPositive: true, icon: Book, color: 'bg-blue-500' },
          { title: 'Revenue', value: '$12,450', change: '+8.2%', isPositive: true, icon: DollarSign, color: 'bg-green-500' },
          { title: 'ROAS', value: '6.2x', change: '+0.3x', isPositive: true, icon: Target, color: 'bg-purple-500' },
          { title: 'Active Campaigns', value: 8, change: '-2', isPositive: false, icon: AlertTriangle, color: 'bg-orange-500' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllAccounts = async () => {
      try {
        const response = await getAllAccounts();
        if (response.data) {
          setAccounts(Array.isArray(response.data) ? response.data : response.data.accounts || []);
        }
      } catch (error) {
        console.error('Failed to fetch all accounts:', error);
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };

    const fetchCurrentAccountStatus = async () => {
      try {
        const response = await getAccountStatus();
        if (response.data) {
          setAccountStatus(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch current account status:', error);
        setAccountStatus(null);
      } finally {
        setAccountStatusLoading(false);
      }
    };

    fetchMetrics();
    fetchAllAccounts();
    fetchCurrentAccountStatus();
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

      {/* Metrics */}
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

      {/* 🔹 Current Account Status */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Account Status</h2>
          {accountStatusLoading ? (
            <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ) : accountStatus ? (
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{accountStatus.email}</h3>
                    <div className="flex items-center gap-2">
                      {accountStatus.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircle className="h-4 w-4" /> Inactive
                        </span>
                      )}
                      {accountStatus.can_upload ? (
                        <span className="flex items-center gap-1 text-blue-600 text-sm">
                          <Upload className="h-4 w-4" /> Can Upload
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Upload Disabled</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Uploads:</span> {accountStatus.uploads_count}/{accountStatus.max_uploads}
                    </div>
                    <div>
                      <span className="font-medium">Remaining:</span> {accountStatus.remaining_uploads}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Status:</span> {accountStatus.status_message}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No status available</p>
          )}
        </CardContent>
      </Card>

      {/* 🔹 All Connected Accounts */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" /> All Connected Accounts
          </h2>
          {accountsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{account.email}</h3>
                        <div className="flex items-center gap-2">
                          {account.is_active ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="h-4 w-4" /> Inactive
                            </span>
                          )}
                          {account.can_upload ? (
                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                              <Upload className="h-4 w-4" /> Can Upload
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">Upload Disabled</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Uploads:</span> {account.uploads_count}/{account.max_uploads}
                        </div>
                        <div>
                          <span className="font-medium">Remaining:</span> {account.remaining_uploads}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Status:</span> {account.status_message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No connected accounts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 Recent Events */}
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

      {/* 🔹 Quick Actions */}
      {/* <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
            <a href="/subscription" className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-800 font-medium transition-colors text-center">
              Manage Subscription
            </a>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};
