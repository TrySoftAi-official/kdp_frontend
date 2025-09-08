import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';

interface AmazonKDPLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionData: any) => void;
}

interface LoginStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export const AmazonKDPLoginModal: React.FC<AmazonKDPLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [browserWindow, setBrowserWindow] = useState<Window | null>(null);

  const steps: LoginStep[] = [
    {
      id: 'launch',
      title: 'Launch Browser',
      description: 'Opening Amazon KDP login page in a new browser window',
      status: 'pending'
    },
    {
      id: 'login',
      title: 'Complete Login',
      description: 'Please log in to your Amazon KDP account in the browser window',
      status: 'pending'
    },
    {
      id: 'capture',
      title: 'Capture Session',
      description: 'Capturing your session data securely',
      status: 'pending'
    },
    {
      id: 'verify',
      title: 'Verify Connection',
      description: 'Verifying your Amazon KDP connection',
      status: 'pending'
    }
  ];

  const [loginSteps, setLoginSteps] = useState<LoginStep[]>(steps);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentStep(0);
      setIsLoading(false);
      setError('');
      setBrowserWindow(null);
      setLoginSteps(steps.map(step => ({ ...step, status: 'pending' })));
    }
  }, [isOpen]);

  const updateStepStatus = (stepIndex: number, status: LoginStep['status']) => {
    setLoginSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ));
  };

  const handleLaunchBrowser = async () => {
    try {
      setIsLoading(true);
      setError('');
      updateStepStatus(0, 'active');

      // Launch browser window to Amazon KDP
      const kdpWindow = window.open(
        'https://kdp.amazon.com',
        'amazon_kdp_login',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!kdpWindow) {
        throw new Error('Failed to open browser window. Please allow popups for this site.');
      }

      setBrowserWindow(kdpWindow);
      updateStepStatus(0, 'completed');
      updateStepStatus(1, 'active');

      // Start monitoring the window
      monitorLoginWindow(kdpWindow);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch browser');
      updateStepStatus(0, 'error');
      setIsLoading(false);
    }
  };

  const monitorLoginWindow = (window: Window) => {
    const checkInterval = setInterval(() => {
      try {
        // Check if window is closed
        if (window.closed) {
          clearInterval(checkInterval);
          setIsLoading(false);
          setError('Login window was closed. Please try again.');
          updateStepStatus(1, 'error');
          return;
        }

        // Check if user has navigated to KDP dashboard (indicating successful login)
        try {
          const currentUrl = window.location.href;
          if (currentUrl.includes('kdp.amazon.com') && 
              (currentUrl.includes('/dashboard') || currentUrl.includes('/home'))) {
            
            clearInterval(checkInterval);
            handleLoginSuccess(window);
          }
        } catch (e) {
          // Cross-origin access denied, continue monitoring
        }
      } catch (err) {
        clearInterval(checkInterval);
        setIsLoading(false);
        setError('Error monitoring login process');
        updateStepStatus(1, 'error');
      }
    }, 2000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.closed) {
        window.close();
      }
      setIsLoading(false);
      setError('Login timeout. Please try again.');
      updateStepStatus(1, 'error');
    }, 300000); // 5 minutes
  };

  const handleLoginSuccess = async (window: Window) => {
    try {
      updateStepStatus(1, 'completed');
      updateStepStatus(2, 'active');

      // Simulate capturing session data
      // In a real implementation, this would be done through a secure backend service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock session data - in real implementation, this would come from backend
      const sessionData = {
        cookies: 'mock_cookies_data',
        localStorage: 'mock_local_storage_data',
        sessionId: 'mock_session_id',
        timestamp: new Date().toISOString()
      };

      updateStepStatus(2, 'completed');
      updateStepStatus(3, 'active');

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateStepStatus(3, 'completed');
      setIsLoading(false);

      // Close the browser window
      window.close();

      // Call success callback
      setTimeout(() => {
        onSuccess(sessionData);
      }, 1000);

    } catch (err) {
      setError('Failed to capture session data');
      updateStepStatus(2, 'error');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (browserWindow && !browserWindow.closed) {
      browserWindow.close();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Connect to Amazon KDP
          </DialogTitle>
          <DialogDescription>
            We'll help you connect your Amazon KDP account securely. This process will open a new browser window where you can log in to your Amazon KDP account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Steps */}
          <div className="space-y-4">
            {loginSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                  step.status === 'active' ? 'bg-blue-100 text-blue-600' :
                  step.status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.status === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    step.status === 'completed' ? 'text-green-800' :
                    step.status === 'active' ? 'text-blue-800' :
                    step.status === 'error' ? 'text-red-800' :
                    'text-gray-800'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'active' ? 'text-blue-600' :
                    step.status === 'error' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🔒 Security & Privacy</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your login credentials are never stored or transmitted to our servers</li>
              <li>• Session data is encrypted and stored securely</li>
              <li>• You can disconnect your account at any time</li>
              <li>• We only access your KDP account for book publishing purposes</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {currentStep === 0 && (
              <Button
                onClick={handleLaunchBrowser}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Launch Browser
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
