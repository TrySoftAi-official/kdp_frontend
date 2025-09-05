// src/pages/PasswordlessCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PasswordlessCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { verifyPasswordlessToken, error } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setVerificationStatus('error');
        return;
      }
      
      try {
        await verifyPasswordlessToken(token);
        setVerificationStatus('success');
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } catch (err: any) {
        console.error('Magic link verification failed', err);
        setVerificationStatus('error');
      }
    };
    
    verify();
  }, [token, navigate, verifyPasswordlessToken]);

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
            <h2 className="text-2xl font-semibold">Verifying your magic link</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your authentication...
            </p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
            <p className="text-muted-foreground">
              You have been successfully authenticated. Redirecting to dashboard...
            </p>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-red-600">Verification Failed</h2>
            <p className="text-muted-foreground">
              {error || 'The magic link is invalid or has expired. Please request a new one.'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Back to Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/check-email')} 
                className="w-full"
              >
                Request New Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
