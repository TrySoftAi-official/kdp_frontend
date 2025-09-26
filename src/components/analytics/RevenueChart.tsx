import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types';
import { formatCurrency } from '@/utils/utils';
import { CHART_COLORS } from '@/utils/constants';

interface RevenueChartProps {
  data: ChartData[];
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Ad Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const formatTooltipValue = (value: number, name: string) => {
    return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Ad Spend'];
  };

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Ad Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) => `Date: ${formatXAxisLabel(label)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill={CHART_COLORS.success}
                name="Revenue"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="adSpend" 
                fill={CHART_COLORS.warning}
                name="Ad Spend"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
