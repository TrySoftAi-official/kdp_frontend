import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { CreateBook } from '@/pages/CreateBook';
import { Books } from '@/pages/Books';
import { Analytics } from '@/pages/Analytics';
import { Publish } from '@/pages/Publish';
import { Account } from '@/pages/Account';

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

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
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
