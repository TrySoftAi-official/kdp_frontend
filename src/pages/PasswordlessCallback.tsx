// src/pages/PasswordlessCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const PasswordlessCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { verifyPasswordlessToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Only run once when component mounts
    if (hasProcessedRef.current) {
      return;
    }

    const handlePasswordlessLogin = async () => {
      console.log('PasswordlessCallback: Token from URL:', token);
      hasProcessedRef.current = true;
      
      if (!token) {
        console.log('PasswordlessCallback: No token found in URL');
        setStatus('error');
        setErrorMessage('No authentication token found in the link');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }
      
      try {
        console.log('PasswordlessCallback: Calling verifyPasswordlessToken with token:', token);
        await verifyPasswordlessToken(token);
        console.log('PasswordlessCallback: Login successful');
        setStatus('success');
        
        // Wait a moment to show success state, then navigate
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } catch (err: any) {
        console.error('PasswordlessCallback: Login failed', err);
        setStatus('error');
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
        
        // Navigate to login page after showing error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handlePasswordlessLogin();
  }, []); // Empty dependency array - only run once on mount

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
