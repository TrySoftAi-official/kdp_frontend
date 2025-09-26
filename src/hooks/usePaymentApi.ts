import { useState, useCallback } from 'react';
import {
  createCheckoutSession,
  createPaymentIntent,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getBillingPortal,
  getPaymentHistory,
  getPaymentStatus,
  refundPayment,
  CreateCheckoutSessionRequest,
  CreatePaymentIntentRequest,
  CheckoutSessionResponse,
  PaymentIntentResponse,
  PaymentMethod,
  BillingPortalRequest,
  BillingPortalResponse,
  PaymentHistoryResponse,
} from '@/apis/payment';
import { getErrorMessage } from '@/apis/apiClient';
import { AxiosError } from 'axios';

interface UsePaymentApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Checkout
  createCheckout: (data: CreateCheckoutSessionRequest) => Promise<CheckoutSessionResponse | null>;
  
  // Payment Intents
  createPayment: (data: CreatePaymentIntentRequest) => Promise<PaymentIntentResponse | null>;
  getPaymentStatus: (paymentIntentId: string) => Promise<any>;
  
  // Payment Methods
  getMethods: () => Promise<PaymentMethod[] | null>;
  setDefaultMethod: (paymentMethodId: string) => Promise<boolean>;
  deleteMethod: (paymentMethodId: string) => Promise<boolean>;
  
  // Billing Portal
  getBillingPortal: (data: BillingPortalRequest) => Promise<BillingPortalResponse | null>;
  
  // Payment History
  getPaymentHistory: (page?: number, limit?: number) => Promise<PaymentHistoryResponse | null>;
  
  // Refunds
  createRefundPayment: (paymentIntentId: string, amount?: number) => Promise<{ message: string; refund_id: string } | null>;
  
  // Utilities
  clearError: () => void;
  convertToCents: (amount: number) => number;
  generateIdempotencyKey: () => string;
}

export const usePaymentApi = (): UsePaymentApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiCall = useCallback(async <T>(apiCall: Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall;
      return result;
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      console.error('Payment API Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createCheckout: useCallback((request) => handleApiCall(createCheckoutSession(request)), [handleApiCall]),
    createPayment: useCallback((request) => handleApiCall(createPaymentIntent(request)), [handleApiCall]),
    getPaymentStatus: useCallback((paymentIntentId) => handleApiCall(getPaymentStatus(paymentIntentId)), [handleApiCall]),
    getMethods: useCallback(() => handleApiCall(getPaymentMethods()), [handleApiCall]),
    setDefaultMethod: useCallback(async (paymentMethodId) => {
      const result = await handleApiCall(setDefaultPaymentMethod(paymentMethodId));
      return result !== null;
    }, [handleApiCall]),
    deleteMethod: useCallback(async (paymentMethodId) => {
      const result = await handleApiCall(deletePaymentMethod(paymentMethodId));
      return result !== null;
    }, [handleApiCall]),
    getBillingPortal: useCallback((request) => handleApiCall(getBillingPortal(request)), [handleApiCall]),
    getPaymentHistory: useCallback((page = 1, limit = 10) => handleApiCall(getPaymentHistory(page, limit)), [handleApiCall]),
    createRefundPayment: useCallback((paymentIntentId, amount) => handleApiCall(refundPayment(paymentIntentId, amount)), [handleApiCall]),
    clearError,
    convertToCents: useCallback((amount: number) => Math.round(amount * 100), []),
    generateIdempotencyKey: useCallback(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), []),
  };
};