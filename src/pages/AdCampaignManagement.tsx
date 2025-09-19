import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  RefreshCw,
  Target,
  DollarSign,
  TrendingUp,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDynamicApi } from '@/hooks/useDynamicApi';
import { toast } from '@/lib/toast';
import { 
  AdditionalService, 
  DatabaseBook
} from '@/api/additionalService';

// Campaign Status Types
export type CampaignStatus = 
  | 'created' 
  | 'starting' 
  | 'running' 
  | 'paused' 
  | 'stopped' 
  | 'failed' 
  | 'restarting' 
  | 'terminated';

export interface AdCampaign {
  id: string;
  bookId: number;
  bookTitle: string;
  status: CampaignStatus;
  budget: number;
  dailyBudget: number;
  targetAudience: string;
  keywords: string[];
  startDate: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  acos: number;
  ctr: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export const AdCampaignManagement: React.FC = () => {
  const [uploadedBooks, setUploadedBooks] = useState<DatabaseBook[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [selectedBook, setSelectedBook] = useState<DatabaseBook | null>(null);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    budget: 100,
    dailyBudget: 10,
    targetAudience: '',
    keywords: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Initialize dynamic API
  const {
    isRefetching
  } = useDynamicApi({
    enableAutoRefresh: true,
    refreshInterval: 30000,
    enableErrorNotifications: true,
    enableSuccessNotifications: true
  });

  // Load uploaded books on component mount
  useEffect(() => {
    handleFetchUploadedBooks();
    loadMockCampaigns();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleFetchUploadedBooks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFetchUploadedBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const response = await AdditionalService.getBooksFromDatabase();
      // Filter only books with status "uploaded"
      const uploaded = response.data.books.filter(book => 
        book.status.toLowerCase() === 'uploaded'
      );
      setUploadedBooks(uploaded);
      toast.success(`Loaded ${uploaded.length} uploaded books`);
    } catch (error) {
      console.error('Error fetching uploaded books:', error);
      toast.error('Failed to fetch uploaded books');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Mock campaigns data (replace with real API calls later)
  const loadMockCampaigns = () => {
    const mockCampaigns: AdCampaign[] = [
      {
        id: '1',
        bookId: 1,
        bookTitle: 'Sample Book 1',
        status: 'running',
        budget: 500,
        dailyBudget: 25,
        targetAudience: 'Fiction Readers',
        keywords: ['fiction', 'novel', 'story'],
        startDate: '2024-01-01',
        impressions: 15000,
        clicks: 450,
        conversions: 23,
        spend: 125.50,
        revenue: 345.00,
        roas: 2.75,
        acos: 0.36,
        ctr: 3.0,
        conversionRate: 5.1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        bookId: 2,
        bookTitle: 'Sample Book 2',
        status: 'paused',
        budget: 300,
        dailyBudget: 15,
        targetAudience: 'Business Professionals',
        keywords: ['business', 'entrepreneurship', 'success'],
        startDate: '2024-01-05',
        impressions: 8500,
        clicks: 255,
        conversions: 12,
        spend: 89.25,
        revenue: 180.00,
        roas: 2.02,
        acos: 0.50,
        ctr: 3.0,
        conversionRate: 4.7,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T15:45:00Z'
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const getStatusColor = (status: CampaignStatus): string => {
    const statusColors: Record<CampaignStatus, string> = {
      created: 'bg-gray-100 text-gray-800 border-gray-200',
      starting: 'bg-blue-100 text-blue-800 border-blue-200',
      running: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      stopped: 'bg-gray-100 text-gray-800 border-gray-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      restarting: 'bg-orange-100 text-orange-800 border-orange-200',
      terminated: 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: CampaignStatus) => {
    const statusIcons: Record<CampaignStatus, React.ReactNode> = {
      created: <Clock className="h-4 w-4" />,
      starting: <Loader2 className="h-4 w-4 animate-spin" />,
      running: <Play className="h-4 w-4" />,
      paused: <Pause className="h-4 w-4" />,
      stopped: <Square className="h-4 w-4" />,
      failed: <AlertTriangle className="h-4 w-4" />,
      restarting: <RotateCcw className="h-4 w-4 animate-spin" />,
      terminated: <AlertTriangle className="h-4 w-4" />
    };
    return statusIcons[status];
  };

  const getStatusMeaning = (status: CampaignStatus): string => {
    const meanings: Record<CampaignStatus, string> = {
      created: 'Resource/service has been defined but not started yet',
      starting: 'Transitioning from created → running, init tasks are happening',
      running: 'Actively working, serving traffic, or processing tasks',
      paused: 'Suspended temporarily (still exists in memory/state, not deleted)',
      stopped: 'Gracefully shut down, can be restarted',
      failed: 'Error during execution or unexpected exit',
      restarting: 'Attempting to recover from failed automatically',
      terminated: 'Permanently shut down, cannot be restarted (final state)'
    };
    return meanings[status];
  };

  const handleCreateCampaign = () => {
    if (!selectedBook) {
      toast.error('Please select a book first');
      return;
    }

    const campaign: AdCampaign = {
      id: Date.now().toString(),
      bookId: selectedBook.id,
      bookTitle: selectedBook.book_title,
      status: 'created',
      budget: newCampaign.budget,
      dailyBudget: newCampaign.dailyBudget,
      targetAudience: newCampaign.targetAudience,
      keywords: newCampaign.keywords.split(',').map(k => k.trim()),
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate || undefined,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      roas: 0,
      acos: 0,
      ctr: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCampaigns(prev => [...prev, campaign]);
    setShowCreateCampaign(false);
    setSelectedBook(null);
    setNewCampaign({
      budget: 100,
      dailyBudget: 10,
      targetAudience: '',
      keywords: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    toast.success('Campaign created successfully');
  };

  const handleCampaignAction = (campaignId: string, action: CampaignStatus) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: action, updatedAt: new Date().toISOString() }
        : campaign
    ));
    toast.success(`Campaign ${action} successfully`);
  };

  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Campaign Management</h1>
          <p className="text-gray-600">Manage advertising campaigns for your uploaded books</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleFetchUploadedBooks}
            disabled={isLoadingBooks}
          >
            {isLoadingBooks ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Books
          </Button>
          <Button 
            onClick={() => setShowCreateCampaign(true)}
            disabled={uploadedBooks.length === 0}
          >
            <Target className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => ['running', 'starting'].includes(c.status)).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpend.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Books Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Books for Campaigns ({uploadedBooks.length} books)</span>
            {isRefetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBooks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedBooks.map((book) => {
                const hasCampaign = campaigns.some(c => c.bookId === book.id);
                return (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={book.cover_path || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center'} 
                        alt={book.book_title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200 border">
                          ✓ Uploaded
                        </Badge>
                      </div>
                      {hasCampaign && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">
                            <Target className="h-3 w-3 mr-1" />
                            Has Campaign
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.book_title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>by {book.author_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{book.primary_category}</span>
                          {book.secondary_category && (
                            <span>• {book.secondary_category}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>${book.book_price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedBook(book);
                            setShowCreateCampaign(true);
                          }}
                          disabled={hasCampaign}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          {hasCampaign ? 'Has Campaign' : 'Create Campaign'}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log('View book details:', book.book_title)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {!isLoadingBooks && uploadedBooks.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No uploaded books found</h3>
              <p className="text-muted-foreground mb-4">
                Upload books to Amazon KDP first to create advertising campaigns.
              </p>
              <Button onClick={handleFetchUploadedBooks} disabled={isLoadingBooks}>
                {isLoadingBooks ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Books
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Active Campaigns ({campaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first advertising campaign to start promoting your books.
              </p>
              <Button onClick={() => setShowCreateCampaign(true)}>
                <Target className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.bookTitle}</h3>
                          <Badge className={`${getStatusColor(campaign.status)} border`}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getStatusMeaning(campaign.status)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Budget: ${campaign.budget}</span>
                          <span>Daily: ${campaign.dailyBudget}</span>
                          <span>Target: {campaign.targetAudience}</span>
                          <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {campaign.status === 'created' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCampaignAction(campaign.id, 'starting')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {campaign.status === 'running' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'paused')}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCampaignAction(campaign.id, 'running')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        {['running', 'paused'].includes(campaign.status) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'stopped')}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        )}
                        {campaign.status === 'failed' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCampaignAction(campaign.id, 'restarting')}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restart
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Campaign Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{campaign.impressions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{campaign.clicks}</p>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{campaign.conversions}</p>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">${campaign.spend.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Spend</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">${campaign.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">{campaign.roas.toFixed(2)}x</p>
                        <p className="text-sm text-muted-foreground">ROAS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-red-600">{(campaign.acos * 100).toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">ACOS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-purple-600">{(campaign.ctr * 100).toFixed(2)}%</p>
                        <p className="text-sm text-muted-foreground">CTR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedBook && (
                <div className="space-y-2">
                  <Label>Select Book</Label>
                  <Select onValueChange={(value) => {
                    const book = uploadedBooks.find(b => b.id.toString() === value);
                    setSelectedBook(book || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a book for the campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadedBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.book_title} by {book.author_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedBook && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">{selectedBook.book_title}</h3>
                  <p className="text-sm text-muted-foreground">by {selectedBook.author_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBook.primary_category}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                  <Input
                    id="dailyBudget"
                    type="number"
                    value={newCampaign.dailyBudget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, dailyBudget: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Fiction readers, Business professionals"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Textarea
                  id="keywords"
                  value={newCampaign.keywords}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., fiction, novel, story, adventure"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateCampaign(false);
                    setSelectedBook(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={!selectedBook || !newCampaign.targetAudience || !newCampaign.keywords}
                >
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
