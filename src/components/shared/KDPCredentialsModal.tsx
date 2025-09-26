import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import AdditionalService from '@/services/additionalService';

interface KDPCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface KDPCredentials {
  kdp_email: string;
  kdp_password: string;
}

export const KDPCredentialsModal: React.FC<KDPCredentialsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [credentials, setCredentials] = useState<KDPCredentials>({
    kdp_email: '',
    kdp_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isConnectingView, setIsConnectingView] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');

  const handleInputChange = (field: keyof KDPCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.kdp_email || !credentials.kdp_password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setIsConnectingView(true);
    // Close the first modal immediately while backend continues
    onClose();

    try {
      // Prepare the configuration payload with KDP credentials
      const configPayload = {
        kdp_email: credentials.kdp_email,
        kdp_password: credentials.kdp_password
      };

      // Send POST request to /config endpoint
      const response = await AdditionalService.updateConfiguration(configPayload);
      
      if (response?.data) {
        const data = response.data as any;
        console.log('KDP Config Response:', data);
        
        // Check for success indicators in the response
        const isValid = data?.success === true || 
                       data?.valid === true || 
                       data?.isValid === true ||
                       data?.message?.toLowerCase().includes('success') ||
                       data?.message?.toLowerCase().includes('saved') ||
                       data?.message?.toLowerCase().includes('updated');
        
        if (isValid) {
          // Store the connection status in localStorage
          const kdpSession = {
            isConnected: true,
            isValid: true,
            lastConnected: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            email: credentials.kdp_email,
            method: 'credentials'
          };
          localStorage.setItem('amazon_kdp_session', JSON.stringify(kdpSession));
          
          // Show success message
          setSuccess(true);
          console.log('KDP credentials saved successfully');
          
          // Notify parent of success after a short delay
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          const message = data?.message || data?.error || 'Invalid Amazon KDP credentials. Please try again.';
          setError(message);
          console.error('KDP credentials validation failed:', message);
          try { window.alert(message); } catch {}
        }
      } else {
        const message = 'Failed to save KDP credentials. Please try again.';
        setError(message);
        console.error('KDP config API returned no data');
        try { window.alert(message); } catch {}
      }
    } catch (error: any) {
      console.error('Error saving KDP credentials:', error);
      const message = error.response?.data?.message || error.message || 'Failed to save KDP credentials. Please check your connection and try again.';
      setError(message);
      try { window.alert(message); } catch {}
    } finally {
      setIsSubmitting(false);
      // Start polling login status if we attempted submission
      try {
        // setIsPolling(true);
        startPollingLoginStatus(credentials.kdp_email);
      } catch {}
    }
  };

  const startPollingLoginStatus = (_email: string) => {
    let attempts = 0;
    const maxAttempts = 20; // ~60s if intervalMs=3000
    const intervalMs = 3000;

    const poll = async () => {
      attempts += 1;
      console.log(`Polling KDP login status (attempt ${attempts}/${maxAttempts})`);
      
      try {
        const resp = await AdditionalServiceDefault.getKdpLoginStatus();
        const data = resp?.data as any;
        console.log('KDP Login Status Response:', data);
        
        if (data?.isConnected && data?.email) {
          const kdpSession = {
            isConnected: true,
            isValid: true,
            lastConnected: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            email: data.email || _email,
            method: 'credentials'
          };
          localStorage.setItem('amazon_kdp_session', JSON.stringify(kdpSession));
          // setIsPolling(false);
          console.log('KDP login verified successfully');
          try { onSuccess(); } catch {}
          return; // stop polling
        }

        if (data && data.isConnected === false && data.error) {
          // setIsPolling(false);
          console.error('KDP login failed:', data.error);
          try { window.alert(data.error); } catch {}
          return;
        }
      } catch (e: any) {
        console.error(`KDP login status check failed (attempt ${attempts}):`, e);
        // transient errors; continue until attempts exhausted
        if (attempts >= maxAttempts) {
          // setIsPolling(false);
          console.error('KDP login verification timed out after max attempts');
          try { window.alert(e?.message || 'Failed to verify KDP login status after multiple attempts.'); } catch {}
          return;
        }
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        // setIsPolling(false);
        console.error('KDP login verification timed out');
        try { window.alert('KDP login verification timed out. Please try again.'); } catch {}
      }
    };

    setTimeout(poll, intervalMs);
  };

  const handleRedirectToKDP = () => {
    window.open('https://kdp.amazon.com/', '_blank');
  };

  const resetModal = () => {
    setCredentials({ kdp_email: '', kdp_password: '' });
    setShowPassword(false);
    setIsSubmitting(false);
    setError('');
    setSuccess(false);
    setIsConnectingView(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="  max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Connect to Amazon KDP</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Enter your Amazon KDP credentials to enable book publishing features
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Successfully Connected!
              </h3>
              <p className="text-sm text-green-600">
                Your Amazon KDP account has been connected successfully.
              </p>
            </div>
          ) : isConnectingView ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                <span className="text-sm text-gray-700">Verifying credentials...</span>
              </div>

              <div className="space-y-2">
                <Label>Amazon KDP Email</Label>
                <Input value={credentials.kdp_email} disabled className="w-full" />
              </div>
              <div className="space-y-2">
                <Label>Amazon KDP Password</Label>
                <Input value={credentials.kdp_password} type="password" disabled className="w-full" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p>
                      Your credentials are encrypted and stored securely. They will only be used to 
                      authenticate with Amazon KDP for book publishing operations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">
                      Don't have an Amazon KDP account?
                    </h4>
                    <p className="text-sm text-blue-600">
                      Create your account on Amazon KDP first
                    </p>
                  </div>
                  <Button
                    onClick={handleRedirectToKDP}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit KDP
                  </Button>
                </div>
              </div> */}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kdp-email">Amazon KDP Email *</Label>
                  <Input
                    id="kdp-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={credentials.kdp_email}
                    onChange={(e) => handleInputChange('kdp_email', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kdp-password">Amazon KDP Password *</Label>
                  <div className="relative">
                    <Input
                      id="kdp-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={credentials.kdp_password}
                      onChange={(e) => handleInputChange('kdp_password', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>
                        Your credentials are encrypted and stored securely. They will only be used to 
                        authenticate with Amazon KDP for book publishing operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !credentials.kdp_email || !credentials.kdp_password}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Lightweight global overlay shown by parent components if desired
export const KDPConnectingOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
        <span className="text-sm text-gray-800">Connecting to Amazon KDP…</span>
      </div>
    </div>
  );
};
