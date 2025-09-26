import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateRange } from '@/types';
import { DATE_RANGES } from '@/utils/constants';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: DateRange) => {
    onChange(range);
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    return DATE_RANGES[value]?.label || 'Select range';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={className}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getCurrentLabel()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(DATE_RANGES).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleSelect(key as DateRange)}
            className={value === key ? 'bg-accent' : ''}
          >
            {config.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
