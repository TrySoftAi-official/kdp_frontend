import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles } from 'lucide-react';
import { useCreateBookContext } from './CreateBookContext';

interface BookPromptProps {
  onGenerateBook: (prompt: any) => void;
}

export const BookPrompt: React.FC<BookPromptProps> = ({ onGenerateBook }) => {
  const { currentPrompt, setCurrentPrompt, isGenerating } = useCreateBookContext();

  const handlePromptChange = (value: string) => {
    setCurrentPrompt(prev => prev ? { ...prev, prompt: value } : null);
  };

  const handleWordCountChange = (value: string) => {
    setCurrentPrompt(prev => prev ? { ...prev, wordCount: parseInt(value) || 5000 } : null);
  };

  const handleGenerate = () => {
    if (currentPrompt) {
      onGenerateBook(currentPrompt);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Book Prompt
        </CardTitle>
        <CardDescription>
          Describe your book idea and AI will generate the content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !currentPrompt?.prompt}
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
              Generate Book
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
