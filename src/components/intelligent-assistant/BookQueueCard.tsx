import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, BookOpen } from 'lucide-react';

export interface QueueStats {
  total: number;
  pending: number;
  review: number;
  uploaded: number;
  failed?: number;
}

export interface BookQueueCardProps {
  stats: QueueStats;
  lastSyncTime?: Date | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const BookQueueCard: React.FC<BookQueueCardProps> = ({
  stats,
  lastSyncTime,
  onRefresh,
  isLoading = false,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Book Queue Status
            </CardTitle>
            <CardDescription>
              Total books: {stats.total}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.review}</div>
            <div className="text-sm text-muted-foreground">Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.uploaded}</div>
            <div className="text-sm text-muted-foreground">Uploaded</div>
          </div>
        </div>
        
        {stats.failed && stats.failed > 0 && (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        )}
        
        {/* Book Statistics */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Total Books:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Per Page:</span>
              <span className="font-medium text-green-600">10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">System Active</span>
            </div>
          </div>
          
          {lastSyncTime && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
