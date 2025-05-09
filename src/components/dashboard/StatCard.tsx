// src/components/dashboard/StatCard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using shadcn Card
import { cn } from '@/lib/utils';
import type { StatCardData as StatCardDataType } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  data: StatCardDataType;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ data, className }) => {
  const IconComponent = data.icon;

  return (
    <Card className={cn("shadow-md border rounded-lg overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {data.title}
        </CardTitle>
        {IconComponent && (
          <div className={cn("h-8 w-8 p-1.5 rounded-md flex items-center justify-center", data.iconBgColor)}>
            <IconComponent className={cn("h-5 w-5", data.iconTextColor)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{data.value}</div>
        {(data.trend || data.percentage) && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.trend && (
              <span className={cn(
                "inline-flex items-center",
                data.trendDirection === 'up' ? 'text-green-600 dark:text-green-400' :
                data.trendDirection === 'down' ? 'text-red-600 dark:text-red-400' : ''
              )}>
                {data.trendDirection === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {data.trendDirection === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {data.trend}
              </span>
            )}
            {data.trend && data.percentage && <span className="mx-1">·</span>}
            {data.percentage && <span>{data.percentage}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
