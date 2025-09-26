import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export interface StatusCardProps {
  title: string;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  description?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  description,
  lastUpdated,
  onRefresh,
  isLoading = false,
  className = '',
  children
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          badge: (
            <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Connected
            </Badge>
          ),
          borderColor: 'border-l-green-500',
          bgColor: 'bg-green-50'
        };
      case 'disconnected':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          badge: (
            <Badge variant="destructive" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Disconnected
            </Badge>
          ),
          borderColor: 'border-l-red-500',
          bgColor: 'bg-red-50'
        };
      case 'checking':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          badge: (
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Checking...
            </Badge>
          ),
          borderColor: 'border-l-yellow-500',
          bgColor: 'bg-yellow-50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          badge: (
            <Badge variant="destructive" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Error
            </Badge>
          ),
          borderColor: 'border-l-red-500',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-600" />,
          badge: (
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              Unknown
            </Badge>
          ),
          borderColor: 'border-l-gray-500',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`border-l-4 ${config.borderColor} ${config.bgColor} ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.badge}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="ml-2"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
