export interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: string;
}

export interface GeneratedBook {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'draft' | 'generated' | 'published' | 'saved';
  savedAt?: string;
}

export interface BookPrompt {
  id: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  keywords?: string;
  description?: string;
  createdAt: string;
}

export interface BookSuggestion {
  title: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  prompt: string;
  description: string;
}

export interface CreateBookContextType {
  currentPrompt: BookPrompt | null;
  setCurrentPrompt: (prompt: BookPrompt | null) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generationSteps: GenerationStep[];
  setGenerationSteps: (steps: GenerationStep[]) => void;
  generatedBooks: GeneratedBook[];
  setGeneratedBooks: (books: GeneratedBook[]) => void;
  selectedBook: GeneratedBook | null;
  setSelectedBook: (book: GeneratedBook | null) => void;
  showBookView: boolean;
  setShowBookView: (show: boolean) => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}
