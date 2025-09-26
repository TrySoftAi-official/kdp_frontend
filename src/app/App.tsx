
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/layout/BaseLayout';
import { ProtectedRoute } from '@/midleware/ProtectedRoute';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { CheckEmail } from '@/pages/CheckEmail';
import { PasswordlessCallback } from '@/pages/PasswordlessCallback';
import { PasswordlessRedirect } from '@/pages/PasswordlessRedirect';
import { GoogleCallback } from '@/pages/GoogleCallback';
import { GoogleOAuthPopup } from '@/pages/GoogleOAuthPopup';
import { CreateBook } from '@/pages/CreateBook';
import { Books } from '@/pages/Books';
import { Analytics } from '@/pages/Analytics';
import { Publish } from '@/pages/Publish';
import { Account } from '@/pages/Account';
import { MySubscriptionPage } from '@/pages/MySubscription';
import { PaymentCallback } from '@/pages/PaymentCallback';
import { DynamicApiDemo } from '@/components/DynamicApiDemo';
import { IntelligentAssistant } from '@/pages/IntelligentAssistant';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import { CheckoutFailure } from '@/pages/CheckoutFailure';
import { CheckoutError } from '@/pages/CheckoutError';
import { PaymentFlowTest } from '@/pages/PaymentFlowTest';
import { OrganizationRoute } from '@/components/OrganizationRoute';
import { DebugPage } from '@/pages/DebugPage';
import { SubscriptionDemo } from '@/pages/SubscriptionDemo';
import { AdCampaignManagement } from '@/pages/AdCampaignManagement';
import OwnerPortal from '@/pages/OwnerPortal';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { useDebouncedSubscription } from '@/redux/hooks/useDebouncedSubscription';
import { BookPrompt } from '@/components/create-book/BookPrompt';
import { AuthDebug } from '@/components/debug/AuthDebug';
import '@/utils/cookieTest';
import CookieManager from '@/utils/cookies';

function AppContent() {
  const { initialize, isInitialized, isLoading, isAuthenticated, syncAuthWithCookies } = useAuth();
  const { cacheValid, plans } = useSubscription();
  const { debouncedFetchAll } = useDebouncedSubscription(2000); // 2 second debounce

  useEffect(() => {
    // Initialize authentication state on app load if not already initialized
    if (!isInitialized) {
      console.log('App: Initializing authentication state');
      initialize();
    }
  }, [initialize, isInitialized]);

  // Sync Redux state with cookies after initialization - only run once
  useEffect(() => {
    if (isInitialized && !isLoading) {
      const authData = CookieManager.getAuthData();
      console.log('App: Checking auth sync - cookies vs Redux state:', {
        hasTokens: !!(authData.accessToken && authData.refreshToken && authData.user),
        isAuthenticated,
        shouldSync: !!(authData.accessToken && authData.refreshToken && authData.user) !== isAuthenticated
      });
      
      // Only sync if there's a mismatch and we haven't synced yet
      if ((authData.accessToken && authData.refreshToken && authData.user) !== isAuthenticated) {
        console.log('App: Syncing Redux state with cookies');
        syncAuthWithCookies();
      }
    }
  }, [isInitialized, isLoading]); // Removed isAuthenticated and syncAuthWithCookies from dependencies

  // Debug logging for auth state
  useEffect(() => {
    console.log('App: Auth state changed:', {
      isInitialized,
      isLoading,
      isAuthenticated
    });
  }, [isInitialized, isLoading, isAuthenticated]);

  useEffect(() => {
    // Initialize subscription data ONLY when user is authenticated and has valid tokens
    if (isInitialized && !isLoading && isAuthenticated) {
      // Check if we have valid tokens before making API calls
      const authData = CookieManager.getAuthData();
      if (authData.accessToken && authData.refreshToken) {
        // Only fetch if cache is invalid or data doesn't exist
        if (!cacheValid || !plans.length) {
          console.log('App: User is authenticated with valid tokens, fetching subscription data');
          // Use debounced fetch to prevent rapid successive calls
          debouncedFetchAll().catch((error) => {
            console.warn('App: Subscription data fetch failed, continuing without it:', error);
          });
        } else {
          console.log('App: Subscription data is cached and valid, skipping fetch');
        }
      } else {
        console.log('App: User is authenticated but no valid tokens found, skipping subscription fetch');
        // Note: Auth state will be cleared by the sync effect above
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, cacheValid, plans.length]); // Remove debouncedFetchAll from dependencies

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AuthDebug />
      <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/passwordless-login" element={<PasswordlessCallback />} />
      <Route path="/auth/passwordless/callback" element={<PasswordlessCallback />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/auth/google/popup" element={<GoogleOAuthPopup />} />
      
      {/* Checkout routes (public but may require auth context) */}
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/failure" element={<CheckoutFailure />} />
      <Route path="/checkout/error" element={<CheckoutError />} />
      
      {/* Redirect route for old port magic links */}
      <Route path="/passwordless-login-redirect" element={<PasswordlessRedirect />} />

      {/* Protected routes with Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="create" element={<CreateBook />} />
        <Route path="books" element={<Books />} />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'marketer']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route path="publish" element={<Publish />} />
        <Route path="account" element={<Account />} />
        <Route path="subscription" element={<MySubscriptionPage />} />
        <Route path="payment-callback" element={<PaymentCallback />} />
        <Route path="api-demo" element={<DynamicApiDemo />} />
        <Route path="intelligent-assistant" element={<IntelligentAssistant />} />
        <Route path="BookPrompt" element={<BookPrompt />} />
        <Route path="ad-campaigns" element={<AdCampaignManagement />} />
        
        {/* Organization Management */}
        <Route 
          path="organization" 
          element={
            <ProtectedRoute>
              <OrganizationRoute />
            </ProtectedRoute>
          } 
        />
        
        {/* Owner Portal */}
        <Route 
          path="owner-portal" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OwnerPortal />
            </ProtectedRoute>
          } 
        />
        
        {/* Debug and Demo Routes (Development Only) */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <>
            <Route path="debug" element={<DebugPage />} />
            <Route path="subscription-demo" element={<SubscriptionDemo />} />
            <Route path="payment-test" element={<PaymentFlowTest />} />
          </>
        )}
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
