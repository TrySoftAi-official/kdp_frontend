import React, { useEffect, useState } from 'react';
import { 
  Book, DollarSign, Target, AlertTriangle, 
  Users, Upload, CheckCircle, XCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getAllAccounts, getAccountStatus, getRoyalties, getRoyaltiesPerBook, AccountStatus, RoyaltyData, RoyaltySummaryData } from '@/api/additionalService';

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
  const [loading, setLoading] = useState(true);

  // 🔹 All connected accounts
  const [accounts, setAccounts] = useState<AccountStatus[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // 🔹 Current account status
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);

  // 🔹 Royalty data
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData[]>([]);
  const [royaltySummaryData, setRoyaltySummaryData] = useState<RoyaltySummaryData[]>([]);
  const [royaltyLoading, setRoyaltyLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {

    const fetchAllAccounts = async () => {
      try {
        const response = await getAllAccounts();
        console.log('All accounts response:', response);
        if (response.data) {
          const accountsData = Array.isArray(response.data) ? response.data : response.data.accounts || [];
          console.log('Accounts data:', accountsData);
          setAccounts(accountsData);
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


    fetchAllAccounts();
    fetchCurrentAccountStatus();
    setLoading(false);
  }, []);

  // Separate useEffect for royalty data that depends on account status
  useEffect(() => {
    if (accountStatus?.email) {
      console.log('Fetching royalty data for current account email:', accountStatus.email);
      
      const fetchRoyaltyData = async (email: string) => {
        try {
          setRoyaltyLoading(true);
          
          // Fetch both APIs in parallel
          console.log('Calling getRoyalties with email:', email);
          const summaryResponse = await getRoyalties(email);
          console.log('Royalty summary API response:', summaryResponse);
          
          console.log('Calling getRoyaltiesPerBook with email:', email);
          const perBookResponse = await getRoyaltiesPerBook(email);
          console.log('Royalty per book API response:', perBookResponse);
          
          // Set summary data
          if (summaryResponse.data) {
            console.log('Setting royalty summary data:', summaryResponse.data);
            setRoyaltySummaryData(summaryResponse.data);
          } else {
            console.log('No summary data in response');
            setRoyaltySummaryData([]);
          }
          
          // Set per-book data
          if (perBookResponse.data) {
            console.log('Setting royalty per book data:', perBookResponse.data);
            setRoyaltyData(perBookResponse.data);
          } else {
            console.log('No per book data in response');
            setRoyaltyData([]);
          }
        } catch (error) {
          console.error('Failed to fetch royalty data:', error);
          // Set empty arrays when API fails - no mock data
          setRoyaltyData([]);
          setRoyaltySummaryData([]);
        } finally {
          setRoyaltyLoading(false);
        }
      };
      
      fetchRoyaltyData(accountStatus.email);
    } else {
      console.log('No account status email available');
    }
  }, [accountStatus?.email]);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate real metrics from royalty data
  const calculateRealMetrics = () => {
    console.log('Royalty summary data:', royaltySummaryData);
    console.log('Royalty per book data:', royaltyData);
    
    if (royaltySummaryData.length === 0) {
      console.log('No royalty summary data available, returning null');
      return null;
    }

    // Get the first (and likely only) summary record
    const summary = royaltySummaryData[0];
    const totalBooks = parseInt(summary.number_of_books) || 0;
    const totalOrders = parseInt(summary.total_orders) || 0;
    
    // Parse revenue (remove $ and * if present)
    const totalRevenue = parseFloat(summary.revenue.replace('$', '').replace('*', '').replace(',', '')) || 0;
    
    // Calculate average ad spend (mock calculation for now)
    const avgAdSpend = totalRevenue * 0.15; // Assume 15% of revenue goes to ads

    const metrics = {
      totalBooks,
      totalOrders,
      totalRevenue,
      avgAdSpend
    };
    
    console.log('Calculated real metrics:', metrics);
    return metrics;
  };

  const realMetrics = calculateRealMetrics();

  // Manual trigger for testing
  const handleTestRoyaltyAPI = async () => {
    if (accountStatus?.email) {
      console.log('Manual test: Fetching royalty data for current account:', accountStatus.email);
      try {
        const [summaryResponse, perBookResponse] = await Promise.all([
          getRoyalties(accountStatus.email),
          getRoyaltiesPerBook(accountStatus.email)
        ]);
        
        console.log('Manual test summary response:', summaryResponse);
        console.log('Manual test per book response:', perBookResponse);
        
        alert(`Summary API Response: ${JSON.stringify(summaryResponse.data, null, 2)}\n\nPer Book API Response: ${JSON.stringify(perBookResponse.data, null, 2)}`);
      } catch (error) {
        console.error('Manual test error:', error);
        alert(`API Error: ${error}\n\nNo royalty data available.`);
      }
    } else {
      alert('No account email available');
    }
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
      {loading || royaltyLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {realMetrics ? (
            // Show real data from royalty API
            <>
              <SimpleMetricCard 
                metric={{
                  title: 'Total Books',
                  value: realMetrics.totalBooks,
                  change: '+12%',
                  isPositive: true,
                  icon: Book,
                  color: 'bg-blue-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Revenue',
                  value: `$${realMetrics.totalRevenue.toLocaleString()}`,
                  change: '+8.5%',
                  isPositive: true,
                  icon: DollarSign,
                  color: 'bg-green-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Ad Spend',
                  value: `$${realMetrics.avgAdSpend.toLocaleString()}`,
                  change: '+5.2%',
                  isPositive: false,
                  icon: Target,
                  color: 'bg-orange-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Total Orders',
                  value: realMetrics.totalOrders,
                  change: '+5',
                  isPositive: true,
                  icon: AlertTriangle,
                  color: 'bg-purple-500'
                }}
              />
            </>
          ) : (
            // Show zero values when no royalty data
            <>
              <SimpleMetricCard 
                metric={{
                  title: 'Total Books',
                  value: 0,
                  change: '0%',
                  isPositive: true,
                  icon: Book,
                  color: 'bg-blue-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Revenue',
                  value: '$0',
                  change: '0%',
                  isPositive: true,
                  icon: DollarSign,
                  color: 'bg-green-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Ad Spend',
                  value: '$0',
                  change: '0%',
                  isPositive: true,
                  icon: Target,
                  color: 'bg-orange-500'
                }}
              />
              <SimpleMetricCard 
                metric={{
                  title: 'Total Orders',
                  value: 0,
                  change: '0',
                  isPositive: true,
                  icon: AlertTriangle,
                  color: 'bg-purple-500'
                }}
              />
            </>
          )}
        </div>
      )}

      {/* 🔹 Debug Information */}
      <Card className="shadow-md border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Account Status:</strong> {accountStatus ? JSON.stringify(accountStatus, null, 2) : 'null'}</div>
            <div><strong>Account Status Loading:</strong> {accountStatusLoading ? 'true' : 'false'}</div>
            <div><strong>Royalty Loading:</strong> {royaltyLoading ? 'true' : 'false'}</div>
            <div><strong>Royalty Summary Data Length:</strong> {royaltySummaryData.length}</div>
            <div><strong>Royalty Per Book Data Length:</strong> {royaltyData.length}</div>
            <div><strong>Real Metrics:</strong> {realMetrics ? JSON.stringify(realMetrics, null, 2) : 'null'}</div>
            <div><strong>Royalty Summary Data:</strong> {JSON.stringify(royaltySummaryData, null, 2)}</div>
            <div><strong>Royalty Per Book Data:</strong> {JSON.stringify(royaltyData, null, 2)}</div>
            <div className="mt-2 p-2 bg-orange-100 rounded">
              <strong>Note:</strong> Using current Amazon KDP account email for royalty API calls. 
              When backend implements /royalties/&#123;email&#125; and /royalties-per-book/&#123;email&#125;, 
              real data will be displayed automatically.
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={handleTestRoyaltyAPI}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Royalty API
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Royalty Data Details */}
      {realMetrics && royaltyData.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Royalty Details</h2>
            <div className="space-y-3">
              {royaltyData.map((royalty, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{royalty.book_title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                        <div>
                          <span className="font-medium">Ebook:</span> {royalty.ebook_royalties}
                        </div>
                        <div>
                          <span className="font-medium">Print:</span> {royalty.print_royalties}
                        </div>
                        <div>
                          <span className="font-medium">KENP:</span> {royalty.kenp_royalties}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {royalty.total_royalties_usd}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              {accounts.filter(account => account && account.email).map((account, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{account?.email || 'Unknown Email'}</h3>
                        <div className="flex items-center gap-2">
                          {account?.is_active ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="h-4 w-4" /> Inactive
                            </span>
                          )}
                          {account?.can_upload ? (
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
                          <span className="font-medium">Uploads:</span> {account?.uploads_count || 0}/{account?.max_uploads || 0}
                        </div>
                        <div>
                          <span className="font-medium">Remaining:</span> {account?.remaining_uploads || 0}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Status:</span> {account?.status_message || 'Unknown'}
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
