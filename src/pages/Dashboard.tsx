import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Book, DollarSign, Target, AlertTriangle, 
  Users, Upload, CheckCircle, XCircle, 
  Lightbulb, X, Eye, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Metric } from '@/types';
import { useAuth } from '@/redux/hooks/useAuth';
import { getAllAccounts, getAccountStatus, getRoyalties, getRoyaltiesPerBook, getBookInsights, AccountStatus, RoyaltyData, RoyaltySummaryData, BookInsightsResponse } from '@/services/additionalService';

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
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

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

  // 🔹 Book insights data
  const [bookInsights, setBookInsights] = useState<BookInsightsResponse | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  const { user } = useAuth();

  // Memoize the email to prevent unnecessary re-renders
  const accountEmail = useMemo(() => accountStatus?.email, [accountStatus?.email]);
  
  // Ref to track if we're currently fetching royalty data
  const isFetchingRoyalty = useRef(false);

  // Debug: Log when component renders
  console.log('🔄 Dashboard: Component rendering - accountEmail:', accountEmail, 'royaltyLoading:', royaltyLoading);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Dashboard: Global error caught:', error);
      setError('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Navigation guard - prevent interference with route changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsNavigating(true);
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Detect route changes and reset navigation state
  useEffect(() => {
    setIsNavigating(false);
  }, [location.pathname]);

  // Fetch book insights
  const fetchBookInsights = useCallback(async () => {
    try {
      const response = await getBookInsights({ book_id: 0 }); // Using 0 as default to get all insights
      setBookInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch book insights:', error);
      setBookInsights(null);
    }
  }, []);

  // Define fetchCurrentAccountStatus outside useEffect
  const fetchCurrentAccountStatus = useCallback(async () => {
    try {
      // First check localStorage for cached KDP session (same as IntelligentAssistant)
      const sessionData = localStorage.getItem('amazon_kdp_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const now = new Date();
          const expiresAt = new Date(session.expiresAt);
          
          if (expiresAt > now && session.isConnected) {
            // We have a valid cached session, use it immediately
            setAccountStatus({
              email: session.email || 'Connected',
              is_active: true,
              can_upload: true,
              uploads_count: 0,
              max_uploads: 3,
              remaining_uploads: 3,
              status_message: 'KDP Connected via cached session',
              isConnected: true,
              lastConnected: session.lastConnected
            });
            console.log('Account status loaded from localStorage:', session.email);
            setAccountStatusLoading(false);
            return;
          } else {
            // Session expired, clear it
            localStorage.removeItem('amazon_kdp_session');
          }
        } catch (error) {
          console.error('Error parsing cached KDP session:', error);
          localStorage.removeItem('amazon_kdp_session');
        }
      }

      // Fallback to API call if no valid cached session
      const response = await getAccountStatus();
      if (response.data) {
        // Handle both single account and array response
        const accountData = Array.isArray(response.data) ? response.data[0] : response.data;
        setAccountStatus(accountData);
      }
    } catch (error) {
      console.error('Failed to fetch current account status:', error);
      setAccountStatus(null);
    } finally {
      setAccountStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAllAccounts = async () => {
      try {
        setError(null); // Clear any previous errors
        // First try to get accounts from KDP session data
        const sessionData = localStorage.getItem('amazon_kdp_session');
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);
            
            if (expiresAt > now && session.isConnected) {
              // Create account data from KDP session
              const kdpAccount: AccountStatus = {
                id: 'kdp-account',
                email: session.email || 'Connected',
                is_active: true,
                can_upload: true,
                uploads_count: 0,
                max_uploads: 3,
                remaining_uploads: 3,
                status_message: 'KDP Connected',
                isConnected: true,
                lastConnected: session.lastConnected,
                status: 'active'
              };
              
              console.log('Using KDP session data for accounts:', kdpAccount);
              setAccounts([kdpAccount]);
              setAccountsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing KDP session for accounts:', error);
          }
        }

        // Fallback to API call
        const response = await getAllAccounts();
        console.log('All accounts response:', response);
        if (response.data) {
          const accountsData = Array.isArray(response.data) ? response.data : [];
          console.log('Accounts data:', accountsData);
          setAccounts(accountsData);
        } else {
          setAccounts([]);
        }
      } catch (error) {
        console.error('Failed to fetch all accounts:', error);
        setAccounts([]);
        setError('Failed to load account data. Please refresh the page.');
      } finally {
        setAccountsLoading(false);
      }
    };

    console.log('🔄 Dashboard: Initializing - calling fetchAllAccounts and fetchCurrentAccountStatus');
    fetchAllAccounts();
    fetchCurrentAccountStatus();
    fetchBookInsights(); // Fetch book insights on component mount
    setLoading(false);
  }, [fetchCurrentAccountStatus, fetchBookInsights]); // Removed accountStatus dependency to prevent infinite loops

  // Memoized fetch function to prevent recreation on every render
  const fetchRoyaltyData = useCallback(async (email: string) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRoyalty.current) {
      console.log('Already fetching royalty data, skipping...');
      return;
    }
    
    try {
      isFetchingRoyalty.current = true;
      setRoyaltyLoading(true);
      
      // Fetch both APIs in parallel
      console.log('🔄 Dashboard: Calling getRoyalties with email:', email);
      const summaryResponse = await getRoyalties(email);
      console.log('📊 Dashboard: Royalty summary API response:', summaryResponse);
      
      console.log('🔄 Dashboard: Calling getRoyaltiesPerBook with email:', email);
      const perBookResponse = await getRoyaltiesPerBook(email);
      console.log('📊 Dashboard: Royalty per book API response:', perBookResponse);
      
      // Set summary data
      if (summaryResponse.data) {
        console.log('✅ Dashboard: Setting royalty summary data:', summaryResponse.data);
        setRoyaltySummaryData(summaryResponse.data);
      } else {
        console.log('❌ Dashboard: No summary data in response');
        setRoyaltySummaryData([]);
      }
      
      // Set per-book data
      if (perBookResponse.data) {
        console.log('✅ Dashboard: Setting royalty per book data:', perBookResponse.data);
        setRoyaltyData(perBookResponse.data);
      } else {
        console.log('❌ Dashboard: No per book data in response');
        setRoyaltyData([]);
      }
    } catch (error) {
      console.error('❌ Dashboard: Failed to fetch royalty data:', error);
      // Set empty arrays when API fails - no mock data
      setRoyaltyData([]);
      setRoyaltySummaryData([]);
    } finally {
      setRoyaltyLoading(false);
      isFetchingRoyalty.current = false;
    }
  }, []);

  // Separate useEffect for royalty data that depends on account status
  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered - accountEmail:', accountEmail, 'isFetching:', isFetchingRoyalty.current);
    
    if (accountEmail) {
      console.log('📧 Dashboard: Fetching royalty data for current account email:', accountEmail);
      fetchRoyaltyData(accountEmail);
    } else {
      console.log('❌ Dashboard: No account status email available');
      // Clear royalty data when no account status
      setRoyaltyData([]);
      setRoyaltySummaryData([]);
      setRoyaltyLoading(false);
    }
  }, [accountEmail, fetchRoyaltyData]); // Use memoized email and function

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRoyalty.current = false;
      // Clear any pending timeouts
      const timeouts = window.setTimeout(() => {}, 0);
      if (timeouts) {
        clearTimeout(timeouts);
      }
    };
  }, []);

  // Refresh accounts list
  const refreshAccountsList = useCallback(() => {
    const sessionData = localStorage.getItem('amazon_kdp_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (expiresAt > now && session.isConnected) {
          // Create account data from KDP session
          const kdpAccount: AccountStatus = {
            id: 'kdp-account',
            email: session.email || 'Connected',
            is_active: true,
            can_upload: true,
            uploads_count: 0,
            max_uploads: 3,
            remaining_uploads: 3,
            status_message: 'KDP Connected',
            isConnected: true,
            lastConnected: session.lastConnected,
            status: 'active'
          };
          
          console.log('Refreshing accounts list with KDP session data:', kdpAccount);
          setAccounts([kdpAccount]);
        } else {
          setAccounts([]);
        }
      } catch (error) {
        console.error('Error refreshing accounts list:', error);
        setAccounts([]);
      }
    } else {
      setAccounts([]);
    }
  }, []);

  // Listen for localStorage changes to sync KDP session
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'amazon_kdp_session' && !isNavigating) {
        console.log('KDP session changed in localStorage, refreshing account status...');
        // Use setTimeout to prevent blocking navigation
        setTimeout(() => {
          if (!isNavigating) {
            fetchCurrentAccountStatus();
            refreshAccountsList();
          }
        }, 0);
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      if (!isNavigating) {
        console.log('KDP session updated via custom event, refreshing account status...');
        // Use setTimeout to prevent blocking navigation
        setTimeout(() => {
          if (!isNavigating) {
            fetchCurrentAccountStatus();
            refreshAccountsList();
          }
        }, 0);
      }
    };

    window.addEventListener('kdp-session-updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kdp-session-updated', handleCustomStorageChange);
    };
  }, [fetchCurrentAccountStatus, refreshAccountsList, isNavigating]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate real metrics from royalty data - memoized to prevent infinite loops
  const realMetrics = useMemo(() => {
    console.log('🧮 Dashboard: Calculating real metrics - Royalty summary data:', royaltySummaryData);
    console.log('🧮 Dashboard: Calculating real metrics - Royalty per book data:', royaltyData);
    
    if (royaltySummaryData.length === 0) {
      console.log('❌ Dashboard: No royalty summary data available, returning null');
      return null;
    }

    // Get the first (and likely only) summary record
    const summary = royaltySummaryData[0];
    const totalBooks = parseInt(summary.number_of_books || '0') || 0;
    const totalOrders = parseInt(summary.total_orders || '0') || 0;
    
    // Parse revenue (remove $ and * if present)
    const totalRevenue = parseFloat((summary.revenue || '0').replace('$', '').replace('*', '').replace(',', '')) || 0;
    
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
  }, [royaltySummaryData, royaltyData]); // Only recalculate when data changes


  // Refresh KDP session data
  const handleRefreshKDPStatus = useCallback(() => {
    // Use setTimeout to prevent blocking navigation
    setTimeout(() => {
      fetchCurrentAccountStatus();
      refreshAccountsList();
    }, 0);
  }, [fetchCurrentAccountStatus, refreshAccountsList]);

  // 🔹 Recommendations Banner Component
  const RecommendationsBanner: React.FC = () => {
    if (!bookInsights?.recommendations || bookInsights.recommendations.length === 0) {
      return null;
    }

    return (
      <Card className="shadow-md border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">AI Recommendations</h3>
                <p className="text-sm text-blue-700">
                  {bookInsights.recommendations.length} insights based on your book data
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInsightsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {bookInsights.recommendations.slice(0, 2).map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>{recommendation}</span>
              </div>
            ))}
            {bookInsights.recommendations.length > 2 && (
              <p className="text-xs text-blue-600 ml-3">
                +{bookInsights.recommendations.length - 2} more recommendations
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 🔹 Insights Modal Component
  const InsightsModal: React.FC = () => {
    if (!showInsightsModal || !bookInsights) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              Book Insights & Analytics
            </h2>
            <button
              onClick={() => setShowInsightsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Books Analyzed</h3>
                  <p className="text-2xl font-bold text-blue-600">{bookInsights.total_books_analyzed}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Recent Books</h3>
                  <p className="text-2xl font-bold text-green-600">{bookInsights.recent_books_count}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Historical Books</h3>
                  <p className="text-2xl font-bold text-purple-600">{bookInsights.historical_books_count}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {bookInsights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category Insights */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Category Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Primary Categories</h4>
                    <div className="space-y-1">
                      {Object.entries(bookInsights.category_insights.primary_category_distribution)
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Secondary Categories</h4>
                    <div className="space-y-1">
                      {Object.entries(bookInsights.category_insights.secondary_category_distribution)
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Insights */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Pricing Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700">Average Price</h4>
                    <p className="text-xl font-bold text-green-600">${bookInsights.pricing_insights.average_price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Median Price</h4>
                    <p className="text-xl font-bold text-green-600">${bookInsights.pricing_insights.median_price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Min Price</h4>
                    <p className="text-xl font-bold text-green-600">${bookInsights.pricing_insights.min_price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Max Price</h4>
                    <p className="text-xl font-bold text-green-600">${bookInsights.pricing_insights.max_price}</p>
                  </div>
                </div>
              </div>

              {/* Author Insights */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-3">Author Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-indigo-700 mb-2">Most Prolific Authors</h4>
                    <div className="space-y-1">
                      {Object.entries(bookInsights.author_insights.author_distribution)
                        .slice(0, 5)
                        .map(([author, count]) => (
                          <div key={author} className="flex justify-between text-sm">
                            <span>{author}</span>
                            <span className="font-medium">{count} books</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-700 mb-2">Top Keywords</h4>
                    <div className="space-y-1">
                      {Object.entries(bookInsights.keyword_insights.most_popular_keywords)
                        .slice(0, 5)
                        .map(([keyword, count]) => (
                          <div key={keyword} className="flex justify-between text-sm">
                            <span>{keyword}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Insights */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">Quality Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-700">Completion Rate</h4>
                    <p className="text-xl font-bold text-orange-600">{bookInsights.quality_insights.completion_rate}%</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700">Avg Title Length</h4>
                    <p className="text-xl font-bold text-orange-600">{bookInsights.quality_insights.avg_title_length}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700">Avg Description</h4>
                    <p className="text-xl font-bold text-orange-600">{Math.round(bookInsights.quality_insights.avg_description_length)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700">Complete KDP Data</h4>
                    <p className="text-xl font-bold text-orange-600">{bookInsights.quality_insights.books_with_complete_kdp_data}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state if still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          {getGreeting()}, {user?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600">
          Welcome to ForgeKDP! Your AI-powered book creation and publishing platform.
        </p>
      </div>

      {/* AI Recommendations Banner */}
      <RecommendationsBanner />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

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
      {/* <Card className="shadow-md border-yellow-200 bg-yellow-50">
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
      </Card> */}

      {/* 🔹 Royalty Data Details */}
      {/* {realMetrics && royaltyData.length > 0 && (
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
      )} */}

      {/* 🔹 Current Account Status */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Account Status</h2>
            <button 
              onClick={handleRefreshKDPStatus}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Status
            </button>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" /> All Connected Accounts
            </h2>
            <button 
              onClick={refreshAccountsList}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Accounts
            </button>
          </div>
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
              <div className="mt-4 text-xs text-gray-400">
                <p>Debug: Accounts array length: {accounts.length}</p>
                <p>Debug: Accounts loading: {accountsLoading ? 'true' : 'false'}</p>
                <p>Debug: KDP session exists: {localStorage.getItem('amazon_kdp_session') ? 'yes' : 'no'}</p>
              </div>
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

      {/* Insights Modal */}
      <InsightsModal />
    </div>
  );
};
