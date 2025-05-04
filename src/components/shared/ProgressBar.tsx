// src/components/shared/ProgressBar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress as ShadProgress } from "@/components/ui/progress"; // Import shadcn Progress

interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ShadProgress> {
  value: number;
  duration?: number;
  indicatorClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, duration = 0.8, className, indicatorClassName, ...props }) => {
  const normalizedValue = Math.max(0, Math.min(100, value || 0));

  return (
    <ShadProgress
      value={normalizedValue} // Use shadcn's value prop for accessibility
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)} // Base styling from shadcn/ui
      {...props}
    >
      {/* Animated Indicator using Framer Motion, overlaying the Shadcn indicator */}
      <motion.div
        className={cn(
          "absolute top-0 left-0 h-full bg-primary rounded-full", // Style the motion div
          indicatorClassName
        )}
        initial={{ width: "0%" }}
        animate={{ width: `${normalizedValue}%` }}
        transition={{ duration: duration, ease: "easeInOut" }}
        style={{ originX: 0 }} // Ensure animation starts from the left
      />
    </ShadProgress>
  );
};

export default ProgressBar;
