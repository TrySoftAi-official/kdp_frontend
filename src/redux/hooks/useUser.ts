import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  fetchUserProfile,
  updateUserProfileThunk,
  changePasswordThunk,
  deleteUserAccountThunk,
  fetchUserPreferences,
  updateUserPreferencesThunk,
  fetchUserActivity,
  clearError,
  clearUserData,
  updateProfileLocal
} from '../slices/userSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);

  // Profile actions
  const fetchProfile = async () => {
    return dispatch(fetchUserProfile());
  };

  const updateProfile = async (data: any) => {
    return dispatch(updateUserProfileThunk(data));
  };

  const changeUserPassword = async (data: any) => {
    return dispatch(changePasswordThunk(data));
  };

  const deleteAccount = async () => {
    return dispatch(deleteUserAccountThunk());
  };

  // Preferences actions
  const fetchPreferences = async () => {
    return dispatch(fetchUserPreferences());
  };

  const updatePreferences = async (data: any) => {
    return dispatch(updateUserPreferencesThunk(data));
  };

  // Activity actions
  const fetchActivity = async (page = 1, limit = 10) => {
    return dispatch(fetchUserActivity({ page, limit }));
  };

  // Utility actions
  const clearUserError = () => {
    dispatch(clearError());
  };

  const clearData = () => {
    dispatch(clearUserData());
  };

  const updateProfileLocally = (updates: any) => {
    dispatch(updateProfileLocal(updates));
  };

  return {
    // State
    profile: userState.profile,
    preferences: userState.preferences,
    activity: userState.activity,
    activityTotal: userState.activityTotal,
    activityPage: userState.activityPage,
    activityLimit: userState.activityLimit,
    
    // Loading states
    isLoading: userState.isLoading,
    isUpdating: userState.isUpdating,
    isChangingPassword: userState.isChangingPassword,
    isDeleting: userState.isDeleting,
    
    // Error state
    error: userState.error,
    
    // Actions
    fetchProfile,
    updateProfile,
    changeUserPassword,
    deleteAccount,
    fetchPreferences,
    updatePreferences,
    fetchActivity,
    clearUserError,
    clearData,
    updateProfileLocally,
  };
};
