// src/components/shared/TabSelector.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode; // Optional icon
}

interface TabSelectorProps {
  tabs: Tab[];
  selectedTab: string;
  onSelectTab: (id: string) => void;
  className?: string;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  selectedTab,
  onSelectTab,
  className,
}) => {
  return (
    <div className={cn("flex space-x-1 bg-muted p-1 rounded-lg w-full md:w-auto", className)}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted flex-1 md:flex-none", // flex-1 for mobile full width
            selectedTab === tab.id
              ? "text-primary-foreground" // Active text color set by motion.div background
              : "text-muted-foreground hover:text-foreground"
          )}
          style={{
            WebkitTapHighlightColor: "transparent", // Remove tap highlight on mobile
          }}
          aria-selected={selectedTab === tab.id}
          role="tab"
        >
          {/* Motion div for the animated background */}
          {selectedTab === tab.id && (
            <motion.div
              layoutId="activeTabBackground" // Unique ID for layout animation
              className="absolute inset-0 bg-primary rounded-md z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {/* Tab content (Icon and Label) */}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default TabSelector;
