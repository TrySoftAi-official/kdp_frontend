import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { CreateBookContextType, BookPrompt } from './types';

const CreateBookContext = createContext<CreateBookContextType | undefined>(undefined);

export const useCreateBookContext = () => {
  const context = useContext(CreateBookContext);
  if (!context) {
    throw new Error('useCreateBookContext must be used within a CreateBookProvider');
  }
  return context;
};

interface CreateBookProviderProps {
  children: React.ReactNode;
}

export const CreateBookProvider: React.FC<CreateBookProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState<BookPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<any[]>([]);
  const [generatedBooks, setGeneratedBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookView, setShowBookView] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    }
  }, [user]);

  // Initialize currentPrompt with empty values
  useEffect(() => {
    if (!currentPrompt) {
      setCurrentPrompt({
        id: '',
        prompt: '',
        niche: '',
        targetAudience: '',
        wordCount: 5000,
        keywords: '',
        description: '',
        createdAt: ''
      });
    }
  }, [currentPrompt]);

  const value: CreateBookContextType = {
    currentPrompt,
    setCurrentPrompt,
    isGenerating,
    setIsGenerating,
    generationSteps,
    setGenerationSteps,
    generatedBooks,
    setGeneratedBooks,
    selectedBook,
    setSelectedBook,
    showBookView,
    setShowBookView,
    showUpgradeModal,
    setShowUpgradeModal,
  };

  return (
    <CreateBookContext.Provider value={value}>
      {children}
    </CreateBookContext.Provider>
  );
};
