import React from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api';

interface CheckEmailProps {
  email?: string;
}

export const CheckEmail: React.FC<CheckEmailProps> = ({ email }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || email;

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = async () => {
    if (!emailFromState) {
      alert('No email address found to resend to');
      return;
    }

    try {
      await authApi.passwordlessLoginRequest(emailFromState);
      alert('Magic link resent! Check your email again.');
    } catch (error) {
      alert('Failed to resend magic link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent you a magic link to sign in
          </p>
        </div>

        {/* Email Check Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Magic Link Sent!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a secure login link to:
              </p>
              <p className="font-medium text-foreground">
                {emailFromState || 'your email address'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Check your inbox and spam folder</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Click the link in the email to automatically sign in to your account.
                The link will expire in 15 minutes for security.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                variant="outline" 
                className="w-full"
              >
                Didn't receive the email? Resend
              </Button>
              
              <Button 
                onClick={handleBackToLogin}
                variant="ghost" 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Having trouble?{' '}
            <a href="#" className="underline hover:text-foreground">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
