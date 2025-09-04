import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    try {
      setMessage('');
      setIsSuccess(false);
      console.log('Sending passwordless login request for:', email);
      
             // Call the API
       console.log('🔍 Making Axios API call to:', `http://127.0.0.1:8000/auth/passwordless-login/request`);
       console.log('🔍 Request payload:', { email });
       
       const response = await authApi.passwordlessLoginRequest(email);
       console.log('✅ Passwordless login response:', response);
       console.log('✅ Response status:', response?.status);
       console.log('✅ Response data:', response?.data);
       console.log('✅ Response headers:', response?.headers);
      
      // If we get here, the API call was successful
      console.log('✅ API call successful, navigating to check-email...');
      
      // Try React Router navigation first
      try {
        navigate('/check-email', { state: { email } });
        console.log('✅ React Router navigation successful');
      } catch (navError) {
        console.error('❌ React Router navigation failed:', navError);
        // Fallback to window.location
        console.log('🔄 Using fallback navigation...');
        window.location.href = '/check-email';
      }
      
    } catch (err) {
      console.error('Passwordless login error:', err);
      setMessage(err instanceof Error ? err.message : 'Failed to send magic link');
      setIsSuccess(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setMessage('');
      await loginWithGoogle();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Google login failed');
      setIsSuccess(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demoEmails = {
      admin: 'admin@forgekdp.com',
      assistant: 'assistant@forgekdp.com',
      marketer: 'marketer@forgekdp.com',
      guest: 'guest@forgekdp.com'
    };

    try {
      setMessage('');
      setIsSuccess(false);
      const demoEmail = demoEmails[role as keyof typeof demoEmails];
      console.log('Sending demo login request for role:', role, 'email:', demoEmail);
      
             // Call the API
       console.log('🔍 Making Axios API call for demo to:', `http://127.0.0.1:8000/auth/passwordless-login/request`);
       console.log('🔍 Demo request payload:', { email: demoEmail });
       
       const response = await authApi.passwordlessLoginRequest(demoEmail);
       console.log('✅ Demo login response:', response);
      
      // If we get here, the API call was successful
      console.log('✅ Demo API call successful, navigating to check-email...');
      
      // Try React Router navigation first
      try {
        navigate('/check-email', { state: { email: demoEmail } });
        console.log('✅ Demo React Router navigation successful');
      } catch (navError) {
        console.error('❌ Demo React Router navigation failed:', navError);
        // Fallback to window.location
        console.log('🔄 Using fallback navigation for demo...');
        window.location.href = '/check-email';
      }
      
    } catch (err) {
      console.error('Demo login error:', err);
      setMessage(err instanceof Error ? err.message : 'Demo login failed');
      setIsSuccess(false);
    }
  }; 


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className=" max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="text-3xl font-bold">Welcome to ForgeKDP</h1>
          <p className="text-muted-foreground mt-2">
            Automated book publishing platform
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className={`p-3 text-sm rounded-md border ${
                isSuccess 
                  ? 'text-green-600 bg-green-50 border-green-200' 
                  : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {message}
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Magic Link
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
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
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Try the platform with different user roles
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
              >
                Admin Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('assistant')}
                disabled={isLoading}
              >
                Assistant Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('marketer')}
                disabled={isLoading}
              >
                Marketer Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('guest')}
                disabled={isLoading}
              >
                Guest Demo
              </Button>
            </div>
            
            {/* Test Navigation Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Testing navigation to check-email...');
                  navigate('/check-email', { state: { email: 'test@example.com' } });
                }}
                className="w-full"
              >
                Test Navigation to Check Email
              </Button>
              
                            {/* Test Backend Connection */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log('Testing backend connection...');
                      
                      // Test 1: Basic connection
                      console.log('🔍 Testing basic connection to port 8000...');
                      const response = await fetch('http://127.0.0.1:8000/health');
                      console.log('✅ Backend response:', response);
                      if (response.ok) {
                        alert('✅ Backend is connected on port 8000!');
                      } else {
                        alert('⚠️ Backend responded but with error');
                      }
                    } catch (error) {
                      console.error('❌ Backend connection test failed:', error);
                      
                      // Test 2: Try different ports
                      console.log('🔍 Trying alternative ports...');
                      try {
                        const response5000 = await fetch('http://127.0.0.1:5000/health');
                        if (response5000.ok) {
                          alert('✅ Backend found on port 5000! Update your API client.');
                          return;
                        }
                      } catch (e) {
                        console.log('Port 5000 not accessible');
                      }
                      
                      try {
                        const response3000 = await fetch('http://127.0.0.1:3000/health');
                        if (response3000.ok) {
                          alert('✅ Backend found on port 3000! Update your API client.');
                          return;
                        }
                      } catch (e) {
                        console.log('Port 3000 not accessible');
                      }
                      
                      alert('❌ Cannot connect to backend on ports 8000, 5000, or 3000.\n\nCheck:\n1. Is your backend running?\n2. What port is it actually using?\n3. Are there CORS issues?');
                    }
                  }}
                  className="w-full"
                >
                  Test Backend Connection
                </Button>
                
                {/* Test Actual API Endpoint */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        console.log('🔍 Testing actual API endpoint...');
                        const response = await fetch('http://127.0.0.1:8000/auth/passwordless-login/request', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email: 'test@example.com' })
                        });
                        console.log('✅ API endpoint response:', response);
                        if (response.ok) {
                          alert('✅ Your API endpoint is working! The issue is in the frontend API call.');
                        } else {
                          alert('⚠️ API endpoint responded but with error status: ' + response.status);
                        }
                      } catch (error) {
                        console.error('❌ API endpoint test failed:', error);
                        alert('❌ Cannot reach your API endpoint. This confirms the connection issue.');
                      }
                    }}
                    className="w-full"
                  >
                    Test Actual API Endpoint
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
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
