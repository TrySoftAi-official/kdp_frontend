// src/pages/PasswordlessRedirect.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const PasswordlessRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from the URL
    const token = searchParams.get('token');
    
    if (token) {
      // Redirect to the correct callback route with the token
      navigate(`/passwordless-login?token=${token}`, { replace: true });
    } else {
      // If no token, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
        </div>
        <h2 className="text-2xl font-semibold">Redirecting...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to the correct page.
        </p>
      </div>
    </div>
  );
};
