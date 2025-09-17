// Stripe configuration for the frontend
export const STRIPE_CONFIG = {
  // Stripe publishable key - should be set in environment variables
  publishableKey: (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RfxQ1PRGaz648v7jnF8cTZzZ6qJ2pskw2ieTZ4T04HAiiIt2MfX6YgPEEIh5AykawF6ALFYQJkloJyjNIigmFRl00F7f0wOpq',
  
  // API version
  apiVersion: (import.meta as any).env?.VITE_STRIPE_API_VERSION || '2024-11-08',
  
  // Supported payment methods
  paymentMethods: {
    card: true,
    googlePay: (import.meta as any).env?.VITE_ENABLE_GOOGLE_PAY !== 'false',
    applePay: (import.meta as any).env?.VITE_ENABLE_APPLE_PAY !== 'false',
    klarna: false, // Enable if needed
    afterpay: false, // Enable if needed
  },
  
  // Stripe Elements appearance
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
  
  // Payment Request Button options
  paymentRequestButton: {
    theme: 'dark' as const,
    height: '48px',
  },
  
  // Supported countries for payment methods
  supportedCountries: [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
    'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'LU', 'JP',
    'SG', 'HK', 'NZ'
  ],
  
  // Supported currencies
  supportedCurrencies: [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'
  ],
};

// Validation function
export const validateStripeConfig = () => {
  const errors: string[] = [];
  
  if (!STRIPE_CONFIG.publishableKey) {
    errors.push('Stripe publishable key is required');
  }
  
  if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to check if payment method is supported
export const isPaymentMethodSupported = (method: string): boolean => {
  return STRIPE_CONFIG.paymentMethods[method as keyof typeof STRIPE_CONFIG.paymentMethods] === true;
};

// Helper function to get supported payment methods
export const getSupportedPaymentMethods = (): string[] => {
  return Object.entries(STRIPE_CONFIG.paymentMethods)
    .filter(([_, supported]) => supported)
    .map(([method, _]) => method);
};

export default STRIPE_CONFIG;
