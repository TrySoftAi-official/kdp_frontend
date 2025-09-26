import React from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { UserRole } from '@/types';

interface RoleBasedProps {
  allowedRoles: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { canAccess } = useAuth();

  if (canAccess(allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
