// src/pages/GoogleCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || '';
  const error = searchParams.get('error') || '';
  const navigate = useNavigate();
  const { handleGoogleCallback, error: authError } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      // Check for OAuth error first
      if (error) {
        console.error('OAuth error:', error);
        setVerificationStatus('error');
        return;
      }

      if (!code) {
        setVerificationStatus('error');
        return;
      }
      
      try {
        await handleGoogleCallback(code, state);
        setVerificationStatus('success');
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } catch (err: any) {
        console.error('Google authentication failed', err);
        setVerificationStatus('error');
      }
    };
    
    verify();
  }, [code, state, error, navigate, handleGoogleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          {verificationStatus === 'loading' && <Loader2 className="h-7 w-7 text-white animate-spin" />}
          {verificationStatus === 'success' && <CheckCircle className="h-7 w-7 text-white" />}
          {verificationStatus === 'error' && <AlertCircle className="h-7 w-7 text-white" />}
        </div>

        {verificationStatus === 'loading' && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Completing Google Sign In</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
            <p className="text-muted-foreground">
              You have been successfully authenticated with Google. Redirecting to dashboard...
            </p>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-600">Authentication Failed</h2>
            <p className="text-muted-foreground">
              {authError || error || 'Google authentication failed. Please try again.'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
