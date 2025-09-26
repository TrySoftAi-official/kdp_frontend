import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { STRIPE_CONFIG, validateStripeConfig } from '@/config/stripe';

// Validate Stripe configuration
const configValidation = validateStripeConfig();
if (!configValidation.isValid) {
  console.error('Stripe configuration errors:', configValidation.errors);
}

console.log('Stripe publishable key:', STRIPE_CONFIG.publishableKey ? 'Present' : 'Missing');
console.log('Stripe configuration valid:', configValidation.isValid);

const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

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
    appearance: appearance || STRIPE_CONFIG.appearance,
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
