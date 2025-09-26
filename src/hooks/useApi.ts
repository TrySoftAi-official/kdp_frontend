import { useAuthQuery } from './useAuthQuery';
import { useUserQuery } from './useUserQuery';
import { useBooksQuery } from './useBooksQuery';
import { usePaymentQuery } from './usePaymentQuery';

/**
 * Comprehensive API hook that provides access to all backend services
 * This hook combines all the individual service hooks for easy access
 */
export const useApi = () => {
  const auth = useAuthQuery();
  const user = useUserQuery();
  const books = useBooksQuery();
  const payments = usePaymentQuery();

  return {
    auth,
    user,
    books,
    payments,
  };
};

// Export individual hooks for direct access
export { useAuthQuery } from './useAuthQuery';
export { useUserQuery } from './useUserQuery';
export { useBooksQuery } from './useBooksQuery';
export { usePaymentQuery } from './usePaymentQuery';
