// Stripe configuration
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RfxQ1PRGaz648v7jnF8cTZzZ6qJ2pskw2ieTZ4T04HAiiIt2MfX6YgPEEIh5AykawF6ALFYQJkloJyjNIigmFRl00F7f0wOpq',
  
  // Payment method types to enable
  paymentMethodTypes: ['card', 'klarna', 'afterpay_clearpay'],
  
  // Appearance configuration
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  
  // Supported countries for payment methods
  supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'],
};

// Helper function to check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  return !!STRIPE_CONFIG.publishableKey && 
         STRIPE_CONFIG.publishableKey.startsWith('pk_') &&
         STRIPE_CONFIG.publishableKey.length > 20;
};

// Helper function to get payment method display names
export const getPaymentMethodDisplayName = (method: string): string => {
  const displayNames: Record<string, string> = {
    card: 'Credit/Debit Card',
    klarna: 'Klarna',
    afterpay_clearpay: 'Afterpay/Clearpay',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
  };
  
  return displayNames[method] || method;
};