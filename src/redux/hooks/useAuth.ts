import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  initializeAuth,
  requestMagicLink,
  verifyMagicLink,
  loginWithGoogle,
  forceRefreshAuthState,
  syncWithCookies,
  clearError,
  clearAuth,
  updateUser
} from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    return dispatch(loginUser(credentials));
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    full_name: string; 
    organization_name?: string; 
  }) => {
    return dispatch(registerUser(userData));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const fetchCurrentUser = async () => {
    return dispatch(getCurrentUser());
  };

  const initialize = async () => {
    return dispatch(initializeAuth());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearAuthData = () => {
    dispatch(clearAuth());
  };

  const updateUserProfile = (updates: any) => {
    dispatch(updateUser(updates));
  };

  const requestMagicLinkAuth = async (email: string) => {
    return dispatch(requestMagicLink(email));
  };

  const verifyMagicLinkAuth = async (token: string) => {
    return dispatch(verifyMagicLink(token));
  };

  const loginWithGoogleAuth = async () => {
    return dispatch(loginWithGoogle());
  };

  const completeGoogleAuth = async (tokens: { access_token: string; refresh_token: string; user: any }) => {
    // Update Redux state
    dispatch({
      type: 'auth/completeGoogleAuth',
      payload: {
        user: tokens.user,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        },
        isAuthenticated: true,
      }
    });
  };

  const forceRefresh = async () => {
    return dispatch(forceRefreshAuthState());
  };

  const syncAuthWithCookies = () => {
    dispatch(syncWithCookies());
  };

  return {
    // State
    user: authState.user,
    tokens: authState.tokens,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    isInitialized: authState.isInitialized,
    
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    initialize,
    clearAuthError,
    clearAuthData,
    updateUserProfile,
    requestMagicLink: requestMagicLinkAuth,
    verifyMagicLink: verifyMagicLinkAuth,
    loginWithGoogle: loginWithGoogleAuth,
    completeGoogleAuth,
    forceRefresh,
    syncAuthWithCookies,
  };
};
