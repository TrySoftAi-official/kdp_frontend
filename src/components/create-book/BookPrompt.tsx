import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { useCreateBookContext } from './CreateBookContext';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { AmazonKDPLoginModal } from './AmazonKDPLoginModal';

interface BookPromptProps {
  onGenerateBook: (prompt: any) => void;
}

interface AmazonKDPSession {
  isConnected: boolean;
  lastConnected?: string;
  expiresAt?: string;
}

export const BookPrompt: React.FC<BookPromptProps> = ({ onGenerateBook }) => {
  const { currentPrompt, setCurrentPrompt, isGenerating } = useCreateBookContext();
  const { user, isAuthenticated } = useAuth();
  const { getCurrentPlan } = usePermissions();
  
  const [amazonKDPSession, setAmazonKDPSession] = useState<AmazonKDPSession>({ isConnected: false });
  const [showKDPLoginModal, setShowKDPLoginModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Check Amazon KDP session status
  useEffect(() => {
    checkAmazonKDPSession();
  }, []);

  const checkAmazonKDPSession = async () => {
    try {
      // Check if user has valid Amazon KDP session
      const sessionData = localStorage.getItem('amazon_kdp_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (expiresAt > now) {
          setAmazonKDPSession({
            isConnected: true,
            lastConnected: session.lastConnected,
            expiresAt: session.expiresAt
          });
        } else {
          // Session expired, clear it
          localStorage.removeItem('amazon_kdp_session');
          setAmazonKDPSession({ isConnected: false });
        }
      }
    } catch (error) {
      console.error('Error checking Amazon KDP session:', error);
      setAmazonKDPSession({ isConnected: false });
    }
  };

  const handlePromptChange = (value: string) => {
    if (currentPrompt) {
      setCurrentPrompt({ ...currentPrompt, prompt: value });
    }
    setValidationMessage('');
  };

  const handleWordCountChange = (value: string) => {
    if (currentPrompt) {
      setCurrentPrompt({ ...currentPrompt, wordCount: parseInt(value) || 5000 });
    }
  };

  const validateGenerationRequirements = (): { canGenerate: boolean; message: string } => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      return { canGenerate: false, message: "Please log in to continue." };
    }

    // Check Amazon KDP connection
    if (!amazonKDPSession.isConnected) {
      return { canGenerate: false, message: "Please connect to Amazon KDP to continue." };
    }

    // Check subscription plan
    const currentPlan = getCurrentPlan();
    if (currentPlan === 'free') {
      return { canGenerate: false, message: "Upgrade your plan to generate books." };
    }

    // Check if prompt is provided
    if (!currentPrompt?.prompt?.trim()) {
      return { canGenerate: false, message: "Please provide a book description." };
    }

    return { canGenerate: true, message: "" };
  };

  const handleGenerate = () => {
    const validation = validateGenerationRequirements();
    
    if (!validation.canGenerate) {
      setValidationMessage(validation.message);
      
      // Show appropriate modal based on the issue
      if (validation.message.includes("Amazon KDP")) {
        setShowKDPLoginModal(true);
      } else if (validation.message.includes("Upgrade")) {
        // This would trigger the upgrade modal from the context
        // The context already handles this
      }
      return;
    }

    if (currentPrompt) {
      onGenerateBook(currentPrompt);
    }
  };

  const handleKDPLoginSuccess = () => {
    // Store session data
    const session = {
      isConnected: true,
      lastConnected: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    localStorage.setItem('amazon_kdp_session', JSON.stringify(session));
    setAmazonKDPSession(session);
    setShowKDPLoginModal(false);
    setValidationMessage('');
  };

  const handleKDPLogout = () => {
    localStorage.removeItem('amazon_kdp_session');
    setAmazonKDPSession({ isConnected: false });
  };

  const currentPlan = getCurrentPlan();
  const canGenerate = validateGenerationRequirements().canGenerate;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Book Prompt
          </CardTitle>
          <CardDescription>
            Generate high-quality book content with AI-powered assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`border rounded-lg p-3 ${isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isAuthenticated ? 'text-green-800' : 'text-red-800'}`}>
                  Authentication
                </span>
              </div>
              <p className={`text-xs ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? '✅ Connected' : '❌ Not logged in'}
              </p>
            </div>

            <div className={`border rounded-lg p-3 ${amazonKDPSession.isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {amazonKDPSession.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${amazonKDPSession.isConnected ? 'text-green-800' : 'text-red-800'}`}>
                  Amazon KDP
                </span>
              </div>
              <p className={`text-xs ${amazonKDPSession.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {amazonKDPSession.isConnected ? '✅ Connected' : '❌ Not connected'}
              </p>
            </div>

            <div className={`border rounded-lg p-3 ${currentPlan !== 'free' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                {currentPlan !== 'free' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={`text-sm font-medium ${currentPlan !== 'free' ? 'text-green-800' : 'text-yellow-800'}`}>
                  Subscription
                </span>
              </div>
              <p className={`text-xs ${currentPlan !== 'free' ? 'text-green-600' : 'text-yellow-600'}`}>
                {currentPlan !== 'free' ? `✅ ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan` : '⚠️ Free Plan'}
              </p>
            </div>
          </div>

          {/* Amazon KDP Connection Section */}
          {!amazonKDPSession.isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Connect to Amazon KDP</h3>
                  <p className="text-sm text-blue-600">
                    Connect your Amazon KDP account to enable book generation and publishing.
                  </p>
                </div>
                <Button
                  onClick={() => setShowKDPLoginModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          )}

          {/* Connected KDP Session Info */}
          {amazonKDPSession.isConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Amazon KDP Connected</h3>
                  <p className="text-sm text-green-600">
                    Last connected: {amazonKDPSession.lastConnected ? new Date(amazonKDPSession.lastConnected).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <Button
                  onClick={handleKDPLogout}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {/* Book Prompt Form */}
          <div className="space-y-2">
            <Label htmlFor="book-prompt">Book Description *</Label>
            <textarea
              id="book-prompt"
              placeholder="Describe your book idea, topic, target audience, niche, and any specific requirements. For example: 'Write a comprehensive guide to starting a business from scratch, targeting entrepreneurs and beginners in the business niche, with practical steps and strategies.'"
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={currentPrompt?.prompt || ''}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="word-count">Word Count</Label>
            <Input
              id="word-count"
              type="number"
              placeholder="5000"
              value={currentPrompt?.wordCount || 5000}
              onChange={(e) => handleWordCountChange(e.target.value)}
            />
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{validationMessage}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !canGenerate}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Book...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Book Manuscript
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Amazon KDP Login Modal */}
      <AmazonKDPLoginModal
        isOpen={showKDPLoginModal}
        onClose={() => setShowKDPLoginModal(false)}
        onSuccess={handleKDPLoginSuccess}
      />
    </>
  );
};
