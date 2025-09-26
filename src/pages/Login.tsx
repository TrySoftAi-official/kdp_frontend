// src/pages/Login.tsx
import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/redux/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import CookieManager from '@/utils/cookies';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; variant: 'success' | 'error' | 'info' } | null>(null);
  const { 
    isAuthenticated, 
    isLoading,
    requestMagicLink,
    completeGoogleAuth
  } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', variant: 'error' });
      return;
    }

    try {
      setMessage({ text: 'Sending magic link... This may take a moment.', variant: 'info' });
      await requestMagicLink(email);
      setMessage({ text: 'Magic link sent — check your email', variant: 'success' });
      // navigate to check-email screen (we keep email in state)
      navigate('/check-email', { state: { email } });
    } catch (err: any) {
      console.error('passwordless request failed', err);
      let text = 'Failed to send magic link';
      
      if (err?.message?.includes('timeout')) {
        text = 'Email sending is taking longer than expected. Please check your email or try again.';
      } else if (err?.response?.data?.message) {
        text = err.response.data.message;
      } else if (err?.message) {
        text = err.message;
      }
      
      setMessage({ text, variant: 'error' });
    }
  };

  const handleGoogle = async () => {
    setMessage(null);
    try {
      // First, get the Google OAuth URL from the backend
      const response = await fetch('http://localhost:8000/api/auth/google/login');
      const data = await response.json();
      
      if (!data.auth_url) {
        throw new Error('Failed to get Google OAuth URL');
      }

      // Try popup first, with fallback to redirect
      const popup = window.open(
        data.auth_url,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes,top=100,left=100'
      );

      if (!popup) {
        // Popup blocked - show user-friendly message and offer redirect option
        setMessage({ 
          text: 'Popup blocked by browser. Click "Continue with Redirect" to sign in with Google.', 
          variant: 'info' 
        });
        return;
      }

      // Check if popup was actually opened (some browsers return a popup object but don't open it)
      try {
        popup.focus();
        if (popup.closed || typeof popup.closed === 'undefined') {
          throw new Error('Popup blocked');
        }
      } catch (e) {
        popup.close();
        setMessage({ 
          text: 'Popup blocked by browser. Click "Continue with Redirect" to sign in with Google.', 
          variant: 'info' 
        });
        return;
      }

      // Listen for popup messages
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          
          // Store tokens and user data using universal cookies
          CookieManager.setAuthData({
            accessToken: event.data.access_token,
            refreshToken: event.data.refresh_token,
            user: event.data.user,
          });
          
          // Complete Google auth in Redux
          await completeGoogleAuth({
            access_token: event.data.access_token,
            refresh_token: event.data.refresh_token,
            user: event.data.user
          });
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          setMessage({ text: event.data.error || 'Google login failed', variant: 'error' });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (err: any) {
      console.error('google login failed', err);
      const text = err?.message || 'Google login failed';
      setMessage({ text, variant: 'error' });
    }
  };

  const handleGoogleRedirect = async () => {
    setMessage(null);
    try {
      // Get the Google OAuth URL from the backend
      const response = await fetch('http://localhost:8000/api/auth/google/login');
      const data = await response.json();
      
      if (!data.auth_url) {
        throw new Error('Failed to get Google OAuth URL');
      }

      // Store the current URL to return to after OAuth
      localStorage.setItem('oauth_return_url', window.location.pathname);
      
      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (err: any) {
      console.error('google redirect login failed', err);
      const text = err?.message || 'Google login failed';
      setMessage({ text, variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="text-3xl font-bold">Welcome to ForgeKDP</h1>
          <p className="text-muted-foreground mt-2">Automated book publishing platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`p-3 text-sm rounded-md border ${
                  message.variant === 'success'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : message.variant === 'error'
                    ? 'text-red-600 bg-red-50 border-red-200'
                    : 'text-blue-600 bg-blue-50 border-blue-200'
                }`}
              >
                {message.text}
              </div>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Magic Link
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google (Popup)
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleGoogleRedirect} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Redirect
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
