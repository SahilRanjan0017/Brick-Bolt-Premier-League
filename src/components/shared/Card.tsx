// src/components/shared/Card.tsx
'use client';

import * as React from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card as ShadCard,
  CardHeader as ShadCardHeader,
  CardFooter as ShadCardFooter,
  CardTitle as ShadCardTitle,
  CardDescription as ShadCardDescription,
  CardContent as ShadCardContent,
} from "@/components/ui/card"; // Import shadcn card components

// Base Card component with motion
interface CardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm", // Base styles from shadcn/ui
        className
      )}
      initial={{ opacity: 0, y: 10 }} // Default animation
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props} // Pass motion props
    >
      {children}
    </motion.div>
  )
);
Card.displayName = "Card";

// Forwarding refs and props for sub-components (no animation needed here)
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ShadCardHeader ref={ref} className={className} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    // Use div for CardTitle as per shadcn, ensures correct HTML structure
    <ShadCardTitle ref={ref} className={className} {...props} />
));
CardTitle.displayName = "CardTitle";


const CardDescription = React.forwardRef<
  HTMLDivElement, // Changed from p to div to match shadcn
  React.HTMLAttributes<HTMLDivElement> // Changed from p to div
>(({ className, ...props }, ref) => (
  <ShadCardDescription ref={ref} className={className} {...props} /> // Use div as per Shadcn
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ShadCardContent ref={ref} className={className} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ShadCardFooter ref={ref} className={className} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
