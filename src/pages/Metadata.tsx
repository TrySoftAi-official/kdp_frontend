import React from 'react';
import { FileText, Sparkles, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoleBased } from '@/components/shared/RoleBased';

export const Metadata: React.FC = () => {
  return (
    <RoleBased allowedRoles={['admin', 'assistant']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Metadata Editor</h1>
            <p className="text-muted-foreground">
              Create and optimize book metadata with AI assistance
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Metadata Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Enter book title..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subtitle</label>
                  <Input placeholder="Enter subtitle..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Author</label>
                    <Input placeholder="Author name..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Series</label>
                    <Input placeholder="Series name..." />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded-md resize-none"
                    rows={6}
                    placeholder="Enter book description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories & Keywords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Primary Category</label>
                  <Input placeholder="Select primary category..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Secondary Category</label>
                  <Input placeholder="Select secondary category..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">romance</Badge>
                    <Badge variant="secondary">contemporary</Badge>
                    <Badge variant="secondary">love story</Badge>
                    <Badge variant="secondary">relationships</Badge>
                  </div>
                  <Input placeholder="Add keywords..." />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Title Suggestions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Love in the Digital Age</span>
                      <Button size="sm" variant="outline">Use</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hearts Connected Online</span>
                      <Button size="sm" variant="outline">Use</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Modern Romance Story</span>
                      <Button size="sm" variant="outline">Use</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Description Optimization</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Your description could be improved by adding more emotional hooks and specific details about the characters.
                  </p>
                  <Button size="sm" variant="outline">
                    Generate Improved Version
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Keyword Recommendations</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">
                      + online dating
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">
                      + workplace romance
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">
                      + second chances
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Add All Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg mb-1">Book Title</h3>
                    <p className="text-sm text-muted-foreground mb-3">by Author Name</p>
                    <p className="text-sm">
                      This is where your book description will appear. It should be compelling and draw readers in...
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Categories: Romance › Contemporary</p>
                    <p>Keywords: romance, contemporary, love story, relationships</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleBased>
  );
};
