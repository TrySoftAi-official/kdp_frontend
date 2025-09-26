import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { OrganizationManagement } from '@/pages/OrganizationManagement';

export const OrganizationRoute: React.FC = () => {
  const { user } = useAuth();
  const { isEnterpriseUser, currentPlan } = useSubscription();

  // Debug logging
  console.log('🔍 OrganizationRoute Debug:', {
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    currentPlan,
    isEnterpriseUser,
    hasAdminRole: user && ['admin', 'owner'].includes(user.role)
  });

  // Allow access if user has admin/owner role OR if they have Enterprise subscription
  const hasAccess = user && (
    ['admin', 'owner'].includes(user.role) || 
    isEnterpriseUser ||
    currentPlan === 'enterprise' // Fallback check
  );

  if (!hasAccess) {
    console.log('🚫 OrganizationRoute: Access denied');
    return <Navigate to="/" replace />;
  }

  console.log('✅ OrganizationRoute: Access granted');
  return <OrganizationManagement />;
};
