
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { CheckEmail } from '@/pages/CheckEmail';
import { PasswordlessCallback } from '@/pages/PasswordlessCallback';
import { PasswordlessRedirect } from '@/pages/PasswordlessRedirect';
import { GoogleCallback } from '@/pages/GoogleCallback';
import { CreateBook } from '@/pages/CreateBook';
import { Books } from '@/pages/Books';
import { Analytics } from '@/pages/Analytics';
import { Publish } from '@/pages/Publish';
import { Account } from '@/pages/Account';
import { MySubscriptionPage } from '@/pages/MySubscription';
import { PaymentCallback } from '@/pages/PaymentCallback';
import { DynamicApiDemo } from '@/components/DynamicApiDemo';
import { IntelligentAssistant } from '@/pages/IntelligentAssistant';
import { useAuth } from '@/hooks/useAuth';
import { BookPrompt } from './components/create-book/BookPrompt';

function AppContent() {
  const { initializeAuth, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    // Initialize authentication state on app load if not already initialized
    if (!isInitialized) {
      console.log('App: Initializing authentication state');
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/passwordless-login" element={<PasswordlessCallback />} />
      <Route path="/auth/passwordless/callback" element={<PasswordlessCallback />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      
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
        <Route path="BookPrompt" element={<BookPrompt onGenerateBook={() => {}} />} />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
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
