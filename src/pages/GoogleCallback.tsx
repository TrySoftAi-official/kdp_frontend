import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/useAuth';
import CookieManager from '@/utils/cookies';
import { Loader2 } from 'lucide-react';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get tokens and user data from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userEmail = searchParams.get('user');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Google authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        if (!accessToken || !refreshToken || !userEmail) {
          setError('Invalid authentication response. Please try again.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Create user object (we'll need to fetch full user data from backend)
        const user = {
          id: 0, // Will be updated by completeGoogleAuth
          email: userEmail,
          full_name: '',
          role: 'user',
          username: userEmail.split('@')[0]
        };

        // Store tokens and user data using universal cookies
        CookieManager.setAuthData({
          accessToken,
          refreshToken,
          user,
        });

        // Complete Google auth in Redux
        await completeGoogleAuth({
          access_token: accessToken,
          refresh_token: refreshToken,
          user
        });

        // Get return URL from localStorage or default to dashboard
        const returnUrl = localStorage.getItem('oauth_return_url') || '/dashboard';
        localStorage.removeItem('oauth_return_url');

        // Navigate to the intended destination
        navigate(returnUrl, { replace: true });

      } catch (err: any) {
        console.error('Google callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, completeGoogleAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-primary-foreground">F</span>
        </div>
        
        {error ? (
          <div className="space-y-4">
            <div className="text-red-600 text-6xl">❌</div>
            <h1 className="text-2xl font-bold text-red-600">Authentication Failed</h1>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Completing Authentication</h1>
            <p className="text-muted-foreground">Please wait while we sign you in...</p>
          </div>
        )}
      </div>
    </div>
  );
};