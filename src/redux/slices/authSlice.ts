import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  login as loginApi, 
  register as registerApi, 
  refreshToken as refreshTokenApi, 
  logout as logoutApi, 
  getCurrentUser as getCurrentUserApi,
  passwordlessLogin as passwordlessLoginApi,
  passwordlessVerify as passwordlessVerifyApi,
  getGoogleAuthUrl as getGoogleAuthUrlApi,
  LoginRequest as LoginCredentials,
  RegisterRequest as RegisterData,
  UserResponse
} from '../../apis/auth';
import { getErrorMessage } from '../../apis/apiClient';
import CookieManager from '../../utils/cookies';

// Auth state interface
interface AuthState {
  user: UserResponse | null;
  tokens: {
    access_token: string | null;
    refresh_token: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Initial state - check for existing cookies
const getInitialState = (): AuthState => {
  const authData = CookieManager.getAuthData();
  return {
    user: authData.user,
    tokens: {
      access_token: authData.accessToken,
      refresh_token: authData.refreshToken,
    },
    isAuthenticated: authData.isAuthenticated,
    isLoading: false,
    error: null,
    isInitialized: false, // Will be set to true after initialization
  };
};

const initialState: AuthState = getInitialState();

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
      
      // Store tokens and user data using universal cookies
      CookieManager.setAuthData({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const data = await registerApi(userData);
      
      // Store tokens and user data using universal cookies
      CookieManager.setAuthData({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const data = await refreshTokenApi({
        refresh_token: refreshTokenValue,
      });
      
      localStorage.setItem('access_token', data.access_token);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      
      // Clear stored data using universal cookies
      CookieManager.clearAuthData();
      
      return null;
    } catch (error: any) {
      // Even if logout fails on server, clear local data
      CookieManager.clearAuthData();
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCurrentUserApi();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const authData = CookieManager.getAuthData();
      
      if (authData.accessToken && authData.refreshToken && authData.user) {
        // Verify token is still valid by fetching current user
        const userData = await getCurrentUserApi();
        return {
          user: userData,
          tokens: {
            access_token: authData.accessToken,
            refresh_token: authData.refreshToken,
          },
        };
      }
      
      return null;
    } catch (error: any) {
      // Token is invalid, clear stored data
      CookieManager.clearAuthData();
      return rejectWithValue(error.message);
    }
  }
);

// Passwordless login thunks
export const requestMagicLink = createAsyncThunk(
  'auth/requestMagicLink',
  async (email: string, { rejectWithValue }) => {
    try {
      const data = await passwordlessLoginApi({ email });
      return data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyMagicLink = createAsyncThunk(
  'auth/verifyMagicLink',
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await passwordlessVerifyApi({ token });
      
      // Store tokens and user data using universal cookies
      CookieManager.setAuthData({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
      
      return data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // For now, let's use a simple redirect approach
      // The user will need to register the redirect URI in Google Cloud Console
      const data = await getGoogleAuthUrlApi();
      
      // Redirect to Google OAuth URL
      window.location.href = data.auth_url;
      
      return data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Force refresh auth state from cookies
export const forceRefreshAuthState = createAsyncThunk(
  'auth/forceRefresh',
  async (_, { rejectWithValue }) => {
    try {
      const authData = CookieManager.getAuthData();
      
      if (authData.accessToken && authData.refreshToken && authData.user) {
        // Verify token is still valid by fetching current user
        const userData = await getCurrentUserApi();
        return {
          user: userData,
          tokens: {
            access_token: authData.accessToken,
            refresh_token: authData.refreshToken,
          },
        };
      }
      
      return null;
    } catch (error: any) {
      // Token is invalid, clear stored data
      CookieManager.clearAuthData();
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = { access_token: null, refresh_token: null };
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<UserResponse>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    completeGoogleAuth: (state, action: PayloadAction<{ user: UserResponse; tokens: { access_token: string; refresh_token: string }; isAuthenticated: boolean }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = {
          access_token: action.payload.access_token,
          refresh_token: action.payload.refresh_token,
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = {
          access_token: action.payload.access_token,
          refresh_token: action.payload.refresh_token,
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens.access_token = action.payload.access_token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
      })
      
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        } else {
          // If no payload, check if we have valid cookies and set state accordingly
          const authData = CookieManager.getAuthData();
          if (authData.accessToken && authData.refreshToken && authData.user) {
            state.user = authData.user;
            state.tokens = {
              access_token: authData.accessToken,
              refresh_token: authData.refreshToken,
            };
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
            state.user = null;
            state.tokens = { access_token: null, refresh_token: null };
          }
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
      })
      
      // Request Magic Link
      .addCase(requestMagicLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestMagicLink.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestMagicLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Verify Magic Link
      .addCase(verifyMagicLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMagicLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = {
          access_token: action.payload.access_token,
          refresh_token: action.payload.refresh_token,
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyMagicLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
      })
      
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Force refresh auth state
      .addCase(forceRefreshAuthState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forceRefreshAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = {
            access_token: action.payload.tokens.access_token,
            refresh_token: action.payload.tokens.refresh_token,
          };
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.tokens = { access_token: null, refresh_token: null };
        }
        state.error = null;
      })
      .addCase(forceRefreshAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access_token: null, refresh_token: null };
      })
      
      // Sync with cookies
      .addCase('auth/syncWithCookies', (state, action: any) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
      });
  },
});

export const { clearError, clearAuth, updateUser } = authSlice.actions;

// Action to force sync Redux state with cookies
export const syncWithCookies = () => (dispatch: any, getState: any) => {
  const authData = CookieManager.getAuthData();
  const currentState = getState().auth;
  
  console.log('🔍 [syncWithCookies] Auth data from cookies:', {
    hasAccessToken: !!authData.accessToken,
    hasRefreshToken: !!authData.refreshToken,
    hasUser: !!authData.user,
    isAuthenticated: authData.isAuthenticated
  });
  
  // Check if we need to sync (prevent unnecessary dispatches)
  const needsSync = (
    (authData.accessToken && authData.refreshToken && authData.user) !== currentState.isAuthenticated ||
    (authData.accessToken && authData.refreshToken && authData.user && 
     (!currentState.user || !currentState.tokens.access_token))
  );
  
  if (!needsSync) {
    console.log('🔄 [syncWithCookies] No sync needed, state is already consistent');
    return;
  }
  
  if (authData.accessToken && authData.refreshToken && authData.user) {
    console.log('✅ [syncWithCookies] Valid tokens found, syncing Redux state');
    dispatch({
      type: 'auth/syncWithCookies',
      payload: {
        user: authData.user,
        tokens: {
          access_token: authData.accessToken,
          refresh_token: authData.refreshToken,
        },
        isAuthenticated: true,
      }
    });
  } else {
    console.log('❌ [syncWithCookies] No valid tokens found, clearing auth state');
    dispatch({
      type: 'auth/syncWithCookies',
      payload: {
        user: null,
        tokens: {
          access_token: null,
          refresh_token: null,
        },
        isAuthenticated: false,
      }
    });
  }
};
export default authSlice.reducer;