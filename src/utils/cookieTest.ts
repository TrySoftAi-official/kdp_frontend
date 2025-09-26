import CookieManager from './cookies';

// Test cookie functionality
export const testCookieFunctionality = () => {
  console.log('🧪 Testing cookie functionality...');
  
  // Test setting and getting access token
  const testToken = 'test-access-token-123';
  CookieManager.setAccessToken(testToken);
  const retrievedToken = CookieManager.getAccessToken();
  
  console.log('Access Token Test:', {
    set: testToken,
    retrieved: retrievedToken,
    match: testToken === retrievedToken
  });
  
  // Test setting and getting user data
  const testUser = { id: 1, email: 'test@example.com', name: 'Test User' };
  CookieManager.setUserData(testUser);
  const retrievedUser = CookieManager.getUserData();
  
  console.log('User Data Test:', {
    set: testUser,
    retrieved: retrievedUser,
    match: JSON.stringify(testUser) === JSON.stringify(retrievedUser)
  });
  
  // Test setting and getting auth state
  CookieManager.setAuthState(true);
  const retrievedAuthState = CookieManager.getAuthState();
  
  console.log('Auth State Test:', {
    set: true,
    retrieved: retrievedAuthState,
    match: true === retrievedAuthState
  });
  
  // Test complete auth data
  const completeAuthData = {
    accessToken: 'complete-access-token',
    refreshToken: 'complete-refresh-token',
    user: { id: 2, email: 'complete@example.com', name: 'Complete User' }
  };
  
  CookieManager.setAuthData(completeAuthData);
  const retrievedCompleteData = CookieManager.getAuthData();
  
  console.log('Complete Auth Data Test:', {
    set: completeAuthData,
    retrieved: retrievedCompleteData,
    isAuthenticated: retrievedCompleteData.isAuthenticated
  });
  
  // Test authentication check
  const isAuth = CookieManager.isAuthenticated();
  console.log('Authentication Check:', isAuth);
  
  // Clear all data
  CookieManager.clearAuthData();
  const afterClear = CookieManager.getAuthData();
  console.log('After Clear:', afterClear);
  
  console.log('✅ Cookie functionality test completed');
};

// Export for use in console
(window as any).testCookieFunctionality = testCookieFunctionality;
