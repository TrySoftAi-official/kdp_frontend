import React, { useState, useEffect } from 'react';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { useApi } from '@/hooks/useApi';
import { ApiErrorHandler } from '@/components/ApiErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  BookOpen, 
  Users, 
  CreditCard, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Comprehensive demo component showing full dynamic API integration
 * with real-time updates, error handling, and optimistic UI
 */
export const DynamicApiDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bookPrompt, setBookPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [activeTab, setActiveTab] = useState('auth');

  // Initialize dynamic API with full error handling and notifications
  const {
    isLoading,
    isError,
    error,
    isSuccess,
    isRefetching,
    auth,
    books,
    user,
    payments,
    retry,
    getErrorMessage
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableOptimisticUpdates: true,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Get real-time data using the original hooks
  const { auth: authHooks, user: userHooks, books: booksHooks } = useApi();
  const { data: currentUser } = authHooks.useCurrentUser();
  const { data: booksData, refetch: refetchBooks } = booksHooks.useBooks(1, 10);
  const { data: userStats, refetch: refetchStats } = userHooks.useUserStats();
  const { data: genres } = booksHooks.useGenres();
  const { data: hotGenres } = booksHooks.useHotSellingGenres(5);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        refetchBooks();
        refetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser, refetchBooks, refetchStats]);

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) return;
    
    try {
      await auth.login({ email, password });
      setEmail('');
      setPassword('');
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Handle magic link
  const handleMagicLink = async () => {
    if (!email) return;
    
    try {
      await auth.requestMagicLink(email);
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Handle book creation
  const handleCreateBook = async () => {
    if (!bookPrompt.trim()) return;
    
    try {
      await books.createBook({
        prompt: bookPrompt,
        niche: 'technology',
        targetAudience: 'developers',
        wordCount: 5000,
        genre: selectedGenre || 'non_fiction'
      });
      setBookPrompt('');
      setSelectedGenre('');
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Handle book generation
  const handleGenerateBook = async (prompt: string) => {
    try {
      await books.generateBook({
        prompt,
        niche: 'technology',
        targetAudience: 'developers',
        wordCount: 5000,
        genre: 'non_fiction'
      });
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Handle payment
  const handleCreatePayment = async () => {
    try {
      const result = await payments.createCheckoutSession({
        amount: 29.99,
        currency: 'USD',
        customer_email: currentUser?.email,
        description: 'Premium subscription',
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
        line_items: [{
          product_name: 'Premium Plan',
          product_description: 'Monthly premium subscription',
          quantity: 1,
          unit_amount: 2999,
          tax_amount: 0,
          tax_rate: 0
        }]
      });
      
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      // Error is already handled by useDynamicApi
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isRefetching) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  // Get connection status
  const getConnectionStatus = () => {
    if (navigator.onLine) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><Wifi className="h-3 w-3 mr-1" />Online</Badge>;
    } else {
      return <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" />Offline</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with status indicators */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic API Integration Demo</h1>
          <p className="text-muted-foreground">
            Full API integration with real-time updates, error handling, and optimistic UI
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getConnectionStatus()}
          {isError && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {isError && error && (
        <ApiErrorHandler
          error={error}
          onRetry={retry}
          title="API Error"
          description={getErrorMessage(error)}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                Login with email/password or magic link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-medium text-green-800">Logged in as:</h3>
                    <p className="text-green-700">{currentUser.email}</p>
                    <Badge variant="outline" className="mt-2">{currentUser.role}</Badge>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading || !email || !password}
                      className="flex-1"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                    <Button 
                      onClick={handleMagicLink}
                      disabled={isLoading || !email}
                      variant="outline"
                      className="flex-1"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Magic Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Books Management
              </CardTitle>
              <CardDescription>
                Create, generate, and manage books with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Book */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="book-prompt">Book Description</Label>
                  <Textarea
                    id="book-prompt"
                    placeholder="Describe the book you want to create..."
                    value={bookPrompt}
                    onChange={(e) => setBookPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Genre</Label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres?.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateBook}
                  disabled={isLoading || !bookPrompt.trim()}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Book
                </Button>
              </div>

              {/* Hot Selling Genres */}
              {hotGenres && hotGenres.length > 0 && (
                <div className="space-y-2">
                  <Label>Hot Selling Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {hotGenres.map((genre) => (
                      <Badge 
                        key={genre.id} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleGenerateBook(`Create a book about ${genre.name}`)}
                      >
                        {genre.name} (${genre.avgRevenue.toFixed(2)})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Books List */}
              {booksData && booksData.books.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Books ({booksData.total})</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {booksData.books.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {book.genre} • {book.wordCount} words
                          </p>
                        </div>
                        <Badge variant={book.status === 'published' ? 'default' : 'secondary'}>
                          {book.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Tab */}
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                User Profile & Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{userStats.total_books}</p>
                    <p className="text-sm text-muted-foreground">Total Books</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{userStats.published_books}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">${userStats.total_revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{userStats.account_age_days}</p>
                    <p className="text-sm text-muted-foreground">Days Active</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No user statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing
              </CardTitle>
              <CardDescription>
                Stripe integration for subscriptions and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreatePayment}
                disabled={isLoading || !currentUser}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Subscribe to Premium ($29.99/month)
              </Button>
              {!currentUser && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Please log in to access payment features
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Status Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">API Status:</span>
              {getStatusIcon()}
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : 
                 isError ? 'Error' : 
                 isSuccess ? 'Success' : 
                 isRefetching ? 'Refreshing...' : 'Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-refresh:</span>
              <Badge variant="outline">30s</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
