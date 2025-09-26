import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Loader2, 
  RefreshCw,
  Target,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { toast } from '@/utils/toast';
import AdditionalService, { 
  AllAccountsRoyaltiesResponse,
  RoyaltyData,
  AccountStatus
} from '@/services/additionalService';

// Extend RoyaltyData to include ad status
interface RoyaltyDataWithAds extends RoyaltyData {
  adStatus?: 'running' | 'paused';
}



export const AdCampaignManagement: React.FC = () => {
  const [allAccountsRoyalties, setAllAccountsRoyalties] = useState<AllAccountsRoyaltiesResponse | null>(null);
  const [connectedUserBooks, setConnectedUserBooks] = useState<RoyaltyData[]>([]);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [booksWithAds, setBooksWithAds] = useState<RoyaltyDataWithAds[]>([]);
  const [isLoadingRoyalties, setIsLoadingRoyalties] = useState(false);

  // Initialize dynamic API
  const {
    isRefetching
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Load KDP login status and royalties on component mount
  useEffect(() => {
    // First try to load from localStorage immediately for better UX
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
            isConnected: true,
            lastConnected: session.lastConnected
          });
          // console.log('KDP session loaded from localStorage in AdCampaignManagement');
        } else {
          // Session expired, clear it
          localStorage.removeItem('amazon_kdp_session');
        }
      } catch (error) {
        console.error('Error parsing cached KDP session:', error);
        localStorage.removeItem('amazon_kdp_session');
      }
    }

    // Load cached royalty data immediately
    loadCachedRoyaltyData();
    loadCachedBooksWithAds();
    
    // Then check with API for verification (but only if cache is expired)
    fetchCurrentAccountStatus();
    handleFetchRoyalties();
  }, []);

  // Auto-refresh every 5 minutes (300000ms) instead of 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if cache is expired
      if (isCacheExpired('royalty_data') || isCacheExpired('books_with_ads')) {
      fetchCurrentAccountStatus();
      handleFetchRoyalties();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Caching utility functions
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const isCacheExpired = (cacheKey: string): boolean => {
    const cacheData = localStorage.getItem(`ad_campaign_${cacheKey}`);
    if (!cacheData) return true;
    
    try {
      const parsed = JSON.parse(cacheData);
      const now = new Date().getTime();
      return (now - parsed.timestamp) > CACHE_DURATION;
    } catch {
      return true;
    }
  };

  const saveToCache = (cacheKey: string, data: any) => {
    const cacheData = {
      data,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(`ad_campaign_${cacheKey}`, JSON.stringify(cacheData));
  };

  const loadFromCache = (cacheKey: string): any => {
    const cacheData = localStorage.getItem(`ad_campaign_${cacheKey}`);
    if (!cacheData) return null;
    
    try {
      const parsed = JSON.parse(cacheData);
      if (isCacheExpired(cacheKey)) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  const loadCachedRoyaltyData = () => {
    const cachedData = loadFromCache('royalty_data');
    if (cachedData) {
      setConnectedUserBooks(cachedData);
      console.log('Loaded cached royalty data:', cachedData.length, 'books');
    }
  };

  const loadCachedBooksWithAds = () => {
    const cachedData = loadFromCache('books_with_ads');
    if (cachedData) {
      setBooksWithAds(cachedData);
      console.log('Loaded cached books with ads:', cachedData.length, 'books');
    }
  };

  // Separate useEffect for royalty data that depends on account status (like Dashboard.tsx)
  useEffect(() => {
    if (accountStatus?.email) {
      console.log('Fetching royalty data for current account email:', accountStatus.email);
      
      const fetchRoyaltyDataForAccount = async (email: string) => {
        try {
          setIsLoadingRoyalties(true);
          
          // Get detailed royalties for this user's books
          const userRoyaltiesResponse = await AdditionalService.getRoyaltiesPerBook(email);
          setConnectedUserBooks(userRoyaltiesResponse.data);
          
          // Cache the royalty data
          saveToCache('royalty_data', userRoyaltiesResponse.data);
          
          toast.success(`Loaded ${userRoyaltiesResponse.data.length} books for ${email}`);
        } catch (error) {
          console.error('Error fetching user royalties:', error);
          setConnectedUserBooks([]);
          toast.error('Failed to fetch royalty data for your account');
        } finally {
          setIsLoadingRoyalties(false);
        }
      };
      
      // Only fetch if cache is expired
      if (isCacheExpired('royalty_data')) {
      fetchRoyaltyDataForAccount(accountStatus.email);
      } else {
        console.log('Using cached royalty data, skipping API call');
      }
    } else {
      console.log('No account status email available');
      setConnectedUserBooks([]);
    }
  }, [accountStatus?.email]);

  const fetchCurrentAccountStatus = async () => {
    try {
      // First check localStorage for cached session (same as IntelligentAssistant)
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
              isConnected: true,
              lastConnected: session.lastConnected
            });
            console.log('Account status loaded from localStorage:', session.email);
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
      const response = await AdditionalService.getKdpLoginStatus();
      const loginStatus = response.data;
      console.log('KDP Login Status from API:', loginStatus);
      
      if (loginStatus?.logged_in) {
        // KDP is connected according to backend
        // Try to get the email from existing session or use a default
        const existingSession = localStorage.getItem('amazon_kdp_session');
        let email = 'Connected';
        if (existingSession) {
          try {
            const parsedSession = JSON.parse(existingSession);
            email = parsedSession.email || 'Connected';
          } catch (e) {
            // Use default email
          }
        }
        
        const kdpSession = {
          isConnected: true,
          lastConnected: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          email: email
        };
        
        // Update localStorage with fresh session data
        localStorage.setItem('amazon_kdp_session', JSON.stringify(kdpSession));
        
        setAccountStatus({
          email: email,
          isConnected: true,
          lastConnected: kdpSession.lastConnected
        });
        
        toast.success('Amazon KDP connection verified successfully!');
      } else {
        // KDP is not connected according to backend
        setAccountStatus(null);
        toast.error('Amazon KDP is not connected. Please connect your account.');
      }
    } catch (error) {
      console.error('Failed to fetch current account status:', error);
      setAccountStatus(null);
      toast.error('Failed to fetch KDP account status');
    }
  };


  const handleFetchRoyalties = async () => {
    // Check if we have cached data that's still valid
    const cachedData = loadFromCache('all_accounts_royalties');
    if (cachedData && !isCacheExpired('all_accounts_royalties')) {
      setAllAccountsRoyalties(cachedData);
      console.log('Using cached all accounts royalties data, skipping API call');
      return;
    }

    setIsLoadingRoyalties(true);
    try {
      const response = await AdditionalService.getRoyaltiesForAllAccounts();
      // The API returns RoyaltyData[], so we need to transform it to match our interface
      const transformedData: AllAccountsRoyaltiesResponse = {
        accounts: response.data.map((royalty: RoyaltyData) => ({
          email: royalty.accountName || 'Unknown',
          total_books: 1, // Each royalty entry represents one book
          total_royalties: royalty.total_royalties_usd,
          last_updated: royalty.timestamp
        }))
      };
      setAllAccountsRoyalties(transformedData);
      
      // Cache the transformed data
      saveToCache('all_accounts_royalties', transformedData);
      
      // The connectedUserBooks will be updated by the useEffect that depends on accountStatus?.email
      // This function now only fetches the all accounts data
      
      toast.success(`Loaded royalties for ${transformedData.accounts.length} accounts`);
    } catch (error) {
      console.error('Error fetching royalties:', error);
      toast.error('Failed to fetch royalties data');
    } finally {
      setIsLoadingRoyalties(false);
    }
  };





  // Ad Campaign API Functions
  const handleStartAdsForBook = async (bookId: number) => {
    console.log('=== STARTING ADS FOR BOOK ===');
    console.log('Book ID:', bookId);
    console.log('Connected User Books:', connectedUserBooks);
    console.log('Current booksWithAds:', booksWithAds);
    
    // Find the book
    const book = connectedUserBooks.find(b => b.id === bookId);
    console.log('Found book:', book);
    
    if (!book) {
      console.error('Book not found!');
      toast.error('Book not found in your connected books');
      return;
    }
    
    // Add book to booksWithAds immediately
    const newBookWithAds = { ...book, adStatus: 'running' as const };
    console.log('New book with ads:', newBookWithAds);
    
    setBooksWithAds(prev => {
      console.log('Previous booksWithAds:', prev);
      const exists = prev.some(b => b.id === bookId);
      console.log('Book already exists:', exists);
      
      if (!exists) {
        const newState = [...prev, newBookWithAds];
        console.log('New state:', newState);
        
        // Cache the updated books with ads
        saveToCache('books_with_ads', newState);
        
        return newState;
      }
      return prev;
    });
    
    // Make API call
    try {
      const response = await AdditionalService.startAdsForBook(bookId.toString());
      console.log('API Response:', response);
      
      if (response.data.message) {
        toast.success(`Ad campaign started for book ID ${bookId}`);
      } else {
        // Remove book if API fails
        setBooksWithAds(prev => prev.filter(b => b.id !== bookId));
        toast.error(response.data.message || 'Failed to start ad campaign');
      }
    } catch (error) {
      console.error('API Error:', error);
      console.warn('Ad campaign service not available:', error);
      
      // Keep the book in the UI but show a demo message
      toast.info('Ad campaign service unavailable. This is a demo - your book is ready for ads when the service is connected.');
      
      // Don't remove the book from the UI since this is a service issue, not a book issue
      // setBooksWithAds(prev => prev.filter(b => b.id !== bookId));
    }
  };

  const handlePauseAdsForBook = async (bookId: number) => {
    try {
      const response = await AdditionalService.pauseAdsForBook(bookId.toString());
      if (response.data.message) {
        toast.success(`Ad campaign paused for book ID ${bookId}`);
        
        // Update the ad status in booksWithAds
        setBooksWithAds(prev => {
          const updated = prev.map(book => 
          book.id === bookId 
            ? { ...book, adStatus: 'paused' as const }
            : book
          );
          // Cache the updated books with ads
          saveToCache('books_with_ads', updated);
          return updated;
        });
      } else {
        toast.error(response.data.message || 'Failed to pause ad campaign');
      }
    } catch (error) {
      console.error('Error pausing ad campaign:', error);
      console.warn('Ad campaign service not available:', error);
      
      // Update the UI anyway for demo purposes
      setBooksWithAds(prev => {
        const updated = prev.map(book => 
        book.id === bookId 
          ? { ...book, adStatus: 'paused' as const }
          : book
        );
        saveToCache('books_with_ads', updated);
        return updated;
      });
      
      toast.info('Ad campaign service unavailable. This is a demo - your book ad status has been updated locally.');
    }
  };

  const handleRestartAdsForBook = async (bookId: number) => {
    try {
      const response = await AdditionalService.restartAdsForBook(bookId.toString());
      if (response.data.message) {
        toast.success(`Ad campaign restarted for book ID ${bookId}`);
        
        // Update the ad status in booksWithAds
        setBooksWithAds(prev => {
          const updated = prev.map(book => 
          book.id === bookId 
            ? { ...book, adStatus: 'running' as const }
            : book
          );
          // Cache the updated books with ads
          saveToCache('books_with_ads', updated);
          return updated;
        });
      } else {
        toast.error(response.data.message || 'Failed to restart ad campaign');
      }
    } catch (error) {
      console.error('Error restarting ad campaign:', error);
      console.warn('Ad campaign service not available:', error);
      
      // Update the UI anyway for demo purposes
      setBooksWithAds(prev => {
        const updated = prev.map(book => 
        book.id === bookId 
          ? { ...book, adStatus: 'running' as const }
          : book
        );
        saveToCache('books_with_ads', updated);
        return updated;
      });
      
      toast.info('Ad campaign service unavailable. This is a demo - your book ad status has been updated locally.');
    }
  };


  // Debug: Log booksWithAds changes
  useEffect(() => {
    console.log('booksWithAds state updated:', booksWithAds);
  }, [booksWithAds]);

  // Calculate stats from books with ads
  const totalBooksWithAds = booksWithAds.length;
  const runningAds = booksWithAds.filter(book => book.adStatus === 'running').length;
  const pausedAds = booksWithAds.filter(book => book.adStatus === 'paused').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Campaign Management</h1>
          <p className="text-gray-600">Manage advertising campaigns for your uploaded books</p>
        </div>

        {/* <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchCurrentAccountStatus()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check KDP Status
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFetchRoyalties}
            disabled={isLoadingRoyalties}
          >
            {isLoadingRoyalties ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Books
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Force refresh by clearing cache and fetching fresh data
              localStorage.removeItem('ad_campaign_royalty_data');
              localStorage.removeItem('ad_campaign_all_accounts_royalties');
              localStorage.removeItem('ad_campaign_books_with_ads');
              handleFetchRoyalties();
              if (accountStatus?.email) {
                // Trigger the useEffect to fetch fresh royalty data
                const event = new Event('forceRefreshRoyalties');
                window.dispatchEvent(event);
              }
            }}
            disabled={isLoadingRoyalties}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (connectedUserBooks.length > 0) {
                const firstBook = connectedUserBooks[0];
                setBooksWithAds(prev => {
                  const newState = [...prev, { ...firstBook, adStatus: 'running' as const }];
                  saveToCache('books_with_ads', newState);
                  return newState;
                });
                console.log('Manually added book to booksWithAds:', firstBook);
              }
            }}
          >
            Test Add Book
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setBooksWithAds([]);
              saveToCache('books_with_ads', []);
              console.log('Cleared booksWithAds');
            }}
          >
            Clear Ads
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (connectedUserBooks.length > 0) {
                const testBook = { ...connectedUserBooks[0], adStatus: 'running' as const };
                setBooksWithAds([testBook]);
                saveToCache('books_with_ads', [testBook]);
                console.log('Set booksWithAds to:', [testBook]);
              }
            }}
          >
            Force Set State
          </Button>
        </div> */}
      </div>

      {/* Debug Info */}
      {/* <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-sm text-yellow-700">
            <p>Connected User Books: {connectedUserBooks.length}</p>
            <p>Books with Ads: {booksWithAds.length}</p>
            <p>Account Status: {accountStatus?.email || 'Not connected'}</p>
            <p>Books with Ads IDs: {booksWithAds.map(b => b.id).join(', ')}</p>
            <p>Cache Status:</p>
            <ul className="ml-4">
              <li>Royalty Data: {isCacheExpired('royalty_data') ? 'Expired' : 'Valid'}</li>
              <li>All Accounts: {isCacheExpired('all_accounts_royalties') ? 'Expired' : 'Valid'}</li>
              <li>Books with Ads: {isCacheExpired('books_with_ads') ? 'Expired' : 'Valid'}</li>
            </ul>
          </div>
        </CardContent>
      </Card> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">KDP Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {accountStatus?.email ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-600">Disconnected</span>
                  )}
                </p>
                {accountStatus?.email && (
                  <p className="text-xs text-gray-500 truncate">{accountStatus.email}</p>
                )}
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Books</p>
                <p className="text-2xl font-bold text-gray-900">{connectedUserBooks.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Books with Ads</p>
                <p className="text-2xl font-bold text-gray-900">{totalBooksWithAds}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running Ads</p>
                <p className="text-2xl font-bold text-gray-900">{runningAds}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused Ads</p>
                <p className="text-2xl font-bold text-gray-900">{pausedAds}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Ad Campaign Service Status</span>
          </div>
          <p className="text-yellow-700 mt-1 text-sm">
            The ad campaign service is currently unavailable. You can still interact with the interface to see how it would work. 
            When the service is connected, your ad campaigns will be managed automatically.
          </p>
        </CardContent>
      </Card>

      {/* My Books from Royalties Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Books from Royalties ({connectedUserBooks.length} books)</span>
            {isRefetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!accountStatus?.email ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not connected to KDP</h3>
              <p className="text-muted-foreground mb-4">
                Please connect to Amazon KDP first to view your published books and create advertising campaigns.
              </p>
              <Button onClick={() => fetchCurrentAccountStatus()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check KDP Status
              </Button>
            </div>
          ) : isLoadingRoyalties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedUserBooks.map((book) => {
                const bookWithAds = booksWithAds.find(b => b.id === book.id);
                const hasAds = !!bookWithAds;
                console.log(`Book ${book.id} (${book.book_title}): hasAds=${hasAds}, bookWithAds=`, bookWithAds);
                return (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200 border">
                          ✓ Published
                        </Badge>
                      </div>
                      {hasAds && (
                        <div className="absolute top-2 left-2">
                          <Badge className={`border ${
                            bookWithAds?.adStatus === 'running' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            <Target className="h-3 w-3 mr-1" />
                            {bookWithAds?.adStatus === 'running' ? 'Running' : 'Paused'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.book_title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Total Royalties: ${book.total_royalties_usd}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Ebook: ${book.ebook_royalties}</span>
                          <span>• Print: ${book.print_royalties}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Last Updated: {new Date(book.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!hasAds ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStartAdsForBook(book.id)}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            Start Ads
                          </Button>
                        ) : (
                          <div className="flex gap-1 flex-1">
                            {bookWithAds?.adStatus === 'running' ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handlePauseAdsForBook(book.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleRestartAdsForBook(book.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Restart
                              </Button>
                            )}
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log('View book details:', book.book_title)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {accountStatus?.email && !isLoadingRoyalties && connectedUserBooks.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books with royalties found</h3>
              <p className="text-muted-foreground mb-4">
                No books with royalty data found for {accountStatus.email}. Make sure your books are published and generating sales.
              </p>
              <Button onClick={() => fetchCurrentAccountStatus()} disabled={isLoadingRoyalties}>
                {isLoadingRoyalties ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Books
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Published Books from Royalties Section */}
      {allAccountsRoyalties && allAccountsRoyalties.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Published Books with Royalties ({allAccountsRoyalties.accounts.length} accounts)</span>
              {isLoadingRoyalties && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading royalties...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allAccountsRoyalties.accounts.map((account: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{account.email}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>Total Books: {account.total_books}</span>
                          <span>Total Royalties: ${account.total_royalties}</span>
                          <span>Last Updated: {new Date(account.last_updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // This would need to be enhanced to get specific book IDs from the account
                            toast.info('Feature coming soon: Start ads for all books in this account');
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start All Ads
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            toast.info('Feature coming soon: Pause ads for all books in this account');
                          }}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause All Ads
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books with Active Ads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Books with Active Ads ({booksWithAds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Debug info for this section */}
          {/* <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p>Debug: booksWithAds.length = {booksWithAds.length}</p>
            <p>Debug: booksWithAds = {JSON.stringify(booksWithAds, null, 2)}</p>
          </div> */}
          
          {booksWithAds.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active ads yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Start Ads" on any of your books above to create advertising campaigns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {booksWithAds.map((book) => (
                <Card key={book.id} className={`border-l-4 ${
                  book.adStatus === 'running' ? 'border-l-green-500' : 'border-l-yellow-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{book.book_title}</h3>
                          <Badge className={`border ${
                            book.adStatus === 'running' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {book.adStatus === 'running' ? (
                              <Play className="h-4 w-4 mr-1" />
                            ) : (
                              <Pause className="h-4 w-4 mr-1" />
                            )}
                            <span className="ml-1 capitalize">{book.adStatus}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Total Royalties: ${book.total_royalties_usd}</span>
                          <span>Ebook: ${book.ebook_royalties}</span>
                          <span>Print: ${book.print_royalties}</span>
                          <span>Last Updated: {new Date(book.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {book.adStatus === 'running' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePauseAdsForBook(book.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause Ads
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleRestartAdsForBook(book.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Restart Ads
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Book Royalty Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${book.total_royalties_usd}</p>
                        <p className="text-sm text-muted-foreground">Total Royalties</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">${book.ebook_royalties}</p>
                        <p className="text-sm text-muted-foreground">Ebook Royalties</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">${book.print_royalties}</p>
                        <p className="text-sm text-muted-foreground">Print Royalties</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">${book.kenp_royalties}</p>
                        <p className="text-sm text-muted-foreground">KENP Royalties</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
