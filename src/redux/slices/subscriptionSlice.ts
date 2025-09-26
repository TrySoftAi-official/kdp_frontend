import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getSubscriptionPlans,
  getMySubscription,
  getMySubscriptionStatus,
  getSubscriptionSummary,
  getUsageStatus,
  getBillingHistory,
  getMyFeatures,
  createCheckoutSession,
  changeSubscriptionPlan,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  getBillingPortal,
  syncMySubscription,
  SubscriptionPlan, 
  UserSubscriptionWithPlanResponse,
  SubscriptionStatus,
  UserSubscriptionSummary,
  QuotaStatus,
  CheckoutSessionRequest,
  PlanChangeRequest,
  BillingPortalRequest,
  SubscriptionBilling
} from '../../apis/subscription';
import { getErrorMessage } from '../../apis/apiClient';

// Subscription state interface
interface SubscriptionState {
  // Data
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscriptionWithPlanResponse | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionSummary: UserSubscriptionSummary | null;
  usageStatus: QuotaStatus | null;
  billingHistory: SubscriptionBilling[];
  features: Record<string, boolean>;
  
  // Loading states
  isLoading: boolean;
  isUpgrading: boolean;
  isCancelling: boolean;
  isCreatingCheckout: boolean;
  isSyncing: boolean;
  
  // Error state
  error: string | null;
  
  // Cache
  lastFetched: number | null;
  cacheValid: boolean;
}

// Initial state
const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  subscriptionStatus: null,
  subscriptionSummary: null,
  usageStatus: null,
  billingHistory: [],
  features: {},
  
  isLoading: false,
  isUpgrading: false,
  isCancelling: false,
  isCreatingCheckout: false,
  isSyncing: false,
  
  error: null,
  
  lastFetched: null,
  cacheValid: false,
};

// Cache duration (10 minutes for better performance)
const CACHE_DURATION = 10 * 60 * 1000;

// Helper function to check if cache is valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

// Async thunks
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { subscription: SubscriptionState };
      const { lastFetched, plans } = state.subscription;
      
      // Check if cache is still valid and we have plans
      if (isCacheValid(lastFetched) && plans.length > 0) {
        console.log('📋 [fetchSubscriptionPlans] Cache is valid, returning cached plans');
        return plans;
      }
      
      const fetchedPlans = await getSubscriptionPlans();
      return fetchedPlans;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { subscription: SubscriptionState };
      const { lastFetched, currentSubscription } = state.subscription;
      
      console.log('👤 [fetchCurrentSubscription] Starting fetch, cache valid:', isCacheValid(lastFetched), 'has data:', !!currentSubscription);
      
      // Check if cache is still valid and we have subscription data
      if (isCacheValid(lastFetched) && currentSubscription) {
        console.log('👤 [fetchCurrentSubscription] Cache is valid, returning cached subscription');
        return currentSubscription;
      }
      
      console.log('👤 [fetchCurrentSubscription] Fetching fresh subscription data');
      const subscription = await getMySubscription();
      console.log('👤 [fetchCurrentSubscription] Received subscription data:', subscription);
      return subscription;
    } catch (error: any) {
      console.error('❌ [fetchCurrentSubscription] Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 [fetchSubscriptionStatus] Starting fetch');
      const status = await getMySubscriptionStatus();
      console.log('📊 [fetchSubscriptionStatus] Received status data:', status);
      return status;
    } catch (error: any) {
      console.error('❌ [fetchSubscriptionStatus] Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubscriptionSummary = createAsyncThunk(
  'subscription/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const summary = await getSubscriptionSummary();
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUsageStatus = createAsyncThunk(
  'subscription/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      const usage = await getUsageStatus();
      return usage;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBillingHistory = createAsyncThunk(
  'subscription/fetchBillingHistory',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const history = await getBillingHistory(limit);
      return history;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeatures = createAsyncThunk(
  'subscription/fetchFeatures',
  async (_, { rejectWithValue }) => {
    try {
      const features = await getMyFeatures();
      return features;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCheckoutSessionThunk = createAsyncThunk(
  'subscription/createCheckout',
  async (data: CheckoutSessionRequest, { rejectWithValue }) => {
    try {
      console.log('🔄 [createCheckoutSessionThunk] Starting checkout creation with data:', data);
      const result = await createCheckoutSession(data);
      console.log('✅ [createCheckoutSessionThunk] Checkout creation successful:', result);
      return result;
    } catch (error: any) {
      console.error('❌ [createCheckoutSessionThunk] Checkout creation failed:', error);
      console.error('❌ [createCheckoutSessionThunk] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return rejectWithValue(error.message || 'Failed to create checkout session');
    }
  }
);

export const changeSubscriptionPlanThunk = createAsyncThunk(
  'subscription/changePlan',
  async (data: PlanChangeRequest, { rejectWithValue }) => {
    try {
      const result = await changeSubscriptionPlan(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const upgradeSubscriptionThunk = createAsyncThunk(
  'subscription/upgrade',
  async (data: PlanChangeRequest, { rejectWithValue }) => {
    try {
      const result = await upgradeSubscription(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const downgradeSubscriptionThunk = createAsyncThunk(
  'subscription/downgrade',
  async (data: PlanChangeRequest, { rejectWithValue }) => {
    try {
      const result = await downgradeSubscription(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelSubscriptionThunk = createAsyncThunk(
  'subscription/cancel',
  async (immediately: boolean = false, { rejectWithValue }) => {
    try {
      const result = await cancelSubscription(immediately);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBillingPortalThunk = createAsyncThunk(
  'subscription/getBillingPortal',
  async (data: BillingPortalRequest, { rejectWithValue }) => {
    try {
      const result = await getBillingPortal(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncSubscription = createAsyncThunk(
  'subscription/sync',
  async (_, { rejectWithValue }) => {
    try {
      const result = await syncMySubscription();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllSubscriptionData = createAsyncThunk(
  'subscription/fetchAll',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      const state = getState() as { subscription: SubscriptionState };
      const { lastFetched, plans, currentSubscription, isLoading } = state.subscription;
      
      // Prevent multiple simultaneous calls
      if (isLoading) {
        console.log('📋 [fetchAllSubscriptionData] Already loading, skipping fetch');
        return true;
      }
      
      // Check if cache is still valid
      if (isCacheValid(lastFetched) && plans.length > 0 && currentSubscription) {
        console.log('📋 [fetchAllSubscriptionData] Cache is valid, skipping API calls');
        return true;
      }
      
      console.log('📋 [fetchAllSubscriptionData] Cache invalid or missing data, fetching all subscription data');
      await Promise.all([
        dispatch(fetchSubscriptionPlans()),
        dispatch(fetchCurrentSubscription()),
        dispatch(fetchSubscriptionStatus()),
        dispatch(fetchSubscriptionSummary()),
        dispatch(fetchUsageStatus()),
        dispatch(fetchBillingHistory(10)),
        dispatch(fetchFeatures())
      ]);
      return true;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Subscription slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubscriptionData: (state) => {
      state.currentSubscription = null;
      state.subscriptionStatus = null;
      state.subscriptionSummary = null;
      state.usageStatus = null;
      state.billingHistory = [];
      state.features = {};
      state.lastFetched = null;
      state.cacheValid = false;
    },
    invalidateCache: (state) => {
      state.cacheValid = false;
      state.lastFetched = null;
    },
    updateCacheTimestamp: (state) => {
      state.lastFetched = Date.now();
      state.cacheValid = true;
    },
    refreshSubscriptionData: (state) => {
      // Invalidate cache to force refresh on next fetch
      state.cacheValid = false;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch current subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch subscription status
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptionStatus = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch subscription summary
      .addCase(fetchSubscriptionSummary.fulfilled, (state, action) => {
        state.subscriptionSummary = action.payload;
      })
      
      // Fetch usage status
      .addCase(fetchUsageStatus.fulfilled, (state, action) => {
        state.usageStatus = action.payload;
      })
      
      // Fetch billing history
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.billingHistory = action.payload;
      })
      
      // Fetch features
      .addCase(fetchFeatures.fulfilled, (state, action) => {
        state.features = action.payload;
      })
      
      // Create checkout session
      .addCase(createCheckoutSessionThunk.pending, (state) => {
        state.isCreatingCheckout = true;
        state.error = null;
      })
      .addCase(createCheckoutSessionThunk.fulfilled, (state) => {
        state.isCreatingCheckout = false;
        state.error = null;
      })
      .addCase(createCheckoutSessionThunk.rejected, (state, action) => {
        state.isCreatingCheckout = false;
        state.error = action.payload as string;
      })
      
      // Upgrade subscription
      .addCase(upgradeSubscriptionThunk.pending, (state) => {
        state.isUpgrading = true;
        state.error = null;
      })
      .addCase(upgradeSubscriptionThunk.fulfilled, (state) => {
        state.isUpgrading = false;
        state.error = null;
        // Invalidate cache to force refresh
        state.cacheValid = false;
        state.lastFetched = null;
        console.log('🔄 [upgradeSubscriptionThunk] Cache invalidated after upgrade');
      })
      .addCase(upgradeSubscriptionThunk.rejected, (state, action) => {
        state.isUpgrading = false;
        state.error = action.payload as string;
      })
      
      // Downgrade subscription
      .addCase(downgradeSubscriptionThunk.pending, (state) => {
        state.isUpgrading = true;
        state.error = null;
      })
      .addCase(downgradeSubscriptionThunk.fulfilled, (state) => {
        state.isUpgrading = false;
        state.error = null;
        // Invalidate cache to force refresh
        state.cacheValid = false;
        state.lastFetched = null;
        console.log('🔄 [downgradeSubscriptionThunk] Cache invalidated after downgrade');
      })
      .addCase(downgradeSubscriptionThunk.rejected, (state, action) => {
        state.isUpgrading = false;
        state.error = action.payload as string;
      })
      
      // Cancel subscription
      .addCase(cancelSubscriptionThunk.pending, (state) => {
        state.isCancelling = true;
        state.error = null;
      })
      .addCase(cancelSubscriptionThunk.fulfilled, (state) => {
        state.isCancelling = false;
        state.error = null;
        // Invalidate cache to force refresh
        state.cacheValid = false;
        state.lastFetched = null;
        console.log('🔄 [cancelSubscriptionThunk] Cache invalidated after cancellation');
      })
      .addCase(cancelSubscriptionThunk.rejected, (state, action) => {
        state.isCancelling = false;
        state.error = action.payload as string;
      })
      
      // Get billing portal
      .addCase(getBillingPortalThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Sync subscription
      .addCase(syncSubscription.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncSubscription.fulfilled, (state) => {
        state.isSyncing = false;
        state.error = null;
        // Invalidate cache to force refresh
        state.cacheValid = false;
        state.lastFetched = null;
        console.log('🔄 [syncSubscription] Cache invalidated after sync');
      })
      .addCase(syncSubscription.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      
      // Fetch all data
      .addCase(fetchAllSubscriptionData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptionData.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.lastFetched = Date.now();
        state.cacheValid = true;
      })
      .addCase(fetchAllSubscriptionData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearSubscriptionData, 
  invalidateCache, 
  updateCacheTimestamp,
  refreshSubscriptionData
} = subscriptionSlice.actions;

// Selectors
export const selectSubscriptionState = (state: { subscription: SubscriptionState }) => state.subscription;
export const selectCurrentPlan = (state: { subscription: SubscriptionState }) => {
  const subscription = state.subscription.currentSubscription;
  return subscription?.plan?.plan_id || 'free';
};
export const selectIsEnterpriseUser = (state: { subscription: SubscriptionState }) => {
  const plan = selectCurrentPlan(state);
  return plan === 'enterprise';
};
export const selectCacheValid = (state: { subscription: SubscriptionState }) => {
  return isCacheValid(state.subscription.lastFetched);
};

export default subscriptionSlice.reducer;