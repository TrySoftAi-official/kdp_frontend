// Basic test to verify subscription service imports work correctly
import { subscriptionService } from '../subscriptionService';

describe('SubscriptionService', () => {
  it('should import without errors', () => {
    expect(subscriptionService).toBeDefined();
    expect(subscriptionService.getSubscriptionPlans).toBeDefined();
    expect(subscriptionService.getMySubscription).toBeDefined();
  });

  it('should have correct base URL', () => {
    expect(subscriptionService.baseUrl).toBe('/subscription');
  });

  it('should have utility methods', () => {
    expect(subscriptionService.formatCurrency).toBeDefined();
    expect(subscriptionService.formatDate).toBeDefined();
    expect(subscriptionService.getPlanLabel).toBeDefined();
  });
});
