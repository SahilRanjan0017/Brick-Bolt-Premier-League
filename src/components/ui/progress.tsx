// src/components/ui/progress.tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Extend props to include indicatorClassName
interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps // Use the extended props interface
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-muted", // Base styling
      className
    )}
    {...props}
  >
    {/* Standard Shadcn Indicator */}
    <ProgressPrimitive.Indicator
      className={cn(
          "h-full w-full flex-1 bg-primary transition-transform duration-500 ease-out", // Use transform transition
          indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} // Use transform for progress
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
