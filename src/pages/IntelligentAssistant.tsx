import React from 'react';
import { CreateBookProvider } from '@/components/create-book/CreateBookContext';
import { BookPrompt } from '@/components/create-book/BookPrompt';

const IntelligentAssistantPage: React.FC = () => {
  const handleGenerateBook = (prompt: any) => {
    // This would integrate with the backend book generation service
    console.log('Generating book with prompt:', prompt);
    alert(`Book generation started with prompt: "${prompt.prompt}" and word count: ${prompt.wordCount}`);
  };

  return (
    <CreateBookProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-blue-600">
              Intelligent Publishing Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Generate high-quality book content with AI-powered assistance
            </p>
          </div>

          {/* Book Generation Component */}
          <div className="mb-6">
            <BookPrompt onGenerateBook={handleGenerateBook} />
          </div>

          {/* Example Prompts */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Example Prompts</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• "Write a comprehensive guide for digital nomads on earning passive income through self-publishing"</li>
              <li>• "Create a business strategy guide for entrepreneurs starting their first company"</li>
              <li>• "Write a personal finance guide for young adults on budgeting and investing"</li>
            </ul>
          </div>
        </div>
      </div>
    </CreateBookProvider>
  );
};

export default IntelligentAssistantPage;
