import { useAuth } from '@/redux/hooks/useAuth';
import { ROLE_PERMISSIONS, SUBSCRIPTION_PLANS } from '@/utils/constants';

export const usePermissions = () => {
  const { user } = useAuth();

  const canAccessFeature = (feature: keyof typeof ROLE_PERMISSIONS.admin) => {
    if (!user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) return false;
    
    return rolePermissions[feature];
  };

  const canCreateBooks = () => canAccessFeature('canCreateBooks');
  const canAccessAnalytics = () => canAccessFeature('canAccessAnalytics');
  const canManageUsers = () => canAccessFeature('canManageUsers');
  const canAccessAllFeatures = () => canAccessFeature('canAccessAllFeatures');

  const getCurrentPlan = () => {
    if (!user) return 'free';
    return user.subscription?.plan || 'free';
  };

  const getPlanLimits = () => {
    const currentPlan = getCurrentPlan();
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan);
    return plan?.limits || SUBSCRIPTION_PLANS[0].limits;
  };

  const canCreateMoreBooks = (currentBookCount: number) => {
    const limits = getPlanLimits();
    if (limits.booksPerMonth === -1) return true; // unlimited
    return currentBookCount < limits.booksPerMonth;
  };

  const getRequiredPlanForFeature = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'create books':
      case 'book creation':
        return 'basic';
      case 'analytics':
      case 'performance metrics':
        return 'basic';
      case 'advanced features':
      case 'all features':
        return 'pro';
      case 'user management':
      case 'admin features':
        return 'pro';
      default:
        return 'basic';
    }
  };

  const needsUpgrade = (feature: string) => {
    const currentPlan = getCurrentPlan();
    const requiredPlan = getRequiredPlanForFeature(feature);
    
    const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const requiredIndex = planHierarchy.indexOf(requiredPlan);
    
    return currentIndex < requiredIndex;
  };

  return {
    user,
    canCreateBooks,
    canAccessAnalytics,
    canManageUsers,
    canAccessAllFeatures,
    getCurrentPlan,
    getPlanLimits,
    canCreateMoreBooks,
    getRequiredPlanForFeature,
    needsUpgrade,
    isGuest: user?.role === 'guest',
    isAdmin: user?.role === 'admin',
    isMarketer: user?.role === 'marketer',
    isAssistant: user?.role === 'assistant'
  };
};
