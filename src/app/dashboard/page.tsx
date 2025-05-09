// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, ListChecks, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'; // Removed ChevronDown as it's not used
import { getDashboardStats } from '@/services/api'; // Assuming API function
import type { DashboardStatsData, StatCardData } from '@/types'; // Assuming types
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils'; // Import cn utility

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  percentage?: string;
  iconBgColor: string;
  iconColor: string;
  isLoading?: boolean;
  dataAiHint?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  percentage,
  iconBgColor,
  iconColor,
  isLoading,
  dataAiHint
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" data-ai-hint={dataAiHint}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center text-xs text-muted-foreground">
              {trendDirection === 'up' && <TrendingUp className="h-4 w-4 mr-1 text-green-500" />}
              {trendDirection === 'down' && <TrendingDown className="h-4 w-4 mr-1 text-red-500" />}
              <span className={cn(
                trendDirection === 'up' && 'text-green-600',
                trendDirection === 'down' && 'text-red-600'
              )}>
                {trend}
              </span>
            </div>
          )}
          {percentage && (
            <p className="text-xs text-muted-foreground">{percentage}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-full flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
};


const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cityFilter, setCityFilter] = useState<string>("pan_india");
  const [roleFilter, setRoleFilter] = useState<string>("all_roles");
  const [timeFilter, setTimeFilter] = useState<string>("this_week");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass filters to API call if your API supports it
        const data = await getDashboardStats({ city: cityFilter, role: roleFilter, time: timeFilter });
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cityFilter, roleFilter, timeFilter]);


  const statCards: Omit<StatCardProps, 'isLoading' | 'value' | 'trend' | 'percentage'>[] = [
    { title: "Active Projects", icon: ListChecks, iconBgColor: "bg-green-100 dark:bg-green-900/50", iconColor: "text-stat-card-green", dataAiHint:"projects list" },
    { title: "Green Projects", icon: CheckCircle2, iconBgColor: "bg-green-100 dark:bg-green-900/50", iconColor: "text-stat-card-green", dataAiHint:"projects success" },
    { title: "Amber Projects", icon: AlertTriangle, iconBgColor: "bg-amber-100 dark:bg-amber-900/50", iconColor: "text-stat-card-amber", dataAiHint:"projects warning" },
    { title: "Red Projects", icon: XCircle, iconBgColor: "bg-red-100 dark:bg-red-900/50", iconColor: "text-stat-card-red", dataAiHint:"projects alert" },
  ];
  
  const getStatCardData = (title: string): Partial<StatCardData> => {
    if (!stats) return { value: '0', trend: '', percentage: ''};
    switch (title) {
      case "Active Projects": return stats.activeProjects;
      case "Green Projects": return stats.greenProjects;
      case "Amber Projects": return stats.amberProjects;
      case "Red Projects": return stats.redProjects;
      default: return { value: '0', trend: '', percentage: ''};
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Brick & Bolt Premier League Dashboard</h1>
        <p className="text-md text-muted-foreground mt-1">
          Track performance, celebrate achievements, and compete for the top spot in our construction championship.
        </p>
      </div>

      {/* Global Filter (if any, e.g., Pan India) */}
      <div className="flex justify-end items-center mb-6">
        <label htmlFor="city-filter" className="text-sm font-medium mr-2 text-muted-foreground">Filter by City:</label>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pan_india">Pan India</SelectItem>
            <SelectItem value="blr_a">BLR_A</SelectItem>
            <SelectItem value="blr_b">BLR_B</SelectItem>
            <SelectItem value="chn">CHN</SelectItem>
            <SelectItem value="ncr">NCR</SelectItem>
            <SelectItem value="hyd">HYD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Scoreboard Section */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-primary" />
              Performance Scoreboard
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_roles">All Roles</SelectItem>
                  <SelectItem value="om">Operations Managers</SelectItem>
                  <SelectItem value="tl">Team Leads</SelectItem>
                  <SelectItem value="spm">Sr. Project Managers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Stats</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing or adjusting filters.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
                const cardData = getStatCardData(card.title);
                return (
                  <StatCard
                    key={card.title}
                    title={card.title}
                    value={cardData?.value ?? (isLoading ? '...' : '0')}
                    icon={card.icon}
                    trend={cardData?.trend}
                    trendDirection={cardData?.trendDirection}
                    percentage={cardData?.percentage}
                    iconBgColor={card.iconBgColor}
                    iconColor={card.iconColor}
                    isLoading={isLoading}
                    dataAiHint={card.dataAiHint}
                  />
                );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Other sections like Top Performers, Leaderboard Summary, etc. can be added here */}

    </motion.div>
  );
};

export default DashboardPage;
