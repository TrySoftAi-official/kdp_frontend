import apiClient, { getErrorMessage } from './apiClient';

// Types
export interface CreateCheckoutSessionRequest {
  plan: string;
  billing_cycle: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

export interface BillingPortalRequest {
  return_url?: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  payment_method?: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

// API Functions
export async function createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    console.log('💳 [createCheckoutSession] Creating checkout session');
    const { data } = await apiClient.post('/payment/create-checkout-session', request);
    console.log('✅ [createCheckoutSession] Checkout session created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createCheckoutSession] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
  try {
    console.log('💳 [createPaymentIntent] Creating payment intent');
    const { data } = await apiClient.post('/payment/create-payment-intent', request);
    console.log('✅ [createPaymentIntent] Payment intent created successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [createPaymentIntent] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('💳 [getPaymentMethods] Fetching payment methods');
    const { data } = await apiClient.get('/payment/methods');
    console.log('✅ [getPaymentMethods] Payment methods fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ [getPaymentMethods] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
  try {
    console.log('💳 [setDefaultPaymentMethod] Setting default payment method:', paymentMethodId);
    const { data } = await apiClient.post('/payment/set-default-method', { payment_method_id: paymentMethodId });
    console.log('✅ [setDefaultPaymentMethod] Default payment method set successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [setDefaultPaymentMethod] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
  try {
    console.log('🗑️ [deletePaymentMethod] Deleting payment method:', paymentMethodId);
    const { data } = await apiClient.delete(`/payment/methods/${paymentMethodId}`);
    console.log('✅ [deletePaymentMethod] Payment method deleted successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [deletePaymentMethod] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getBillingPortal(request: BillingPortalRequest): Promise<BillingPortalResponse> {
  try {
    console.log('💳 [getBillingPortal] Getting billing portal');
    const { data } = await apiClient.post('/payment/billing-portal', request);
    console.log('✅ [getBillingPortal] Billing portal URL retrieved successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getBillingPortal] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getPaymentHistory(page: number = 1, limit: number = 10): Promise<PaymentHistoryResponse> {
  try {
    console.log('📋 [getPaymentHistory] Fetching payment history');
    const { data } = await apiClient.get(`/payment/history?page=${page}&limit=${limit}`);
    console.log('✅ [getPaymentHistory] Payment history fetched successfully:', data.payments?.length || 0);
    return data;
  } catch (error: any) {
    console.error('❌ [getPaymentHistory] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function getPaymentStatus(paymentIntentId: string): Promise<{ status: string; amount: number; currency: string }> {
  try {
    console.log('📊 [getPaymentStatus] Fetching payment status:', paymentIntentId);
    const { data } = await apiClient.get(`/payment/status/${paymentIntentId}`);
    console.log('✅ [getPaymentStatus] Payment status fetched successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [getPaymentStatus] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

export async function refundPayment(paymentIntentId: string, amount?: number): Promise<{ message: string; refund_id: string }> {
  try {
    console.log('💰 [refundPayment] Processing refund:', paymentIntentId);
    const { data } = await apiClient.post('/payment/refund', { 
      payment_intent_id: paymentIntentId, 
      amount 
    });
    console.log('✅ [refundPayment] Refund processed successfully');
    return data;
  } catch (error: any) {
    console.error('❌ [refundPayment] API Error:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}
