import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  CreditCard, 
  Database, 
  Network, 
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PaymentDebugger } from '@/components/debug/PaymentDebugger';
import { PaymentFlowTester } from '@/components/debug/PaymentFlowTester';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export const DebugPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              You must be logged in to access the debug tools.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bug className="h-8 w-8 text-blue-600" />
              Debug Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive debugging tools for the payment system
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Development Mode
          </Badge>
        </div>

        {/* System Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              System Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-muted-foreground">API Status</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user ? 'Authenticated' : 'Not Authenticated'}
                </div>
                <div className="text-sm text-muted-foreground">User Status</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Active</div>
                <div className="text-sm text-muted-foreground">Payment System</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">Ready</div>
                <div className="text-sm text-muted-foreground">Debug Tools</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Debug
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Flow Tester
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Debug Tools Overview</CardTitle>
                <CardDescription>
                  Available debugging tools and their purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Payment Debugger</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comprehensive debugging tool for payment system components, API status, and user authentication.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('payment')}
                      className="w-full"
                    >
                      Open Payment Debugger
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Flow Tester</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test the complete payment flow from plan selection to checkout session creation.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('flow')}
                      className="w-full"
                    >
                      Open Flow Tester
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Diagnostics</CardTitle>
                <CardDescription>
                  Quick checks for common issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>User Authentication</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {user ? 'Authenticated' : 'Not Authenticated'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Browser Environment</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {typeof window !== 'undefined' ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Clipboard API</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {navigator.clipboard ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Console Logging</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <PaymentDebugger />
          </TabsContent>

          <TabsContent value="flow">
            <PaymentFlowTester />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Current system state and configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Environment</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <span className="font-mono">{process.env.NODE_ENV || 'development'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Origin:</span>
                        <span className="font-mono">{window.location.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>User Agent:</span>
                        <span className="font-mono text-xs">{navigator.userAgent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timestamp:</span>
                        <span className="font-mono">{new Date().toISOString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>User ID:</span>
                        <span className="font-mono">{user?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-mono">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-mono">{user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authenticated:</span>
                        <Badge className={user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Available API endpoints for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 border rounded">
                    <span>GET /subscription/plans</span>
                    <Badge variant="outline">Plans</Badge>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>GET /subscription/my-subscription</span>
                    <Badge variant="outline">User Subscription</Badge>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>POST /payment/create-checkout-session</span>
                    <Badge variant="outline">Checkout</Badge>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <span>POST /payment/webhook</span>
                    <Badge variant="outline">Webhooks</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Warning Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Development Tools</h3>
                <p className="text-sm">
                  These debugging tools are for development purposes only. 
                  Do not use in production environments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};
