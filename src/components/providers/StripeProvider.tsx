import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

// Stripe publishable key - in production, this should come from environment variables
const STRIPE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RfxQ1PRGaz648v7jnF8cTZzZ6qJ2pskw2ieTZ4T04HAiiIt2MfX6YgPEEIh5AykawF6ALFYQJkloJyjNIigmFRl00F7f0wOpq';

console.log('Stripe publishable key:', STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing');
console.log('Environment variable:', (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set');

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
  appearance?: any;
  options?: any;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ 
  children, 
  clientSecret,
  appearance,
  options = {}
}) => {
  console.log('StripeProvider rendered with clientSecret:', clientSecret ? 'Present' : 'Missing');
  if (clientSecret) {
    console.log('Client secret format:', clientSecret.substring(0, 20) + '...');
  }
  
  const stripeOptions = {
    clientSecret,
    appearance: appearance || {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          '&:focus': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px',
        },
      },
    },
    ...options,
  };

  if (!clientSecret) {
    console.log('No client secret provided to StripeProvider');
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Waiting for payment initialization...</span>
      </div>
    );
  }

  console.log('Rendering Stripe Elements with client secret');
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
