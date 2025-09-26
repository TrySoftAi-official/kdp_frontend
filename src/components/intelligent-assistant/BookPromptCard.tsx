import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Sparkles, 
  Hash, 
  Target
} from 'lucide-react';

export interface BookPrompt {
  id: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  keywords?: string;
  description?: string;
  createdAt: string;
}

export interface BookPromptCardProps {
  currentPrompt: BookPrompt | null;
  isGenerating: boolean;
  isKdpConnected: boolean;
  onPromptChange: (prompt: BookPrompt | null) => void;
  onGenerateBook: (prompt: BookPrompt) => void;
  onAutoGenerateBooks: (numberOfBooks: number) => void;
  onConnectKdp: () => void;
  className?: string;
}

export const BookPromptCard: React.FC<BookPromptCardProps> = ({
  currentPrompt,
  isGenerating,
  isKdpConnected,
  onPromptChange,
  onGenerateBook,
  onAutoGenerateBooks,
  onConnectKdp,
  className = ''
}) => {
  const [showAutoGenerateModal, setShowAutoGenerateModal] = React.useState(false);
  const [modalNumberOfBooks, setModalNumberOfBooks] = React.useState(3);

  const handlePromptChange = (field: keyof BookPrompt, value: string) => {
    if (currentPrompt) {
      onPromptChange({
        ...currentPrompt,
        [field]: value
      });
    } else {
      onPromptChange({
        id: '',
        prompt: '',
        niche: '',
        targetAudience: '',
        keywords: '',
        description: '',
        createdAt: '',
        [field]: value
      });
    }
  };

  const handleGenerateBook = () => {
    if (currentPrompt?.prompt) {
      onGenerateBook(currentPrompt);
    }
  };

  const handleAutoGenerateBooks = () => {
    setShowAutoGenerateModal(false);
    onAutoGenerateBooks(modalNumberOfBooks);
  };

  return (
    <Card className={className}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="book-prompt">Book Description *</Label>
            {!isKdpConnected && (
              <Button
                onClick={onConnectKdp}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Target className="h-4 w-4 mr-2" />
                Connect KDP
              </Button>
            )}
          </div>
          <textarea
            id="book-prompt"
            placeholder="Describe your book idea, topic, target audience, niche, and any specific requirements. For example: 'Write a comprehensive guide to starting a business from scratch, targeting entrepreneurs and beginners in the business niche, with practical steps and strategies.'"
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={currentPrompt?.prompt || ''}
            onChange={(e) => handlePromptChange('prompt', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Button 
              onClick={handleGenerateBook} 
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
                  Generate Book (API)
                </>
              )}
            </Button>
          </div>

          {/* Auto Generate Books Section */}
          <div className="pt-4 border-t border-gray-200">
            <Dialog open={showAutoGenerateModal} onOpenChange={setShowAutoGenerateModal}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full"
                  disabled={isGenerating}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Auto Generate Multiple Books
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Auto Generate Books</DialogTitle>
                  <DialogDescription>
                    Enter the number of books you want to generate automatically. Each book will be created based on your current prompt.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="modalNumberOfBooks" className="text-right">
                      Number of Books
                    </Label>
                    <Input
                      id="modalNumberOfBooks"
                      type="number"
                      min="1"
                      max="10"
                      value={modalNumberOfBooks}
                      onChange={(e) => setModalNumberOfBooks(parseInt(e.target.value) || 1)}
                      className="col-span-3"
                      placeholder="Enter number of books"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    This will generate {modalNumberOfBooks} book{modalNumberOfBooks !== 1 ? 's' : ''} automatically using AI based on your current prompt.
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowAutoGenerateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleAutoGenerateBooks}
                    disabled={isGenerating || modalNumberOfBooks < 1}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate {modalNumberOfBooks} Book{modalNumberOfBooks !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
