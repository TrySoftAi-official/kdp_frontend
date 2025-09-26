import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';
import { cn } from '@/utils/utils';
import { GenerationStep } from './types';

interface GenerationProgressProps {
  generationSteps: GenerationStep[];
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ generationSteps }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Generation Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Generating your book...
        </div>
        {generationSteps.map((step) => (
          <div key={step.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={cn(
                step.status === 'completed' && 'text-green-600',
                step.status === 'running' && 'text-blue-600',
                step.status === 'error' && 'text-red-600'
              )}>
                {step.name}
              </span>
              <span className="text-muted-foreground">
                {step.progress}%
              </span>
            </div>
            <Progress value={step.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
