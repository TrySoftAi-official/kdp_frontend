import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  fetchSubscriptionPlans,
  fetchCurrentSubscription,
  fetchSubscriptionStatus,
  fetchSubscriptionSummary,
  fetchUsageStatus,
  fetchBillingHistory,
  fetchFeatures,
  createCheckoutSessionThunk,
  changeSubscriptionPlanThunk,
  upgradeSubscriptionThunk,
  downgradeSubscriptionThunk,
  cancelSubscriptionThunk,
  getBillingPortalThunk,
  syncSubscription,
  fetchAllSubscriptionData,
  clearError,
  clearSubscriptionData,
  invalidateCache,
  updateCacheTimestamp,
  refreshSubscriptionData,
  selectCurrentPlan,
  selectIsEnterpriseUser,
  selectCacheValid
} from '../slices/subscriptionSlice';

export const useSubscription = () => {
  const dispatch = useAppDispatch();
  const subscriptionState = useAppSelector((state) => state.subscription);

  // Fetch actions
  const fetchPlans = async (includeInactive = false) => {
    return dispatch(fetchSubscriptionPlans(includeInactive));
  };

  const fetchCurrent = async () => {
    return dispatch(fetchCurrentSubscription());
  };

  const fetchStatus = async () => {
    return dispatch(fetchSubscriptionStatus());
  };

  const fetchSummary = async () => {
    return dispatch(fetchSubscriptionSummary());
  };

  const fetchUsage = async () => {
    return dispatch(fetchUsageStatus());
  };

  const fetchBilling = async (limit = 10) => {
    return dispatch(fetchBillingHistory(limit));
  };

  const fetchUserFeatures = async () => {
    return dispatch(fetchFeatures());
  };

  const fetchAll = async () => {
    return dispatch(fetchAllSubscriptionData());
  };

  // Subscription actions
  const createCheckout = async (data: any) => {
    return dispatch(createCheckoutSessionThunk(data));
  };

  const changePlan = async (data: any) => {
    return dispatch(changeSubscriptionPlanThunk(data));
  };

  const upgrade = async (data: any) => {
    return dispatch(upgradeSubscriptionThunk(data));
  };

  const downgrade = async (data: any) => {
    return dispatch(downgradeSubscriptionThunk(data));
  };

  const cancel = async (immediately = false) => {
    return dispatch(cancelSubscriptionThunk(immediately));
  };

  const getBilling = async (data: any) => {
    return dispatch(getBillingPortalThunk(data));
  };

  const sync = async () => {
    return dispatch(syncSubscription());
  };

  // Utility actions
  const clearSubscriptionError = () => {
    dispatch(clearError());
  };

  const clearData = () => {
    dispatch(clearSubscriptionData());
  };

  const invalidate = () => {
    dispatch(invalidateCache());
  };

  const updateCache = () => {
    dispatch(updateCacheTimestamp());
  };

  const refreshData = () => {
    dispatch(refreshSubscriptionData());
  };

  // Selectors
  const currentPlan = useAppSelector(selectCurrentPlan);
  const isEnterpriseUser = useAppSelector(selectIsEnterpriseUser);
  const cacheValid = useAppSelector(selectCacheValid);

  return {
    // State
    plans: subscriptionState.plans,
    currentSubscription: subscriptionState.currentSubscription,
    subscriptionStatus: subscriptionState.subscriptionStatus,
    subscriptionSummary: subscriptionState.subscriptionSummary,
    usageStatus: subscriptionState.usageStatus,
    billingHistory: subscriptionState.billingHistory,
    features: subscriptionState.features,
    
    // Loading states
    isLoading: subscriptionState.isLoading,
    isUpgrading: subscriptionState.isUpgrading,
    isCancelling: subscriptionState.isCancelling,
    isCreatingCheckout: subscriptionState.isCreatingCheckout,
    isSyncing: subscriptionState.isSyncing,
    
    // Error state
    error: subscriptionState.error,
    
    // Cache
    lastFetched: subscriptionState.lastFetched,
    cacheValid,
    
    // Computed values
    currentPlan,
    isEnterpriseUser,
    
    // Actions
    fetchPlans,
    fetchCurrent,
    fetchStatus,
    fetchSummary,
    fetchUsage,
    fetchBilling,
    fetchUserFeatures,
    fetchAll,
    createCheckout,
    changePlan,
    upgrade,
    downgrade,
    cancel,
    getBilling,
    sync,
    clearSubscriptionError,
    clearData,
    invalidate,
    updateCache,
    refreshData,
  };
};
