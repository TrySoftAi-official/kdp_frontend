import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  CreditCard,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { toast } from '@/lib/toast';

interface TestStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
  duration?: number;
}

export const PaymentFlowTester: React.FC = () => {
  const { user } = useAuth();
  const subscriptionApi = useSubscriptionApi();
  const paymentApi = usePaymentApi();
  
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('');
  const [testAmount, setTestAmount] = useState<number>(9.99);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  useEffect(() => {
    loadPlans();
    if (user?.email) {
      setTestEmail(user.email);
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const response = await subscriptionApi.getSubscriptionPlans();
      if (response?.data?.plans) {
        setAvailablePlans(response.data.plans);
        if (response.data.plans.length > 0) {
          const firstPaidPlan = response.data.plans.find(p => p.plan_id !== 'free');
          if (firstPaidPlan) {
            setSelectedPlan(firstPaidPlan.plan_id);
            setTestAmount(firstPaidPlan.price);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const updateStep = (stepName: string, updates: Partial<TestStep>) => {
    setTestSteps(prev => prev.map(step => 
      step.name === stepName ? { ...step, ...updates } : step
    ));
  };

  const addStep = (step: TestStep) => {
    setTestSteps(prev => [...prev, step]);
  };

  const runPaymentFlowTest = async () => {
    if (!user) {
      toast.error('You must be logged in to run this test');
      return;
    }

    setIsRunning(true);
    setTestSteps([]);

    const startTime = Date.now();

    try {
      // Step 1: Validate User
      addStep({
        name: 'User Validation',
        status: 'running',
        message: 'Checking user authentication...'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      if (!user.email) {
        updateStep('User Validation', {
          status: 'error',
          message: 'User email is missing',
          duration: Date.now() - startTime
        });
        return;
      }

      updateStep('User Validation', {
        status: 'success',
        message: 'User is authenticated',
        details: { id: user.id, email: user.email },
        duration: Date.now() - startTime
      });

      // Step 2: Validate Plan Selection
      addStep({
        name: 'Plan Validation',
        status: 'running',
        message: 'Validating selected plan...'
      });

      const selectedPlanData = availablePlans.find(p => p.plan_id === selectedPlan);
      if (!selectedPlanData) {
        updateStep('Plan Validation', {
          status: 'error',
          message: 'Selected plan not found',
          duration: Date.now() - startTime
        });
        return;
      }

      updateStep('Plan Validation', {
        status: 'success',
        message: `Plan validated: ${selectedPlanData.name}`,
        details: { plan: selectedPlanData.plan_id, price: selectedPlanData.price },
        duration: Date.now() - startTime
      });

      // Step 3: Prepare Checkout Data
      addStep({
        name: 'Checkout Data Preparation',
        status: 'running',
        message: 'Preparing checkout session data...'
      });

      const checkoutData = {
        amount: testAmount,
        currency: 'USD',
        customer_email: testEmail,
        customer_name: user.name || user.email,
        description: `Test ${selectedPlanData.name} Subscription`,
        success_url: `${window.location.origin}/checkout/success?test=true&plan=${selectedPlan}`,
        cancel_url: `${window.location.origin}/checkout/failure?test=true&plan=${selectedPlan}`,
        line_items: [{
          product_name: selectedPlanData.name,
          product_description: selectedPlanData.description || `${selectedPlanData.name} subscription plan`,
          quantity: 1,
          unit_amount: paymentApi.convertToCents(testAmount),
          tax_amount: 0,
          tax_rate: 0
        }],
        metadata: {
          plan_id: selectedPlan,
          billing_cycle: 'monthly',
          user_id: user.id,
          action: 'test',
          timestamp: new Date().toISOString()
        },
        payment_method_types: ['card'],
        idempotency_key: paymentApi.generateIdempotencyKey()
      };

      updateStep('Checkout Data Preparation', {
        status: 'success',
        message: 'Checkout data prepared successfully',
        details: {
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          hasSuccessUrl: !!checkoutData.success_url,
          hasCancelUrl: !!checkoutData.cancel_url,
          metadataKeys: Object.keys(checkoutData.metadata)
        },
        duration: Date.now() - startTime
      });

      // Step 4: Create Checkout Session
      addStep({
        name: 'Checkout Session Creation',
        status: 'running',
        message: 'Creating Stripe checkout session...'
      });

      const checkoutSession = await paymentApi.createCheckoutSession(checkoutData);
      
      if (!checkoutSession) {
        updateStep('Checkout Session Creation', {
          status: 'error',
          message: 'Failed to create checkout session - no response',
          duration: Date.now() - startTime
        });
        return;
      }

      const checkoutUrl = checkoutSession.url || checkoutSession.data?.url;
      
      if (!checkoutUrl) {
        updateStep('Checkout Session Creation', {
          status: 'error',
          message: 'No checkout URL received',
          details: { response: checkoutSession },
          duration: Date.now() - startTime
        });
        return;
      }

      updateStep('Checkout Session Creation', {
        status: 'success',
        message: 'Checkout session created successfully',
        details: { 
          url: checkoutUrl,
          sessionId: checkoutSession.id || checkoutSession.data?.id
        },
        duration: Date.now() - startTime
      });

      // Step 5: Test URL Validity
      addStep({
        name: 'URL Validation',
        status: 'running',
        message: 'Validating checkout URL...'
      });

      try {
        const url = new URL(checkoutUrl);
        if (url.hostname.includes('stripe.com') || url.hostname.includes('checkout.stripe.com')) {
          updateStep('URL Validation', {
            status: 'success',
            message: 'Valid Stripe checkout URL',
            details: { hostname: url.hostname, protocol: url.protocol },
            duration: Date.now() - startTime
          });
        } else {
          updateStep('URL Validation', {
            status: 'error',
            message: 'Invalid checkout URL - not a Stripe URL',
            details: { url: checkoutUrl },
            duration: Date.now() - startTime
          });
        }
      } catch (error) {
        updateStep('URL Validation', {
          status: 'error',
          message: 'Invalid URL format',
          details: { url: checkoutUrl, error: error },
          duration: Date.now() - startTime
        });
      }

      // Final success message
      toast.success('Payment flow test completed successfully!');

    } catch (error) {
      console.error('Payment flow test error:', error);
      
      // Add error step
      addStep({
        name: 'Test Error',
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error },
        duration: Date.now() - startTime
      });
      
      toast.error('Payment flow test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const copyTestResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      testConfig: {
        selectedPlan,
        testEmail,
        testAmount
      },
      steps: testSteps
    };

    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    toast.success('Test results copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Flow Tester
          </CardTitle>
          <CardDescription>
            Test the complete payment flow to identify issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="plan">Test Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.plan_id} value={plan.plan_id}>
                      {plan.name} - ${plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <div>
              <Label htmlFor="amount">Test Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                placeholder="9.99"
              />
            </div>
          </div>

          {/* Run Test Button */}
          <div className="flex gap-2">
            <Button 
              onClick={runPaymentFlowTest} 
              disabled={isRunning || !user || !selectedPlan}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Payment Flow Test
                </>
              )}
            </Button>
            
            {testSteps.length > 0 && (
              <Button variant="outline" onClick={copyTestResults}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Results
              </Button>
            )}
          </div>

          {/* Test Results */}
          {testSteps.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              {testSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm text-muted-foreground">{step.message}</div>
                      {step.duration && (
                        <div className="text-xs text-muted-foreground">
                          Duration: {step.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Test Configuration Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">Selected Plan:</div>
                  <div className="text-muted-foreground">
                    {availablePlans.find(p => p.plan_id === selectedPlan)?.name || 'None'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Test Email:</div>
                  <div className="text-muted-foreground">{testEmail || 'Not set'}</div>
                </div>
                <div>
                  <div className="font-medium">Test Amount:</div>
                  <div className="text-muted-foreground">${testAmount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {availablePlans.length > 0 ? (
                <div className="space-y-2">
                  {availablePlans.map((plan, index) => (
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
                    No plans available. Please check your API connection.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
