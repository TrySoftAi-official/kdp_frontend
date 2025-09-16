import apiClient from './client';
import { AxiosResponse } from 'axios';

// Payment Types
export interface PaymentLineItem {
  product_name: string;
  product_description?: string;
  quantity: number;
  unit_amount: number;
  tax_amount?: number;
  tax_rate?: number;
  metadata?: Record<string, any>;
}

export interface CreateCheckoutSessionRequest {
  amount: number;
  currency: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  metadata?: Record<string, any>;
  success_url: string;
  cancel_url: string;
  payment_method_types?: string[];
  line_items?: PaymentLineItem[];
  tax_amount?: number;
  tax_rate?: number;
  country_code?: string;
  locale?: string;
  idempotency_key?: string;
}

export interface CheckoutSessionResponse {
  id: number;
  stripe_checkout_session_id: string;
  url: string;
  amount: number;
  currency: string;
  status: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  line_items: PaymentLineItem[];
  tax_amount?: number;
  tax_rate?: number;
  country_code?: string;
  locale?: string;
  created_at: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  metadata?: Record<string, any>;
  payment_method_types?: string[];
  confirm?: boolean;
  capture_method: 'automatic' | 'manual';
  return_url?: string;
  line_items?: PaymentLineItem[];
  tax_amount?: number;
  tax_rate?: number;
  country_code?: string;
  locale?: string;
  idempotency_key?: string;
}

export interface PaymentIntentResponse {
  id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  line_items: PaymentLineItem[];
  tax_amount?: number;
  tax_rate?: number;
  country_code?: string;
  locale?: string;
  client_secret: string;
  requires_action: boolean;
  action_type?: string;
  created_at: string;
}

export interface PaymentLineItemResponse {
  id: number;
  product_name: string;
  product_description?: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  tax_amount?: number;
  tax_rate?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PaymentStatusResponse {
  id: number;
  stripe_payment_intent?: string;
  stripe_checkout_session?: string;
  stripe_customer_id?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  capture_method?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  line_items: PaymentLineItemResponse[];
  tax_amount?: number;
  tax_rate?: number;
  country_code?: string;
  locale?: string;
  error_message?: string;
  error_code?: string;
  requires_action: boolean;
  action_type?: string;
  created_at: string;
  updated_at?: string;
  paid_at?: string;
}

export interface TaxCalculationRequest {
  amount: number;
  currency: string;
  country_code: string;
  postal_code?: string;
}

export interface TaxCalculationResponse {
  amount_excluding_tax: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  currency: string;
  country_code: string;
  breakdown: Record<string, any>;
}

export interface PaymentRefundRequest {
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
  idempotency_key?: string;
}

export interface PaymentRefundResponse {
  id: number;
  payment_id: number;
  stripe_refund_id: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export interface WebhookRetryResponse {
  status: string;
  message: string;
  total_failed?: number;
}

// Payment Service Class
export class PaymentService {
  // Checkout Sessions
  static async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<AxiosResponse<CheckoutSessionResponse>> {
    try {
      // Validate required fields
      if (!data.customer_email) {
        throw new Error('Customer email is required');
      }
      if (!data.amount || data.amount <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!data.success_url) {
        throw new Error('Success URL is required');
      }
      if (!data.cancel_url) {
        throw new Error('Cancel URL is required');
      }

      // Ensure idempotency key is present
      if (!data.idempotency_key) {
        data.idempotency_key = PaymentService.generateIdempotencyKey();
      }

      console.log('Creating checkout session with data:', data);
      
      const response = await apiClient.post('/payment/create-checkout-session', data);
      
      console.log('Checkout session response:', response.data);
      
      // Validate response structure
      if (!response.data) {
        throw new Error('No response data received');
      }

      if (!response.data.url && !response.data.data?.url) {
        throw new Error('No checkout URL in response');
      }

      return response;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Payment Intents
  static async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<AxiosResponse<PaymentIntentResponse>> {
    return apiClient.post('/payment/create-payment-intent', data);
  }

  // Payment Status
  static async getPaymentStatus(paymentId: number): Promise<AxiosResponse<PaymentStatusResponse>> {
    return apiClient.get(`/payment/payment-status/${paymentId}`);
  }

  // Tax Calculation
  static async calculateTax(data: TaxCalculationRequest): Promise<AxiosResponse<TaxCalculationResponse>> {
    return apiClient.post('/payment/calculate-tax', data);
  }

  // Refunds
  static async createRefund(paymentId: number, data: PaymentRefundRequest): Promise<AxiosResponse<PaymentRefundResponse>> {
    return apiClient.post(`/payment/refund/${paymentId}`, data);
  }

  // Webhooks
  static async retryWebhooks(): Promise<AxiosResponse<WebhookRetryResponse>> {
    return apiClient.post('/payment/webhook/retry');
  }

  // Helper methods
  static formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static convertToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  static convertFromCents(amount: number): number {
    return amount / 100;
  }

  static getPaymentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      succeeded: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100',
      canceled: 'text-gray-600 bg-gray-100',
      requires_action: 'text-blue-600 bg-blue-100',
      refunded: 'text-purple-600 bg-purple-100',
      disputed: 'text-orange-600 bg-orange-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  }

  static getPaymentStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      succeeded: 'Succeeded',
      pending: 'Pending',
      failed: 'Failed',
      canceled: 'Canceled',
      requires_action: 'Requires Action',
      refunded: 'Refunded',
      disputed: 'Disputed',
    };
    return statusLabels[status] || status;
  }

  static isPaymentSuccessful(status: string): boolean {
    return status === 'succeeded';
  }

  static isPaymentPending(status: string): boolean {
    return ['pending', 'requires_action'].includes(status);
  }

  static isPaymentFailed(status: string): boolean {
    return ['failed', 'canceled'].includes(status);
  }

  static canRefund(status: string): boolean {
    return status === 'succeeded';
  }

  static getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
  }

  static getSupportedCountries(): Array<{ code: string; name: string }> {
    return [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'AU', name: 'Australia' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'BE', name: 'Belgium' },
      { code: 'AT', name: 'Austria' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'SE', name: 'Sweden' },
      { code: 'NO', name: 'Norway' },
      { code: 'DK', name: 'Denmark' },
      { code: 'FI', name: 'Finland' },
      { code: 'IE', name: 'Ireland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'JP', name: 'Japan' },
      { code: 'SG', name: 'Singapore' },
      { code: 'HK', name: 'Hong Kong' },
      { code: 'NZ', name: 'New Zealand' },
    ];
  }

  static getPaymentMethodTypes(): string[] {
    return ['card', 'apple_pay', 'google_pay', 'klarna', 'afterpay_clearpay', 'us_bank_account'];
  }

  static generateIdempotencyKey(): string {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export individual functions for convenience
export const {
  createCheckoutSession,
  createPaymentIntent,
  getPaymentStatus,
  calculateTax,
  createRefund,
  retryWebhooks,
  formatAmount,
  convertToCents,
  convertFromCents,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  isPaymentSuccessful,
  isPaymentPending,
  isPaymentFailed,
  canRefund,
  getSupportedCurrencies,
  getSupportedCountries,
  getPaymentMethodTypes,
  generateIdempotencyKey,
} = PaymentService;

export default PaymentService;
