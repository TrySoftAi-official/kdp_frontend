import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookStatus } from '@/types';
import { BOOK_STATUSES } from '@/lib/constants';

interface StatusBadgeProps {
  status: BookStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const config = BOOK_STATUSES[status];
  
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        Unknown
      </Badge>
    );
  }

  const variant = status === 'published' ? 'success' : 
                  status === 'processing' ? 'warning' : 
                  'error';

  return (
    <Badge 
      variant={variant as any}
      className={className}
    >
      {config.label}
    </Badge>
  );
};
