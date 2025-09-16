import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Settings, 
  BarChart3, 
  MessageCircle, 
  Palette, 
  Code,
  BookOpen,
  Crown,
  Zap,
  Shield
} from 'lucide-react';
import { EnhancedSubscriptionManager } from '@/components/subscription/EnhancedSubscriptionManager';
import { SubscriptionStatusWidget } from '@/components/subscription/SubscriptionStatusWidget';
import { FeatureGate, UsageGate, ConditionalFeature, ConditionalUsage } from '@/components/shared/FeatureGate';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { toast } from '@/lib/toast';

export const SubscriptionDemo: React.FC = () => {
  const { 
    hasFeatureAccess, 
    enforceFeatureAccess, 
    enforceUsageLimit, 
    getUsageInfo, 
    getCurrentPlan,
    getSubscriptionStatus 
  } = useFeatureEnforcement();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Demo functions to test feature enforcement
  const handleAnalyticsAccess = async () => {
    const hasAccess = enforceFeatureAccess('analytics', {
      showUpgradeModal: true,
      onUpgrade: () => setShowUpgradeModal(true)
    });
    
    if (hasAccess) {
      toast.success('Accessing analytics dashboard...');
    }
  };

  const handleCreateBook = async () => {
    const canCreate = await enforceUsageLimit('books_created', {
      showUpgradeModal: true,
      onUpgrade: () => setShowUpgradeModal(true)
    });
    
    if (canCreate) {
      toast.success('Creating new book...');
    }
  };

  const handlePrioritySupport = async () => {
    const hasAccess = enforceFeatureAccess('priority_support', {
      showUpgradeModal: true,
      onUpgrade: () => setShowUpgradeModal(true)
    });
    
    if (hasAccess) {
      toast.success('Connecting to priority support...');
    }
  };

  const handleCustomBranding = async () => {
    const hasAccess = enforceFeatureAccess('custom_branding', {
      showUpgradeModal: true,
      onUpgrade: () => setShowUpgradeModal(true)
    });
    
    if (hasAccess) {
      toast.success('Opening custom branding settings...');
    }
  };

  const handleApiAccess = async () => {
    const hasAccess = enforceFeatureAccess('api_access', {
      showUpgradeModal: true,
      onUpgrade: () => setShowUpgradeModal(true)
    });
    
    if (hasAccess) {
      toast.success('Generating API key...');
    }
  };

  const currentPlan = getCurrentPlan();
  const subscriptionStatus = getSubscriptionStatus();
  const booksUsage = getUsageInfo('books_created');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">ForgeKDP Subscription System Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the complete subscription flow with feature enforcement, usage limits, 
          and seamless upgrade/downgrade functionality.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Gates</TabsTrigger>
          <TabsTrigger value="usage">Usage Limits</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Current Status
                </CardTitle>
                <CardDescription>
                  Your current subscription and plan information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plan:</span>
                  <span className="font-semibold">{currentPlan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${subscriptionStatus.color}`}>
                    {subscriptionStatus.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Books Used:</span>
                  <span className="font-semibold">
                    {booksUsage.current} / {booksUsage.isUnlimited ? '∞' : booksUsage.limit}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Test feature access and usage limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleCreateBook}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Book
                </Button>
                <Button 
                  onClick={handleAnalyticsAccess}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  onClick={handlePrioritySupport}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Priority Support
                </Button>
                <Button 
                  onClick={handleCustomBranding}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Custom Branding
                </Button>
                <Button 
                  onClick={handleApiAccess}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Code className="h-4 w-4 mr-2" />
                  API Access
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionStatusWidget 
              showUpgradeButton={true}
              showUsageDetails={true}
              compact={false}
            />
            <SubscriptionStatusWidget 
              showUpgradeButton={true}
              showUsageDetails={true}
              showManagementActions={true}
              compact={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analytics Feature Gate */}
            <FeatureGate feature="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    Detailed analytics and reporting features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View detailed analytics, conversion rates, and performance metrics.
                    </p>
                    <Button className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Open Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Priority Support Feature Gate */}
            <FeatureGate feature="priority_support">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Priority Support
                  </CardTitle>
                  <CardDescription>
                    Get help faster with priority support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect with our support team with faster response times.
                    </p>
                    <Button className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Custom Branding Feature Gate */}
            <FeatureGate feature="custom_branding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Custom Branding
                  </CardTitle>
                  <CardDescription>
                    White-label your publishing experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                      <Palette className="h-12 w-12 text-purple-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customize your branding and create a white-label experience.
                    </p>
                    <Button className="w-full">
                      <Palette className="h-4 w-4 mr-2" />
                      Customize Branding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* API Access Feature Gate */}
            <FeatureGate feature="api_access">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    API Access
                  </CardTitle>
                  <CardDescription>
                    Integrate with our powerful API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                      <Code className="h-12 w-12 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access our API for custom integrations and automation.
                    </p>
                    <Button className="w-full">
                      <Code className="h-4 w-4 mr-2" />
                      Generate API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>

          {/* Conditional Features */}
          <Card>
            <CardHeader>
              <CardTitle>Conditional Features</CardTitle>
              <CardDescription>
                Features that show/hide based on subscription level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ConditionalFeature feature="analytics">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Analytics Available</p>
                  </div>
                </ConditionalFeature>
                
                <ConditionalFeature feature="priority_support">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Priority Support</p>
                  </div>
                </ConditionalFeature>
                
                <ConditionalFeature feature="api_access">
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <Code className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">API Access</p>
                  </div>
                </ConditionalFeature>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Books Usage Gate */}
            <UsageGate usageType="books_created">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Create New Book
                  </CardTitle>
                  <CardDescription>
                    Create and publish your next book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-indigo-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start creating your next book with our AI-powered tools.
                    </p>
                    <Button className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </UsageGate>

            {/* Conditional Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Status</CardTitle>
                <CardDescription>
                  Current usage across different features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ConditionalUsage usageType="books_created">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Books Created</span>
                      </div>
                      <p className="text-sm text-green-700">
                        You can create more books this period.
                      </p>
                    </div>
                  </ConditionalUsage>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <EnhancedSubscriptionManager 
            onSubscriptionChange={() => {
              toast.success('Subscription updated successfully!');
            }}
            showUpgradePrompt={true}
          />
        </TabsContent>
      </Tabs>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          setShowUpgradeModal(false);
          toast.success('Subscription upgraded successfully!');
        }}
        triggerSource="subscription_demo"
      />
    </div>
  );
};
