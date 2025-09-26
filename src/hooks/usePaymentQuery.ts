import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaymentApi } from './usePaymentApi';
import { queryKeys } from '@/utils/queryClient';
import { 
  CreateCheckoutSessionRequest,
  CreatePaymentIntentRequest,
  TaxCalculationRequest,
  PaymentRefundRequest
} from '@/services/paymentService';

export const usePaymentQuery = () => {
  const paymentApi = usePaymentApi();
  const queryClient = useQueryClient();

  // Get payment status query
  const usePaymentStatus = (paymentId: number) => {
    return useQuery({
      queryKey: queryKeys.payments.status(paymentId),
      queryFn: () => paymentApi.getPaymentStatus(paymentId),
      enabled: !!paymentId,
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: (data) => {
        // Stop polling if payment is completed or failed
        if (data?.status === 'succeeded' || data?.status === 'failed' || data?.status === 'canceled') {
          return false;
        }
        // Poll every 5 seconds for pending payments
        return 5000;
      },
    });
  };

  // Calculate tax query
  const useTaxCalculation = (amount: number, currency: string, country: string) => {
    return useQuery({
      queryKey: queryKeys.payments.taxCalculation(amount, currency, country),
      queryFn: () => paymentApi.calculateTax({ amount, currency, country_code: country }),
      enabled: !!(amount && currency && country),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Create checkout session mutation
  const useCreateCheckoutSession = () => {
    return useMutation({
      mutationFn: (data: CreateCheckoutSessionRequest) => paymentApi.createCheckoutSession(data),
      onSuccess: (data) => {
        if (data?.id) {
          // Invalidate payment status for the new payment
          queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(data.id) });
        }
      },
    });
  };

  // Create payment intent mutation
  const useCreatePaymentIntent = () => {
    return useMutation({
      mutationFn: (data: CreatePaymentIntentRequest) => paymentApi.createPaymentIntent(data),
      onSuccess: (data) => {
        if (data?.id) {
          // Invalidate payment status for the new payment
          queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(data.id) });
        }
      },
    });
  };

  // Create refund mutation
  const useCreateRefund = () => {
    return useMutation({
      mutationFn: ({ paymentId, data }: { paymentId: number; data: PaymentRefundRequest }) => 
        paymentApi.createRefund(paymentId, data),
      onSuccess: (_, { paymentId }) => {
        // Invalidate payment status to reflect refund
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(paymentId) });
      },
    });
  };

  // Retry webhooks mutation
  const useRetryWebhooks = () => {
    return useMutation({
      mutationFn: () => paymentApi.retryWebhooks(),
    });
  };

  return {
    // Queries
    usePaymentStatus,
    useTaxCalculation,
    
    // Mutations
    useCreateCheckoutSession,
    useCreatePaymentIntent,
    useCreateRefund,
    useRetryWebhooks,
  };
};
