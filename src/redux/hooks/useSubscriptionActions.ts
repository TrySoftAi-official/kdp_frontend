import { useCallback } from 'react';
import { useSubscription } from './useSubscription';

/**
 * Custom hook for subscription actions that automatically refresh data after changes
 */
export const useSubscriptionActions = () => {
  const { 
    createCheckout, 
    upgrade, 
    downgrade, 
    cancel, 
    sync, 
    refreshData,
    fetchAll 
  } = useSubscription();

  // Enhanced actions that refresh data after completion
  const createCheckoutWithRefresh = useCallback(async (data: any) => {
    try {
      const result = await createCheckout(data);
      // Refresh data after successful checkout creation
      refreshData();
      return result;
    } catch (error) {
      throw error;
    }
  }, [createCheckout, refreshData]);

  const upgradeWithRefresh = useCallback(async (data: any) => {
    try {
      const result = await upgrade(data);
      // Refresh data after successful upgrade
      refreshData();
      // Fetch fresh data
      await fetchAll();
      return result;
    } catch (error) {
      throw error;
    }
  }, [upgrade, refreshData, fetchAll]);

  const downgradeWithRefresh = useCallback(async (data: any) => {
    try {
      const result = await downgrade(data);
      // Refresh data after successful downgrade
      refreshData();
      // Fetch fresh data
      await fetchAll();
      return result;
    } catch (error) {
      throw error;
    }
  }, [downgrade, refreshData, fetchAll]);

  const cancelWithRefresh = useCallback(async (immediately = false) => {
    try {
      const result = await cancel(immediately);
      // Refresh data after successful cancellation
      refreshData();
      // Fetch fresh data
      await fetchAll();
      return result;
    } catch (error) {
      throw error;
    }
  }, [cancel, refreshData, fetchAll]);

  const syncWithRefresh = useCallback(async () => {
    try {
      const result = await sync();
      // Refresh data after successful sync
      refreshData();
      // Fetch fresh data
      await fetchAll();
      return result;
    } catch (error) {
      throw error;
    }
  }, [sync, refreshData, fetchAll]);

  return {
    createCheckout: createCheckoutWithRefresh,
    upgrade: upgradeWithRefresh,
    downgrade: downgradeWithRefresh,
    cancel: cancelWithRefresh,
    sync: syncWithRefresh,
    refreshData,
  };
};
