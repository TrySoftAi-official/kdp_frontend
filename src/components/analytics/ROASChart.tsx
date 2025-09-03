import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types';
import { CHART_COLORS } from '@/lib/constants';

interface ROASChartProps {
  data: ChartData[];
  loading?: boolean;
}

export const ROASChart: React.FC<ROASChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ROAS Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const formatTooltipValue = (value: number) => {
    return [`${value.toFixed(2)}x`, 'ROAS'];
  };

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate average ROAS for reference line
  const avgROAS = data.reduce((sum, item) => sum + item.roas, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROAS Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Return on Ad Spend over time (target: 4.0x)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                domain={[0, 'dataMax + 1']}
                tickFormatter={(value) => `${value.toFixed(1)}x`}
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
              
              {/* Target ROAS line */}
              <ReferenceLine 
                y={4} 
                stroke={CHART_COLORS.warning}
                strokeDasharray="5 5" 
                label={{ value: "Target (4.0x)", position: "topRight" }}
              />
              
              {/* Average ROAS line */}
              <ReferenceLine 
                y={avgROAS} 
                stroke={CHART_COLORS.info}
                strokeDasharray="3 3" 
                label={{ value: `Avg (${avgROAS.toFixed(1)}x)`, position: "topLeft" }}
              />
              
              <Line 
                type="monotone" 
                dataKey="roas" 
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ 
                  fill: CHART_COLORS.primary, 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: CHART_COLORS.primary,
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>ROAS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-dashed border-orange-500" />
              <span>Target (4.0x)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-dashed border-blue-400" />
              <span>Average ({avgROAS.toFixed(1)}x)</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            {data.length} data points
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
