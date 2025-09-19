import React, { useState } from 'react';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle, Play, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const SubscriptionApiTester: React.FC = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [testAction, setTestAction] = useState('create_book');

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    try {
      const result = await testFunction();
      const testResult: TestResult = {
        test: testName,
        success: true,
        message: 'Test passed successfully',
        data: result
      };
      setTestResults(prev => [...prev, testResult]);
      return testResult;
    } catch (error) {
      const testResult: TestResult = {
        test: testName,
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : String(error)
      };
      setTestResults(prev => [...prev, testResult]);
      return testResult;
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast.error('Please log in to run tests');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    // Test 1: Get subscription plans
    await runTest('Get Subscription Plans', async () => {
      const plans = await subscriptionApi.getSubscriptionPlans();
      if (!plans || plans.length === 0) {
        throw new Error('No subscription plans found');
      }
      return { count: plans.length, plans: plans.map(p => ({ id: p.plan_id, name: p.name })) };
    });

    // Test 2: Get my subscription
    await runTest('Get My Subscription', async () => {
      const subscription = await subscriptionApi.getMySubscription();
      return subscription;
    });

    // Test 3: Get subscription status
    await runTest('Get Subscription Status', async () => {
      const status = await subscriptionApi.getMySubscriptionStatus();
      return status;
    });

    // Test 4: Check access for various actions
    const actions = ['create_book', 'upgrade_subscription', 'cancel_subscription', 'access_analytics'];
    for (const action of actions) {
      await runTest(`Check Access: ${action}`, async () => {
        const access = await subscriptionApi.checkAccess(action);
        return access;
      });
    }

    // Test 5: Get features
    await runTest('Get My Features', async () => {
      const features = await subscriptionApi.getMyFeatures();
      return features;
    });

    // Test 6: Check usage limits
    await runTest('Check Usage Limits', async () => {
      const usage = await subscriptionApi.checkUsageLimits({ usage_type: 'books_per_month' });
      return usage;
    });

    // Test 7: Validate subscription access
    await runTest('Validate Subscription Access', async () => {
      const validation = await subscriptionApi.validateSubscriptionAccess('create_book');
      return validation;
    });

    setIsRunning(false);
    toast.success('All tests completed!');
  };

  const testCreateSubscription = async () => {
    if (!user) {
      toast.error('Please log in to test subscription creation');
      return;
    }

    setIsRunning(true);
    
    const result = await runTest('Create Subscription', async () => {
      const response = await subscriptionApi.createSubscription({
        plan_id: selectedPlan,
        billing_cycle: selectedBillingCycle
      });
      return response;
    });

    if (result.success) {
      toast.success('Subscription creation test completed');
    } else {
      toast.error('Subscription creation test failed');
    }

    setIsRunning(false);
  };

  const testCheckAccess = async () => {
    if (!user) {
      toast.error('Please log in to test access check');
      return;
    }

    setIsRunning(true);
    
    const result = await runTest(`Check Access: ${testAction}`, async () => {
      const response = await subscriptionApi.checkAccess(testAction);
      return response;
    });

    if (result.success) {
      toast.success('Access check test completed');
    } else {
      toast.error('Access check test failed');
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getResultColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Please log in to access the API tester</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Subscription API Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-select">Test Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <Select value={selectedBillingCycle} onValueChange={(value: 'monthly' | 'yearly') => setSelectedBillingCycle(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-select">Test Action</Label>
            <Select value={testAction} onValueChange={setTestAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_book">Create Book</SelectItem>
                <SelectItem value="upgrade_subscription">Upgrade Subscription</SelectItem>
                <SelectItem value="cancel_subscription">Cancel Subscription</SelectItem>
                <SelectItem value="access_analytics">Access Analytics</SelectItem>
                <SelectItem value="use_api">Use API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex-1 min-w-[200px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>

            <Button
              onClick={testCreateSubscription}
              disabled={isRunning}
              variant="outline"
            >
              Test Create Subscription
            </Button>

            <Button
              onClick={testCheckAccess}
              disabled={isRunning}
              variant="outline"
            >
              Test Check Access
            </Button>

            <Button
              onClick={clearResults}
              disabled={isRunning}
              variant="outline"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Test Results ({testResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResultIcon(result.success)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge className={getResultColor(result.success)}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.message}
                  </p>

                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <p className="text-sm text-red-800 font-medium">Error:</p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}

                  {result.data && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionApiTester;
