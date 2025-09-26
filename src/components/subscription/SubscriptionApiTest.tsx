import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { toast } from '@/utils/toast';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const SubscriptionApiTest: React.FC = () => {
  const subscriptionApi = useSubscriptionApi();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    try {
      const result = await testFunction();
      setTestResults(prev => [...prev, {
        test: testName,
        success: true,
        message: 'Test passed successfully',
        data: result
      }]);
      toast.success(`${testName} test passed`);
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        test: testName,
        success: false,
        message: 'Test failed',
        error: error.message || 'Unknown error'
      }]);
      toast.error(`${testName} test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Get Subscription Plans',
        test: () => subscriptionApi.getSubscriptionPlans(true)
      },
      {
        name: 'Get My Subscription',
        test: () => subscriptionApi.getMySubscription()
      },
      {
        name: 'Get Subscription Status',
        test: () => subscriptionApi.getMySubscriptionStatus()
      },
      {
        name: 'Get My Features',
        test: () => subscriptionApi.getMyFeatures()
      },
      {
        name: 'Check Usage Limits',
        test: () => subscriptionApi.checkUsageLimits({
          usage_type: 'book_creation',
          increment: false
        })
      },
      {
        name: 'Validate Access',
        test: () => subscriptionApi.validateSubscriptionAccess('create_book')
      },
      {
        name: 'Get Billing History',
        test: () => subscriptionApi.getBillingHistory(5)
      }
    ];

    for (const test of tests) {
      await runTest(test.name, test.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    toast.success('All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription API Test</h2>
          <p className="text-muted-foreground">
            Test all subscription API endpoints
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </Button>
          <Button 
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
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
        </div>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Results
          </CardTitle>
          <CardDescription>
            Results from subscription API tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tests run yet. Click "Run All Tests" to start testing the subscription API.
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge 
                      variant={result.success ? 'default' : 'destructive'}
                      className={result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {result.message}
                  </div>

                  {result.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {result.error}
                    </div>
                  )}

                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                        View Response Data
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-blue-600">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.success).length}
                </div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {subscriptionApi.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">API Error:</span>
              <span>{subscriptionApi.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionApiTest;

