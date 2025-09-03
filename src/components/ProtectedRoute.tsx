import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, canAccess } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (allowedRoles && !canAccess(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
