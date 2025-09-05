// src/pages/CheckEmail.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CheckEmail: React.FC = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const email = (loc.state as any)?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <Mail className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">
          We sent a magic link to <strong>{email || 'your email'}</strong>. Click the link in the email to sign in.
          The link is one-time use and will expire for security.
        </p>

        <div className="space-y-2">
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  );
};
