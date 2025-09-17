import { useState, useCallback } from 'react';
import PaymentService, {
  CreateCheckoutSessionRequest,
  CreatePaymentIntentRequest,
  CheckoutSessionResponse,
  PaymentIntentResponse,
  PaymentStatusResponse,
  TaxCalculationRequest,
  TaxCalculationResponse,
  PaymentRefundRequest,
  PaymentRefundResponse,
  WebhookRetryResponse,
  CreateBillingPortalSessionRequest,
  BillingPortalSessionResponse,
} from '@/api/paymentService';
import { getErrorMessage } from '@/api/client';
import { AxiosError } from 'axios';

interface UsePaymentApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Checkout sessions
  createCheckoutSession: (data: CreateCheckoutSessionRequest) => Promise<CheckoutSessionResponse | null>;
  
  // Payment intents
  createPaymentIntent: (data: CreatePaymentIntentRequest) => Promise<PaymentIntentResponse | null>;
  
  // Payment status
  getPaymentStatus: (paymentId: number) => Promise<PaymentStatusResponse | null>;
  
  // Tax calculation
  calculateTax: (data: TaxCalculationRequest) => Promise<TaxCalculationResponse | null>;
  
  // Refunds
  createRefund: (paymentId: number, data: PaymentRefundRequest) => Promise<PaymentRefundResponse | null>;
  
  // Webhooks
  retryWebhooks: () => Promise<WebhookRetryResponse | null>;
  
  // Billing Portal
  createBillingPortalSession: (data: CreateBillingPortalSessionRequest) => Promise<BillingPortalSessionResponse | null>;
  
  // Utilities
  clearError: () => void;
  formatAmount: (amount: number, currency?: string) => string;
  convertToCents: (amount: number) => number;
  convertFromCents: (amount: number) => number;
  getPaymentStatusColor: (status: string) => string;
  getPaymentStatusLabel: (status: string) => string;
  isPaymentSuccessful: (status: string) => boolean;
  isPaymentPending: (status: string) => boolean;
  isPaymentFailed: (status: string) => boolean;
  canRefund: (status: string) => boolean;
  getSupportedCurrencies: () => string[];
  getSupportedCountries: () => Array<{ code: string; name: string }>;
  getPaymentMethodTypes: () => string[];
  generateIdempotencyKey: () => string;
}

export const usePaymentApi = (): UsePaymentApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create checkout session
  const createCheckoutSession = useCallback(async (data: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.createCheckoutSession(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create payment intent
  const createPaymentIntent = useCallback(async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.createPaymentIntent(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get payment status
  const getPaymentStatus = useCallback(async (paymentId: number): Promise<PaymentStatusResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.getPaymentStatus(paymentId);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate tax
  const calculateTax = useCallback(async (data: TaxCalculationRequest): Promise<TaxCalculationResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.calculateTax(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create refund
  const createRefund = useCallback(async (paymentId: number, data: PaymentRefundRequest): Promise<PaymentRefundResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.createRefund(paymentId, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Retry webhooks
  const retryWebhooks = useCallback(async (): Promise<WebhookRetryResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.retryWebhooks();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create billing portal session
  const createBillingPortalSession = useCallback(async (data: CreateBillingPortalSessionRequest): Promise<BillingPortalSessionResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PaymentService.createBillingPortalSession(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? getErrorMessage(err) : (err as Error).message;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Checkout sessions
    createCheckoutSession,
    
    // Payment intents
    createPaymentIntent,
    
    // Payment status
    getPaymentStatus,
    
    // Tax calculation
    calculateTax,
    
    // Refunds
    createRefund,
    
    // Webhooks
    retryWebhooks,
    
    // Billing Portal
    createBillingPortalSession,
    
    // Utilities
    clearError,
    formatAmount: PaymentService.formatAmount,
    convertToCents: PaymentService.convertToCents,
    convertFromCents: PaymentService.convertFromCents,
    getPaymentStatusColor: PaymentService.getPaymentStatusColor,
    getPaymentStatusLabel: PaymentService.getPaymentStatusLabel,
    isPaymentSuccessful: PaymentService.isPaymentSuccessful,
    isPaymentPending: PaymentService.isPaymentPending,
    isPaymentFailed: PaymentService.isPaymentFailed,
    canRefund: PaymentService.canRefund,
    getSupportedCurrencies: PaymentService.getSupportedCurrencies,
    getSupportedCountries: PaymentService.getSupportedCountries,
    getPaymentMethodTypes: PaymentService.getPaymentMethodTypes,
    generateIdempotencyKey: PaymentService.generateIdempotencyKey,
  };
};
