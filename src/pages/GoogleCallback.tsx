// src/pages/GoogleCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AuthService from '@/api/authService';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || '';
  const error = searchParams.get('error') || '';
  const accessToken = searchParams.get('access_token') || '';
  const refreshToken = searchParams.get('refresh_token') || '';
  const userEmail = searchParams.get('user') || '';
  const navigate = useNavigate();
  const { setUser, error: authError } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      // Log all URL parameters for debugging
      console.log('GoogleCallback URL parameters:', {
        code: code ? code.substring(0, 20) + '...' : 'none',
        state: state || 'none',
        error: error || 'none',
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
        refreshToken: refreshToken ? refreshToken.substring(0, 20) + '...' : 'none',
        userEmail: userEmail || 'none'
      });

      // Check for OAuth error first
      if (error) {
        console.error('OAuth error:', error);
        setVerificationStatus('error');
        return;
      }

      try {
        // Check if we have tokens directly from URL (backend redirect)
        if (accessToken && refreshToken && userEmail) {
          console.log('Google OAuth tokens received from URL:', { 
            accessToken: accessToken.substring(0, 20) + '...', 
            refreshToken: refreshToken.substring(0, 20) + '...', 
            userEmail 
          });
          
          // Validate token format
          const accessTokenParts = accessToken.split('.');
          const refreshTokenParts = refreshToken.split('.');
          
          if (accessTokenParts.length !== 3 || refreshTokenParts.length !== 3) {
            console.error('Invalid token format:', {
              accessTokenParts: accessTokenParts.length,
              refreshTokenParts: refreshTokenParts.length
            });
            setVerificationStatus('error');
            return;
          }
          
          // Create user object from email
          const user = {
            id: '0', // Will be updated by backend
            email: userEmail,
            name: userEmail.split('@')[0],
            role: 'guest' as const,
            avatar: undefined
          };
          
          // Store tokens and user data
          AuthService.storeTokens({ 
            access_token: accessToken, 
            refresh_token: refreshToken 
          });
          
          // Convert user to UserResponse format for storage
          const userResponse = {
            id: user.id,
            email: user.email,
            username: user.name,
            role: user.role,
            status: true,
            created_at: new Date().toISOString()
          };
          
          AuthService.storeUser(userResponse);
          setUser(user);
          console.log('Google authentication successful from URL tokens:', user);
          
          setVerificationStatus('success');
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
          
        } else if (code) {
          // Fallback: Exchange authorization code for tokens via API
          console.log('Google OAuth callback received, exchanging code for tokens:', { 
            code: code.substring(0, 20) + '...', 
            state 
          });
          
          const response = await AuthService.googleCallback(code, state);
          const { access_token, refresh_token, user } = response.data;
          
          if (access_token && refresh_token && user) {
            // Store tokens and user data
            AuthService.storeTokens({ access_token, refresh_token });
            AuthService.storeUser(user);
            
            // Convert UserResponse to User format
            const userFormatted = {
              id: user.id,
              email: user.email,
              name: user.username,
              role: user.role,
              avatar: undefined
            };
            
            setUser(userFormatted);
            console.log('Google authentication successful from API:', userFormatted);
            
            setVerificationStatus('success');
            // Navigate to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          } else {
            throw new Error('Invalid response from Google OAuth callback');
          }
        } else {
          console.error('Missing authorization code or tokens from OAuth callback');
          setVerificationStatus('error');
          return;
        }
      } catch (err: any) {
        console.error('Google authentication failed', err);
        setVerificationStatus('error');
      }
    };
    
    verify();
  }, [code, state, error, accessToken, refreshToken, userEmail, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center space-y-6">
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
