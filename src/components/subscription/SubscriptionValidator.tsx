import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { toast } from '@/utils/toast';

interface SubscriptionValidatorProps {
  onValidationResult?: (action: string, canPerform: boolean, message: string) => void;
  className?: string;
}

interface ValidationResult {
  action: string;
  can_perform: boolean;
  message: string;
  user_id: number;
}

export const SubscriptionValidator: React.FC<SubscriptionValidatorProps> = ({
  onValidationResult,
  className = ''
}) => {
  const subscriptionApi = useSubscriptionApi();
  
  // State
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  // Common actions to validate
  const commonActions = [
    'create_book',
    'upload_file',
    'access_analytics',
    'use_api',
    'custom_branding',
    'priority_support',
    'bulk_operations',
    'export_data',
    'advanced_features'
  ];

  const validateAction = async (action: string) => {
    setIsValidating(true);
    try {
      const result = await subscriptionApi.validateSubscriptionAccess(action);
      
      if (result) {
        setValidationResults(prev => ({
          ...prev,
          [action]: result
        }));
        
        onValidationResult?.(action, result.can_perform, result.message);
        
        if (!result.can_perform) {
          toast.error(result.message || `Access denied for ${action}`);
        } else {
          toast.success(`Access granted for ${action}`);
        }
      } else {
        toast.error(subscriptionApi.error || 'Failed to validate access');
      }
    } catch (error) {
      toast.error('Failed to validate access');
    } finally {
      setIsValidating(false);
    }
  };

  const validateAllActions = async () => {
    setIsLoading(true);
    try {
      // Validate actions sequentially with small delays to avoid overwhelming the API
      for (let i = 0; i < commonActions.length; i++) {
        await validateAction(commonActions[i]);
        // Add small delay between validations to prevent API overload
        if (i < commonActions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      toast.success('All actions validated successfully');
    } catch (error) {
      toast.error('Failed to validate some actions');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      create_book: <CheckCircle className="h-4 w-4" />,
      upload_file: <CheckCircle className="h-4 w-4" />,
      access_analytics: <CheckCircle className="h-4 w-4" />,
      use_api: <CheckCircle className="h-4 w-4" />,
      custom_branding: <CheckCircle className="h-4 w-4" />,
      priority_support: <CheckCircle className="h-4 w-4" />,
      bulk_operations: <CheckCircle className="h-4 w-4" />,
      export_data: <CheckCircle className="h-4 w-4" />,
      advanced_features: <CheckCircle className="h-4 w-4" />,
    };
    return icons[action] || <Shield className="h-4 w-4" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_book: 'Create Book',
      upload_file: 'Upload File',
      access_analytics: 'Access Analytics',
      use_api: 'Use API',
      custom_branding: 'Custom Branding',
      priority_support: 'Priority Support',
      bulk_operations: 'Bulk Operations',
      export_data: 'Export Data',
      advanced_features: 'Advanced Features',
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionDescription = (action: string) => {
    const descriptions: Record<string, string> = {
      create_book: 'Create new books using AI generation',
      upload_file: 'Upload files to the platform',
      access_analytics: 'View detailed analytics and reports',
      use_api: 'Access the platform API',
      custom_branding: 'Use custom branding features',
      priority_support: 'Access priority customer support',
      bulk_operations: 'Perform bulk operations',
      export_data: 'Export data from the platform',
      advanced_features: 'Access advanced platform features',
    };
    return descriptions[action] || `Perform ${action.replace(/_/g, ' ')}`;
  };

  const visibleActions = showAllResults ? commonActions : commonActions.slice(0, 6);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Validation</h2>
          <p className="text-muted-foreground">
            Validate your subscription access for different features
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllResults(!showAllResults)}
          >
            {showAllResults ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show All
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={validateAllActions}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Validate All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Feature Access Validation
          </CardTitle>
          <CardDescription>
            Check which features you can access with your current subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleActions.map((action) => {
              const result = validationResults[action];
              const hasResult = !!result;
              const canPerform = result?.can_perform ?? false;
              
              return (
                <div key={action} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionIcon(action)}
                      <div>
                        <div className="font-medium">{getActionLabel(action)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getActionDescription(action)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasResult ? (
                        <Badge 
                          className={canPerform ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        >
                          {canPerform ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Allowed
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Denied
                            </>
                          )}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          <Lock className="h-3 w-3 mr-1" />
                          Not Checked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Result Message */}
                  {hasResult && result.message && (
                    <div className={`text-sm p-3 rounded-lg mb-3 ${
                      canPerform ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {result.message}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => validateAction(action)}
                    disabled={isValidating}
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : hasResult ? (
                      'Re-validate'
                    ) : (
                      'Validate Access'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {Object.keys(validationResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Validation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(validationResults).filter(r => r.can_perform).length}
                </div>
                <div className="text-sm text-green-600">Allowed</div>
                <div className="text-xs text-muted-foreground">Features you can use</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(validationResults).filter(r => !r.can_perform).length}
                </div>
                <div className="text-sm text-red-600">Denied</div>
                <div className="text-xs text-muted-foreground">Features you can't use</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(validationResults).length}
                </div>
                <div className="text-sm text-blue-600">Total Checked</div>
                <div className="text-xs text-muted-foreground">Features validated</div>
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
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{subscriptionApi.error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionValidator;

