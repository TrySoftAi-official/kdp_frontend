import apiClient from "./client";

export const paymentApi = {
  createCheckoutSession: (data: any) =>
    apiClient.post("/payment/create-checkout-session", data),

  createPaymentIntent: (data: any) =>
    apiClient.post("/payment/create-payment-intent", data),

  paymentStatus: (paymentId: string) =>
    apiClient.get(`/payment/payment-status/${paymentId}`),

  calculateTax: (data: any) => apiClient.post("/payment/calculate-tax", data),

  refund: (paymentId: string) =>
    apiClient.post(`/payment/refund/${paymentId}`),

  retryWebhook: () => apiClient.post("/payment/webhook/retry"),
  
  // Webhook endpoint (for receiving webhooks from Stripe)
  webhook: (data: any) => apiClient.post("/payment/webhook", data),
};
