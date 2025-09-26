import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, BookOpen, Target } from 'lucide-react';

export interface EmptyStateCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title = "Book Generation Workspace",
  description = "Enter your book description to start generating",
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Ready to Generate Books
          </h3>

          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Describe your book idea in detail and AI will generate high-quality content tailored to your requirements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Write Prompt</h4>
              <p className="text-xs sm:text-sm text-green-700">Describe your book idea and topic</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h4 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">AI Generation</h4>
              <p className="text-xs sm:text-sm text-blue-700">AI creates comprehensive book content</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h4 className="font-semibold text-purple-800 mb-1 text-sm sm:text-base">Publish</h4>
              <p className="text-xs sm:text-sm text-purple-700">Publish your book to Amazon KDP</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500">
              Start by entering your book prompt above
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Target className="h-4 w-4 text-blue-600" />
            What You'll Get
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Professional book content with chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">SEO-optimized writing style</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Target audience-specific content</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Customizable word count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Multiple format downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Professional formatting</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
