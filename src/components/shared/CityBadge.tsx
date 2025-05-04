// src/components/shared/CityBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CityBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  city: string;
}

// Basic color mapping (can be expanded)
const cityColorMap: Record<string, string> = {
    'BLR_A': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    'BLR_B': 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700',
    'CHN': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
    'NCR': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
    'HYD': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700',
};

const CityBadge: React.FC<CityBadgeProps> = ({ city, className, ...props }) => {
  const colorClass = cityColorMap[city] || 'bg-muted text-muted-foreground border-border'; // Default fallback

  return (
    <Badge
      variant="outline"
      className={cn(
          "px-2.5 py-0.5 text-xs font-medium rounded-full border",
          colorClass,
          className
      )}
      {...props}
    >
      {city}
    </Badge>
  );
};

export default CityBadge;
