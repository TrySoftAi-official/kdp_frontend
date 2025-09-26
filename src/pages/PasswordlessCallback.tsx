// src/pages/PasswordlessCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import CookieManager from '@/utils/cookies';

export const PasswordlessCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessedRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    // Only run once when component mounts and we have a token
    if (hasProcessedRef.current || !token || processingRef.current) {
      return;
    }

    const handlePasswordlessLogin = async () => {
      console.log('PasswordlessCallback: Token from URL:', token);
      hasProcessedRef.current = true;
      processingRef.current = true;
      
      try {
        console.log('PasswordlessCallback: Calling verifyMagicLink with token:', token);
        const result = await verifyMagicLink(token);
        
        if (result.type === 'auth/verifyMagicLink/fulfilled') {
          console.log('PasswordlessCallback: Login successful');
          
          // Verify that cookies are set correctly
          const authData = CookieManager.getAuthData();
          console.log('PasswordlessCallback: Auth data from cookies:', {
            hasAccessToken: !!authData.accessToken,
            hasRefreshToken: !!authData.refreshToken,
            hasUser: !!authData.user,
            isAuthenticated: authData.isAuthenticated
          });
          
          setStatus('success');
          
          // Navigate immediately without additional delays
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Login verification failed');
        }
      } catch (err: any) {
        console.error('PasswordlessCallback: Login failed', err);
        setStatus('error');
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
        
        // Navigate to login page after showing error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        processingRef.current = false;
      }
    };

    handlePasswordlessLogin();
  }, []); // Empty dependency array to run only once

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold">Authenticating...</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your magic link.
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
            <p className="text-muted-foreground">
              You have been successfully authenticated. Redirecting to dashboard...
            </p>
          </>
        );
      
      case 'error':
        return (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-red-500 flex items-center justify-center mb-4">
              <XCircle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-red-600">Authentication Failed</h2>
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};
