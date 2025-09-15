import React from 'react';
import { PaymentCallbackHandler } from '@/components/subscription/PaymentCallbackHandler';

export const PaymentCallback: React.FC = () => {
  return (
    <PaymentCallbackHandler
      onSuccess={() => {
        // Redirect to subscription page after successful payment
        window.location.href = '/subscription';
      }}
      onError={() => {
        // Stay on callback page to show error
      }}
      redirectTo="/subscription"
    />
  );
};
