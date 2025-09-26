import React from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import CookieManager from '@/utils/cookies';
import { testCookieFunctionality } from '@/utils/cookieTest';

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized, user, syncAuthWithCookies } = useAuth();
  
  const authData = CookieManager.getAuthData();
  
  return (

    <>
    {/* <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Redux State:</div>
        <div>• isAuthenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>• isLoading: {isLoading ? '⏳' : '✅'}</div>
        <div>• isInitialized: {isInitialized ? '✅' : '❌'}</div>
        <div>• hasUser: {user ? '✅' : '❌'}</div>
        <div>• userRole: {user?.role || 'none'}</div>
        
        <div className="mt-2">Cookie State:</div>
        <div>• hasAccessToken: {authData.accessToken ? '✅' : '❌'}</div>
        <div>• hasRefreshToken: {authData.refreshToken ? '✅' : '❌'}</div>
        <div>• hasUser: {authData.user ? '✅' : '❌'}</div>
        <div>• isAuthenticated: {authData.isAuthenticated ? '✅' : '❌'}</div>
        
        <div className="mt-2">Token Preview:</div>
        <div>• Access: {authData.accessToken ? authData.accessToken.substring(0, 20) + '...' : 'none'}</div>
        <div>• Refresh: {authData.refreshToken ? authData.refreshToken.substring(0, 20) + '...' : 'none'}</div>
        
        <div className="mt-2 space-x-1">
          <button 
            onClick={testCookieFunctionality}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Test Cookies
          </button>
          <button 
            onClick={syncAuthWithCookies}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Sync Redux
          </button>
        </div>
      </div>
    </div> */}
    </>
  );
};
