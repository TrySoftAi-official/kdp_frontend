import React, { useState, useEffect, ReactNode } from 'react';
import { useEnhancedSubscription } from '@/hooks/useEnhancedSubscription';
import { useAuth } from '@/redux/hooks/useAuth';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  plan?: 'free' | 'basic' | 'pro' | 'premium';
  role?: string | string[];
  usageType?: string;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

interface SubscriptionStatus {
  has_subscription: boolean;
  plan_type: string;
  status?: string;
  restrictions: string[];
  can_generate_books: boolean;
  can_upload_books: boolean;
  can_view_analytics: boolean;
  can_manage_organization: boolean;
  can_manage_sub_users: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  plan,
  role,
  usageType,
  fallback,
  showUpgradePrompt = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { 
    getSubscriptionStatus, 
    checkPermission, 
    checkUsageLimit,
    isLoading,
    error 
  } = useEnhancedSubscription();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canUseFeature, setCanUseFeature] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [permission, plan, role, usageType]);

  const checkAccess = async () => {
    try {
      setIsChecking(true);
      
      // Get subscription status
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
      
      let permissionCheck = true;
      let usageCheck = true;
      
      // Check permission if specified
      if (permission) {
        try {
          const permResult = await checkPermission(permission);
          permissionCheck = permResult.has_permission;
          setHasPermission(permissionCheck);
        } catch (err) {
          console.error('Permission check failed:', err);
          permissionCheck = false;
          setHasPermission(false);
        }
      }
      
      // Check plan requirement if specified
      if (plan && status) {
        const planHierarchy = { free: 0, basic: 1, pro: 2, premium: 3 };
        const userPlanLevel = planHierarchy[status.plan_type as keyof typeof planHierarchy] || 0;
        const requiredPlanLevel = planHierarchy[plan];
        
        if (userPlanLevel < requiredPlanLevel) {
          permissionCheck = false;
        }
      }
      
      // Check role requirement if specified
      if (role && user) {
        const allowedRoles = Array.isArray(role) ? role : [role];
        if (!allowedRoles.includes(user.role)) {
          permissionCheck = false;
        }
      }
      
      // Check usage limit if specified
      if (usageType) {
        try {
          const usageResult = await checkUsageLimit(usageType, false);
          usageCheck = usageResult.can_use;
          setCanUseFeature(usageCheck);
        } catch (err) {
          console.error('Usage check failed:', err);
          usageCheck = false;
          setCanUseFeature(false);
        }
      }
      
    } catch (err) {
      console.error('Access check failed:', err);
      setHasPermission(false);
      setCanUseFeature(false);
    } finally {
      setIsChecking(false);
    }
  };

  const hasAccess = () => {
    if (isChecking) return null;
    
    let access = true;
    
    if (permission && hasPermission !== null) {
      access = access && hasPermission;
    }
    
    if (plan && subscriptionStatus) {
      const planHierarchy = { free: 0, basic: 1, pro: 2, premium: 3 };
      const userPlanLevel = planHierarchy[subscriptionStatus.plan_type as keyof typeof planHierarchy] || 0;
      const requiredPlanLevel = planHierarchy[plan];
      access = access && (userPlanLevel >= requiredPlanLevel);
    }
    
    if (role && user) {
      const allowedRoles = Array.isArray(role) ? role : [role];
      access = access && allowedRoles.includes(user.role);
    }
    
    if (usageType && canUseFeature !== null) {
      access = access && canUseFeature;
    }
    
    return access;
  };

  const getUpgradeMessage = () => {
    if (!subscriptionStatus) return 'Upgrade required';
    
    if (plan) {
      const planNames = {
        free: 'Free',
        basic: 'Basic',
        pro: 'Pro',
        premium: 'Premium'
      };
      return `${planNames[plan]} plan required`;
    }
    
    if (permission) {
      const permissionMessages = {
        'books.create': 'Pro plan required for book generation',
        'books.upload': 'Pro plan required for book upload',
        'analytics.view': 'Pro plan required for analytics',
        'organization.create': 'Premium plan required for organization creation',
        'users.manage': 'Premium plan required for user management',
        'api.access': 'Pro plan required for API access'
      };
      return permissionMessages[permission as keyof typeof permissionMessages] || 'Upgrade required';
    }
    
    return 'Upgrade required';
  };

  const getUsageMessage = () => {
    if (!usageType) return 'Usage limit exceeded';
    
    const usageMessages = {
      'books_created': 'Book creation limit reached',
      'api_calls': 'API call limit reached',
      'storage': 'Storage limit reached'
    };
    
    return usageMessages[usageType as keyof typeof usageMessages] || 'Usage limit exceeded';
  };

  if (isChecking) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const access = hasAccess();
  
  if (access === false) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showUpgradePrompt) {
      return (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {usageType ? getUsageMessage() : getUpgradeMessage()}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                {usageType ? (
                  <p>You've reached your usage limit for this feature. Upgrade your plan for higher limits.</p>
                ) : (
                  <p>This feature requires a higher subscription plan. Upgrade now to unlock this functionality.</p>
                )}
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={() => window.location.href = '/account?tab=plans'}
                    className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const BookCreationGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="books.create" 
    plan="pro" 
    usageType="books_created"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const BookUploadGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="books.upload" 
    plan="pro"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const AnalyticsGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="analytics.view" 
    plan="pro"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const OrganizationGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="organization.create" 
    plan="premium"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const SubUserManagementGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="users.manage" 
    plan="premium"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const APIAccessGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permission="api.access" 
    plan="pro"
    usageType="api_calls"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const AdminGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    role="admin"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const OwnerGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    role="owner"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const AssistantGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    role={['assistant', 'owner', 'admin']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const MarketerGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    role={['marketer', 'owner', 'admin']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);
