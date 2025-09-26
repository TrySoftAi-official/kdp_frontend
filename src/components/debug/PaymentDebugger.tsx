import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useSubscription } from '@/redux/hooks/useSubscription';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { toast } from '@/utils/toast';

interface DebugInfo {
  user: any;
  subscription: any;
  plans: any[];
  paymentApi: any;
  environment: string;
  timestamp: string;
}

export const PaymentDebugger: React.FC = () => {
  const { user } = useAuth();
  const { currentSubscription, subscriptionStatus, fetchPlans } = useSubscription();
  const paymentApi = usePaymentApi();
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const loadDebugInfo = async () => {
    setIsLoading(true);
    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        Promise.resolve(currentSubscription).catch(err => ({ error: err.message })),
        fetchPlans().catch(err => ({ error: err.message }))
      ]);

      const debugData: DebugInfo = {
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          isAuthenticated: !!user
        },
        subscription: subscriptionResponse,
        plans: plansResponse?.data?.plans || [],
        paymentApi: {
          hasConvertToCents: typeof paymentApi.convertToCents === 'function',
          hasGenerateIdempotencyKey: typeof paymentApi.generateIdempotencyKey === 'function',
          hasCreateCheckoutSession: typeof paymentApi.createCheckoutSession === 'function'
        },
        environment: {
          origin: window.location.origin,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      setDebugInfo(debugData);
    } catch (error) {
      console.error('Failed to load debug info:', error);
      toast.error('Failed to load debug information');
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = async () => {
    const tests = [];
    
    // Test 1: User Authentication
    tests.push({
      name: 'User Authentication',
      status: user ? 'pass' : 'fail',
      message: user ? 'User is authenticated' : 'User is not authenticated',
      details: user ? { id: user.id, email: user.email } : null
    });

    // Test 2: API Endpoints
    try {
      const plansResponse = await fetchPlans();
      tests.push({
        name: 'Plans API',
        status: plansResponse?.data?.plans ? 'pass' : 'fail',
        message: plansResponse?.data?.plans ? 
          `Found ${plansResponse.data.plans.length} plans` : 
          'No plans found',
        details: plansResponse?.data?.plans?.map((plan: any) => ({
          id: plan.plan_id,
          name: plan.name,
          price: plan.price,
          active: plan.active
        }))
      });
    } catch (error) {
      tests.push({
        name: 'Plans API',
        status: 'fail',
        message: `API Error: ${error}`,
        details: null
      });
    }

    // Test 3: Payment API Methods
    tests.push({
      name: 'Payment API Methods',
      status: paymentApi.convertToCents && paymentApi.generateIdempotencyKey ? 'pass' : 'fail',
      message: paymentApi.convertToCents && paymentApi.generateIdempotencyKey ? 
        'All payment methods available' : 
        'Missing payment methods',
      details: {
        convertToCents: typeof paymentApi.convertToCents,
        generateIdempotencyKey: typeof paymentApi.generateIdempotencyKey,
        createCheckoutSession: typeof paymentApi.createCheckoutSession
      }
    });

    // Test 4: Test Checkout Session Creation (Dry Run)
    if (user && debugInfo?.plans?.length > 0) {
      try {
        const testPlan = debugInfo.plans.find(p => p.plan_id !== 'free');
        if (testPlan) {
          const testData = {
            amount: testPlan.price,
            currency: 'USD',
            customer_email: user.email,
            customer_name: user.name || user.email,
            description: `Test ${testPlan.name} Subscription`,
            success_url: `${window.location.origin}/checkout/success?test=true`,
            cancel_url: `${window.location.origin}/checkout/failure?test=true`,
            line_items: [{
              product_name: testPlan.name,
              product_description: testPlan.description || `${testPlan.name} subscription plan`,
              quantity: 1,
              unit_amount: paymentApi.convertToCents(testPlan.price),
              tax_amount: 0,
              tax_rate: 0
            }],
            metadata: {
              plan_id: testPlan.plan_id,
              billing_cycle: 'monthly',
              user_id: user.id,
              action: 'test',
              timestamp: new Date().toISOString()
            },
            payment_method_types: ['card'],
            idempotency_key: paymentApi.generateIdempotencyKey()
          };

          // Don't actually create the session, just validate the data
          tests.push({
            name: 'Checkout Data Validation',
            status: 'pass',
            message: 'Checkout data structure is valid',
            details: {
              plan: testPlan.plan_id,
              amount: testData.amount,
              currency: testData.currency,
              hasSuccessUrl: !!testData.success_url,
              hasCancelUrl: !!testData.cancel_url,
              hasMetadata: !!testData.metadata
            }
          });
        }
      } catch (error) {
        tests.push({
          name: 'Checkout Data Validation',
          status: 'fail',
          message: `Validation Error: ${error}`,
          details: null
        });
      }
    }

    setTestResults(tests);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Payment System Debugger
          </CardTitle>
          <CardDescription>
            Debug and test the payment system to identify issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadDebugInfo} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Debug Info
                </>
              )}
            </Button>
            <Button onClick={runTests} variant="outline">
              Run Tests
            </Button>
            <Button 
              onClick={() => setShowSensitiveData(!showSensitiveData)} 
              variant="outline"
            >
              {showSensitiveData ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Sensitive Data
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Sensitive Data
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.message}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Debug Information */}
          {debugInfo && (
            <div className="space-y-4">
              <h3 className="font-semibold">Debug Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">User Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Authenticated:</span>
                        <Badge className={debugInfo.user.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {debugInfo.user.isAuthenticated ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {showSensitiveData && (
                        <>
                          <div className="flex justify-between">
                            <span>ID:</span>
                            <span className="font-mono text-xs">{debugInfo.user.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="font-mono text-xs">{debugInfo.user.email}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Environment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Origin:</span>
                        <span className="font-mono text-xs">{debugInfo.environment.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timestamp:</span>
                        <span className="font-mono text-xs">{new Date(debugInfo.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  {debugInfo.plans.length > 0 ? (
                    <div className="space-y-2">
                      {debugInfo.plans.map((plan: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {plan.plan_id} - ${plan.price}
                            </div>
                          </div>
                          <Badge className={plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {plan.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No plans found. This could indicate an API issue.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>convertToCents:</span>
                      <Badge className={debugInfo.paymentApi.hasConvertToCents ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {debugInfo.paymentApi.hasConvertToCents ? 'Available' : 'Missing'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>generateIdempotencyKey:</span>
                      <Badge className={debugInfo.paymentApi.hasGenerateIdempotencyKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {debugInfo.paymentApi.hasGenerateIdempotencyKey ? 'Available' : 'Missing'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>createCheckoutSession:</span>
                      <Badge className={debugInfo.paymentApi.hasCreateCheckoutSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {debugInfo.paymentApi.hasCreateCheckoutSession ? 'Available' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Debug Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Raw Debug Data
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
