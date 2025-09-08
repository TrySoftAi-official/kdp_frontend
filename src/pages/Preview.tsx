import React, { useState } from 'react';
import { Eye, Download, Share, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Preview: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'epub'>('pdf');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preview & Export</h1>
          <p className="text-muted-foreground">
            Preview your books and export in different formats
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Preview
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Book
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Book Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Digital Marketing Mastery', status: 'published' },
                { title: 'Romance in Paris', status: 'processing' },
                { title: 'Cooking for Beginners', status: 'draft' },
                { title: 'Mystery of the Lost City', status: 'published' }
              ].map((book, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">{book.title}</p>
                  <Badge 
                    variant={
                      book.status === 'published' ? 'success' :
                      book.status === 'processing' ? 'warning' : 'secondary'
                    } 
                    className="mt-1"
                  >
                    {book.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Format</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat('pdf')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant={selectedFormat === 'epub' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat('epub')}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    EPUB
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Quality</label>
                <select className="w-full p-2 border rounded mt-1">
                  <option>High (Print Ready)</option>
                  <option>Medium (Web)</option>
                  <option>Low (Preview)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Page Size</label>
                <select className="w-full p-2 border rounded mt-1">
                  <option>6" x 9" (Standard)</option>
                  <option>5.5" x 8.5" (Digest)</option>
                  <option>8.5" x 11" (Letter)</option>
                  <option>A4</option>
                </select>
              </div>
              
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export {selectedFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Book Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-white border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                <div className="text-center space-y-4 p-8">
                  <BookOpen className="h-16 w-16 mx-auto opacity-50" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Digital Marketing Mastery</h3>
                    <p className="text-sm opacity-75 mb-4">by John Smith</p>
                    <div className="space-y-2 text-left max-w-md">
                      <p className="text-sm">
                        Chapter 1: Introduction to Digital Marketing
                      </p>
                      <p className="text-sm">
                        Chapter 2: Social Media Strategies
                      </p>
                      <p className="text-sm">
                        Chapter 3: Email Marketing Campaigns
                      </p>
                      <p className="text-sm">
                        Chapter 4: SEO and Content Marketing
                      </p>
                      <p className="text-sm">
                        Chapter 5: Analytics and Optimization
                      </p>
                      <div className="text-center pt-4">
                        <p className="text-xs opacity-50">
                          Page 1 of 247
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button variant="outline" size="sm">
                  Previous Page
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page 1 of 247
                </span>
                <Button variant="outline" size="sm">
                  Next Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
