import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Metric } from '@/types';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const { title, value, change, isPositive, icon: Icon, color } = metric;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <div className={cn(
                'flex items-center text-xs font-medium',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change}
              </div>
            </div>
          </div>
          
          <div className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            color
          )}>
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
