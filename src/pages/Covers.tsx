import React, { useState } from 'react';
import { Upload, Image, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RoleBased } from '@/components/shared/RoleBased';

export const Covers: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    { id: '1', name: 'Romance Classic', category: 'Romance', preview: '/api/placeholder/300/400' },
    { id: '2', name: 'Business Pro', category: 'Business', preview: '/api/placeholder/300/400' },
    { id: '3', name: 'Mystery Dark', category: 'Mystery', preview: '/api/placeholder/300/400' },
    { id: '4', name: 'Sci-Fi Future', category: 'Sci-Fi', preview: '/api/placeholder/300/400' },
    { id: '5', name: 'Cookbook Fresh', category: 'Cooking', preview: '/api/placeholder/300/400' },
    { id: '6', name: 'Self-Help Bold', category: 'Self-Help', preview: '/api/placeholder/300/400' }
  ];

  return (
    <RoleBased allowedRoles={['admin', 'assistant']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cover Generator</h1>
            <p className="text-muted-foreground">
              Create professional book covers or upload your own designs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Cover
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cover Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-primary'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Customize Cover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Enter book title..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Author</label>
                    <Input placeholder="Enter author name..." />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subtitle</label>
                  <Input placeholder="Enter subtitle (optional)..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title Color</label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-8 h-8 rounded bg-black border cursor-pointer" />
                      <div className="w-8 h-8 rounded bg-white border cursor-pointer" />
                      <div className="w-8 h-8 rounded bg-blue-600 cursor-pointer" />
                      <div className="w-8 h-8 rounded bg-red-600 cursor-pointer" />
                      <div className="w-8 h-8 rounded bg-green-600 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Font Style</label>
                    <select className="w-full p-2 border rounded">
                      <option>Modern Sans</option>
                      <option>Classic Serif</option>
                      <option>Bold Display</option>
                      <option>Elegant Script</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Background</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div className="aspect-square rounded bg-gradient-to-br from-blue-400 to-purple-600 cursor-pointer" />
                    <div className="aspect-square rounded bg-gradient-to-br from-pink-400 to-red-600 cursor-pointer" />
                    <div className="aspect-square rounded bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer" />
                    <div className="aspect-square rounded bg-gradient-to-br from-yellow-400 to-orange-600 cursor-pointer" />
                  </div>
                </div>
                
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Variations
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex flex-col items-center justify-center text-white p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold">Your Book Title</h2>
                    <p className="text-sm opacity-80">Subtitle goes here</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-sm">Author Name</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download High-Res
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Save as Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Covers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded cursor-pointer hover:opacity-80">
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleBased>
  );
};
