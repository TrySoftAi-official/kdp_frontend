import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationResult {
  user_authenticated: boolean;
  subscription_plan: string;
  can_generate_books: boolean;
  message: string;
  upgrade_required: boolean;
}

interface Manuscript {
  title: string;
  subtitle: string;
  description: string;
  table_of_contents: Array<{
    chapter: number;
    title: string;
    page: number;
  }>;
  chapters: Array<{
    number: number;
    title: string;
    content: string;
    word_count: number;
    sections: string[];
    estimated_reading_time: string;
  }>;
  word_count: number;
  estimated_reading_time: string;
  target_audience: string;
  niche: string;
  genre: string;
  language: string;
}

interface GenerationResult {
  status: string;
  message: string;
  manuscript: Manuscript;
  metadata: {
    generated_at: string;
    user_id: number;
    subscription_plan: string;
    word_count: number;
    chapters: number;
    generation_time: string;
  };
}

const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(5000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [generatedManuscript, setGeneratedManuscript] = useState<Manuscript | null>(null);
  const [showManuscript, setShowManuscript] = useState(false);

  // Validate user on component mount
  useEffect(() => {
    validateUser();
  }, [user]);

  const validateUser = async () => {
    if (!user) return;
    
    setIsValidating(true);
    try {
      const response = await fetch('/api/books/intelligent-assistant/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
      } else {
        console.error('Failed to validate user');
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please provide a book prompt');
      return;
    }

    if (!validationResult?.can_generate_books) {
      alert('Upgrade your plan to generate books');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/books/intelligent-assistant/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          word_count: wordCount,
        }),
      });

      if (response.ok) {
        const result: GenerationResult = await response.json();
        setGeneratedManuscript(result.manuscript);
        setShowManuscript(true);
        alert('Book manuscript generated successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to generate book');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating book manuscript');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!validationResult) return <XCircle className="h-4 w-4 text-gray-400" />;
    if (validationResult.user_authenticated && validationResult.can_generate_books) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusMessage = () => {
    if (isValidating) return 'Validating user...';
    if (!validationResult) return 'Not validated';
    if (!validationResult.user_authenticated) return 'Please log in to Amazon KDP to continue';
    if (validationResult.upgrade_required) return 'Upgrade your plan to generate books';
    return 'Ready to generate books';
  };

  const getStatusColor = () => {
    if (isValidating) return 'bg-blue-100 text-blue-800';
    if (!validationResult) return 'bg-gray-100 text-gray-800';
    if (validationResult.user_authenticated && validationResult.can_generate_books) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          Intelligent Publishing Assistant
        </h1>
        <p className="text-gray-600">
          Generate high-quality book content with AI-powered assistance
        </p>
      </div>

      {/* User Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            User Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Authentication:</span>
              <Badge className={getStatusColor()}>
                {getStatusMessage()}
              </Badge>
            </div>
            
            {validationResult && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subscription Plan:</span>
                  <Badge variant="outline">
                    {validationResult.subscription_plan.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Book Generation:</span>
                  <Badge variant={validationResult.can_generate_books ? "default" : "secondary"}>
                    {validationResult.can_generate_books ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Book Generation
          </CardTitle>
          <CardDescription>
            Provide a detailed description of your book idea, topic, audience, and niche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Book Prompt *
            </label>
            <Textarea
              id="prompt"
              placeholder="Write a guide for digital nomads on how to earn passive income through self-publishing, targeting beginners in the travel and finance niche."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium mb-2">
              Word Count
            </label>
            <Input
              id="wordCount"
              type="number"
              min="1000"
              max="50000"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 5000)}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Target word count for your manuscript (1,000 - 50,000 words)
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !validationResult?.can_generate_books || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Manuscript...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Book Manuscript
              </>
            )}
          </Button>

          {validationResult?.upgrade_required && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-yellow-800">
                  You need to upgrade to a Pro or Enterprise plan to generate books.
                  <Button variant="link" className="p-0 ml-2 text-yellow-600 hover:text-yellow-700">
                    Upgrade Now
                  </Button>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Manuscript */}
      {generatedManuscript && showManuscript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Generated Manuscript
            </CardTitle>
            <CardDescription>
              Your AI-generated book manuscript is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Book Overview */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{generatedManuscript.title}</h2>
                <p className="text-lg text-gray-600">{generatedManuscript.subtitle}</p>
              </div>
              
              <p className="text-gray-700">{generatedManuscript.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{generatedManuscript.word_count.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{generatedManuscript.chapters.length}</div>
                  <div className="text-sm text-gray-500">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{generatedManuscript.estimated_reading_time}</div>
                  <div className="text-sm text-gray-500">Reading Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{generatedManuscript.niche}</div>
                  <div className="text-sm text-gray-500">Niche</div>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Table of Contents</h3>
              <div className="space-y-2">
                {generatedManuscript.table_of_contents.map((item) => (
                  <div key={item.chapter} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Chapter {item.chapter}: {item.title}</span>
                    <span className="text-sm text-gray-500">Page {item.page}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Chapter Preview</h3>
              <div className="space-y-4">
                {generatedManuscript.chapters.slice(0, 2).map((chapter) => (
                  <div key={chapter.number} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">
                      Chapter {chapter.number}: {chapter.title}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {chapter.word_count} words • {chapter.estimated_reading_time} reading time
                    </div>
                    <div className="prose max-w-none">
                      <div 
                        className="text-sm text-gray-700 line-clamp-4"
                        dangerouslySetInnerHTML={{ 
                          __html: chapter.content.replace(/\n/g, '<br>').substring(0, 500) + '...' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowManuscript(false)} variant="outline">
                Close Preview
              </Button>
              <Button>
                Save Manuscript
              </Button>
              <Button variant="secondary">
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentAssistant;
