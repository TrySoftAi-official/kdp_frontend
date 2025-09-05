// src/pages/PasswordlessCallback.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PasswordlessCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { verifyPasswordlessToken } = useAuth();

  useEffect(() => {
    const handlePasswordlessLogin = async () => {
      console.log('PasswordlessCallback: Token from URL:', token);
      
      if (!token) {
        console.log('PasswordlessCallback: No token found in URL');
        navigate('/', { replace: true });
        return;
      }
      
      try {
        console.log('PasswordlessCallback: Calling verifyPasswordlessToken with token:', token);
        await verifyPasswordlessToken(token);
        console.log('PasswordlessCallback: Login successful, navigating to dashboard');
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } catch (err: any) {
        console.error('PasswordlessCallback: Login failed', err);
        // Navigate to login page on error
        navigate('/', { replace: true });
      }
    };
    
    handlePasswordlessLogin();
  }, [token, navigate, verifyPasswordlessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <div className="h-7 w-7 text-white animate-spin border-2 border-white border-t-transparent rounded-full"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Logging you in...</h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
