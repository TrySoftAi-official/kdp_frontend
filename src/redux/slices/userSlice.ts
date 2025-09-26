import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserPreferences,
  updateUserPreferences,
  getUserActivity,
  User, 
  UserUpdate, 
  PasswordUpdate,
  UserPreferences, 
  UserActivity
} from '../../apis/user';

// User state interface
interface UserState {
  profile: User | null;
  preferences: UserPreferences | null;
  activity: UserActivity[];
  activityTotal: number;
  activityPage: number;
  activityLimit: number;
  
  isLoading: boolean;
  isUpdating: boolean;
  isChangingPassword: boolean;
  isDeleting: boolean;
  
  error: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  preferences: null,
  activity: [],
  activityTotal: 0,
  activityPage: 1,
  activityLimit: 10,
  
  isLoading: false,
  isUpdating: false,
  isChangingPassword: false,
  isDeleting: false,
  
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (data: UserUpdate, { rejectWithValue }) => {
    try {
      const result = await updateUserProfile(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'user/changePassword',
  async (data: PasswordUpdate, { rejectWithValue }) => {
    try {
      const result = await changePassword(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserAccountThunk = createAsyncThunk(
  'user/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const result = await deleteUserAccount();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserPreferences();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferencesThunk = createAsyncThunk(
  'user/updatePreferences',
  async (data: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const result = await updateUserPreferences(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'user/fetchActivity',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const data = await getUserActivity(page, limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.preferences = null;
      state.activity = [];
      state.activityTotal = 0;
      state.activityPage = 1;
    },
    updateProfileLocal: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update profile
      .addCase(updateUserProfileThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfileThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Change password
      .addCase(changePasswordThunk.pending, (state) => {
        state.isChangingPassword = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isChangingPassword = false;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.error = action.payload as string;
      })
      
      // Delete account
      .addCase(deleteUserAccountThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUserAccountThunk.fulfilled, (state) => {
        state.isDeleting = false;
        state.profile = null;
        state.preferences = null;
        state.activity = [];
        state.error = null;
      })
      .addCase(deleteUserAccountThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      
      // Fetch preferences
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      
      // Update preferences
      .addCase(updateUserPreferencesThunk.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      
      // Fetch activity
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.activity = action.payload.activities;
        state.activityTotal = action.payload.total;
        state.activityPage = action.payload.page;
        state.activityLimit = action.payload.limit;
      });
  },
});

export const { clearError, clearUserData, updateProfileLocal } = userSlice.actions;

// Selectors
export const selectUserState = (state: { user: UserState }) => state.user;
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserPreferences = (state: { user: UserState }) => state.user.preferences;
export const selectUserActivity = (state: { user: UserState }) => state.user.activity;

export default userSlice.reducer;
