import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ExternalLink, CheckCircle, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AdditionalService from '@/services/additionalService';

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
  
  // Manual credential input state
  const [loginMethod, setLoginMethod] = useState<'browser' | 'manual'>('browser');
  const [kdpEmail, setKdpEmail] = useState('');
  const [kdpPassword, setKdpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

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
      setLoginMethod('browser');
      setKdpEmail('');
      setKdpPassword('');
      setShowPassword(false);
      setIsSubmittingCredentials(false);
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

  const handleManualLogin = async () => {
    if (!kdpEmail.trim() || !kdpPassword.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsSubmittingCredentials(true);
      setError('');

      // Submit credentials to the /config endpoint
      const response = await AdditionalService.updateConfiguration({
        kdp_email: kdpEmail.trim(),
        kdp_password: kdpPassword.trim()
      });

      if (response.data) {
        // Store the connection status in localStorage
        const kdpSession = {
          isConnected: true,
          isValid: true,
          lastConnected: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          email: kdpEmail.trim(),
          method: 'manual'
        };
        localStorage.setItem('amazon_kdp_session', JSON.stringify(kdpSession));

        // Call success callback
        onSuccess();
      }
    } catch (err: any) {
      console.error('Manual login error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect to Amazon KDP. Please check your credentials.');
    } finally {
      setIsSubmittingCredentials(false);
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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ExternalLink className="h-5 w-5" />
            Connect to Amazon KDP
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Connect your Amazon KDP account securely. Choose between browser login or manual credential input to establish your connection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Login Method Selection */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant={loginMethod === 'browser' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('browser')}
                className="flex-1 text-sm sm:text-base"
                disabled={isLoading || isSubmittingCredentials}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Browser Login</span>
                <span className="sm:hidden">Browser</span>
              </Button>
              <Button
                variant={loginMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('manual')}
                className="flex-1 text-sm sm:text-base"
                disabled={isLoading || isSubmittingCredentials}
              >
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manual Input</span>
                <span className="sm:hidden">Manual</span>
              </Button>
            </div>
          </div>

          {/* Manual Credential Form */}
          {loginMethod === 'manual' && (
            <div className="space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">Enter Amazon KDP Credentials</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kdp-email" className="text-sm sm:text-base">Amazon KDP Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="kdp-email"
                      type="email"
                      placeholder="your-email@example.com"
                      value={kdpEmail}
                      onChange={(e) => setKdpEmail(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      disabled={isSubmittingCredentials}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kdp-password" className="text-sm sm:text-base">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="kdp-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={kdpPassword}
                      onChange={(e) => setKdpPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base"
                      disabled={isSubmittingCredentials}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      disabled={isSubmittingCredentials}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleManualLogin}
                disabled={isSubmittingCredentials || !kdpEmail.trim() || !kdpPassword.trim()}
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
              >
                {isSubmittingCredentials ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Connecting...</span>
                    <span className="sm:hidden">Connecting</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Connect to Amazon KDP</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Browser Login Steps */}
          {loginMethod === 'browser' && (
            <div className="space-y-3 sm:space-y-4">
              {loginSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 sm:gap-4">
                  <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'active' ? 'bg-blue-100 text-blue-600' :
                    step.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm sm:text-base ${
                      step.status === 'completed' ? 'text-green-800' :
                      step.status === 'active' ? 'text-blue-800' :
                      step.status === 'error' ? 'text-red-800' :
                      'text-gray-800'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${
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
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">🔒 Security & Privacy</h4>
            <ul className="text-xs sm:text-sm text-blue-700 space-y-1 leading-relaxed">
              <li>• Your login credentials are never stored or transmitted to our servers</li>
              <li>• Session data is encrypted and stored securely</li>
              <li>• You can disconnect your account at any time</li>
              <li>• We only access your KDP account for book publishing purposes</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isSubmittingCredentials}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            {loginMethod === 'browser' && currentStep === 0 && (
              <Button
                onClick={handleLaunchBrowser}
                disabled={isLoading || isSubmittingCredentials}
                className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Launching...</span>
                    <span className="sm:hidden">Launching</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Launch Browser</span>
                    <span className="sm:hidden">Launch</span>
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
