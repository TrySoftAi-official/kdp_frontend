
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
import { DynamicApiDemo } from '@/components/DynamicApiDemo';
import IntelligentAssistantPage from '@/pages/IntelligentAssistant';
import { useAuth } from '@/hooks/useAuth';

function AppContent() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize authentication state on app load
    initializeAuth();
  }, [initializeAuth]);

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
        <Route path="api-demo" element={<DynamicApiDemo />} />
        <Route path="intelligent-assistant" element={<IntelligentAssistantPage />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
