// src/components/shared/RAGIndicator.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type RagStatus = 'Red' | 'Amber' | 'Green' | string; // Allow string for flexibility

interface RAGIndicatorProps {
  status: RagStatus;
  count?: number;
  size?: 'sm' | 'default' | 'lg';
  hideCount?: boolean;
}

const getStatusColor = (status: RagStatus): string => {
  switch (status?.toLowerCase()) {
    case 'green':
      return 'bg-green-500 border-green-600';
    case 'amber':
      return 'bg-yellow-500 border-yellow-600';
    case 'red':
      return 'bg-red-500 border-red-600';
    default:
      return 'bg-gray-400 border-gray-500'; // Neutral color for unknown status
  }
};

const getSizeClass = (size: RAGIndicatorProps['size']): string => {
    switch(size) {
        case 'sm': return 'h-2.5 w-2.5';
        case 'lg': return 'h-4 w-4';
        case 'default':
        default: return 'h-3 w-3';
    }
}

const RAGIndicator: React.FC<RAGIndicatorProps> = ({ status, count, size = 'default', hideCount = false }) => {
  const colorClass = getStatusColor(status);
  const sizeClass = getSizeClass(size);

  const indicatorElement = (
       <div
          className={cn(
            "rounded-full border flex-shrink-0",
            colorClass,
            sizeClass
          )}
        />
  );

   const content = (
       <div className="flex items-center space-x-1">
         {indicatorElement}
         {!hideCount && typeof count === 'number' && (
            <span className={cn(
                "font-medium leading-none",
                 size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
                 {count}
             </span>
          )}
        </div>
    );

    // Only wrap with Tooltip if status is provided (avoid tooltip for placeholders)
    if (status) {
         return (
            <TooltipProvider delayDuration={100}>
                 <Tooltip>
                     <TooltipTrigger asChild>
                         {content}
                     </TooltipTrigger>
                     <TooltipContent side="top" className="text-xs">
                         <p>{status}: {count ?? 'N/A'}</p>
                     </TooltipContent>
                 </Tooltip>
             </TooltipProvider>
         );
    }

   return content; // Render without tooltip if no status

};

export default RAGIndicator;
