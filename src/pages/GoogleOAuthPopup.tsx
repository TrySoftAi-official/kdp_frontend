import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/useAuth';
import CookieManager from '@/utils/cookies';

export const GoogleOAuthPopup: React.FC = () => {
  const navigate = useNavigate();
  const { completeGoogleAuth } = useAuth();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { access_token, refresh_token, user } = event.data;
        
        // Store tokens and user data using universal cookies
        CookieManager.setAuthData({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: user,
        });
        
        // Complete Google auth in Redux
        completeGoogleAuth({
          access_token,
          refresh_token,
          user
        });
        
        // Close popup and navigate to dashboard
        window.close();
        navigate('/dashboard', { replace: true });
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        console.error('Google OAuth error:', event.data.error);
        window.close();
        navigate('/login?error=google_oauth_failed', { replace: true });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, completeGoogleAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Completing Google Sign In</h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>
    </div>
  );
};