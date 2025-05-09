// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, ListChecks, History, AlertTriangle, ArrowUp, ArrowDown, CheckCircle, User, Clock, Edit3, Zap } from 'lucide-react';
import { getDashboardStats } from '@/services/api';
import type { DashboardStatsData, LeaderboardEntry, RecentActivityItem, Role } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import TabSelector from '@/components/shared/TabSelector'; // Assuming TabSelector is suitable

const RankCircle: React.FC<{ rank: number }> = ({ rank }) => {
  let bgColor = 'bg-gray-400';
  if (rank === 1) bgColor = 'bg-yellow-400';
  else if (rank === 2) bgColor = 'bg-slate-400';
  else if (rank === 3) bgColor = 'bg-orange-400';
  else if (rank <= 5) bgColor = 'bg-blue-500';

  return (
    <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-white font-semibold text-sm", bgColor)}>
      {rank}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClasses = "border-transparent text-xs ";
  switch (status.toLowerCase()) {
    case 'green':
      colorClasses += "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300";
      break;
    case 'amber':
      colorClasses += "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300";
      break;
    case 'red':
      colorClasses += "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300";
      break;
    default:
      colorClasses += "bg-muted text-muted-foreground";
  }
  return <Badge variant="outline" className={cn("px-2 py-1", colorClasses)}>{status}</Badge>;
};

const TrendIndicator: React.FC<{ change: number | undefined }> = ({ change }) => {
  if (change === undefined || change === null || change === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span className={`flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
      {change > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
      {Math.abs(change)}
    </span>
  );
};

const ActivityIcon: React.FC<{ type: RecentActivityItem['type'] }> = ({ type }) => {
    const baseClass = "h-5 w-5";
    switch (type) {
        case 'milestone': return <Trophy className={cn(baseClass, "text-yellow-500")} />;
        case 'status_change': return <Edit3 className={cn(baseClass, "text-red-500")} />;
        case 'assignment': return <User className={cn(baseClass, "text-blue-500")} />;
        case 'completion': return <CheckCircle className={cn(baseClass, "text-green-500")} />;
        default: return <Zap className={cn(baseClass, "text-gray-500")} />;
    }
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-end items-center">
            <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard Skeleton */}
            <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-9 w-40" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
            {/* Recent Activity Skeleton */}
            <Card className="shadow-lg">
                <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
);


const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("pan_india");
  const [selectedRole, setSelectedRole] = useState<Role>("SPM"); // Default to SPM

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats({ city: cityFilter }); // Pass city filter
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cityFilter]);

  const filteredLeaderboard = useMemo(() => {
    if (!dashboardData?.leaderboard) return [];
    return dashboardData.leaderboard.filter(entry => entry.role === selectedRole);
  }, [dashboardData, selectedRole]);

  const roleTabs = [
    { id: 'SPM', label: 'SPM' },
    { id: 'TL', label: 'TL' },
    { id: 'OM', label: 'OM' },
  ];

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}. Please try refreshing.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return <p className="text-center text-muted-foreground mt-6 py-8">No dashboard data available.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Global Filter */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2">
            <label htmlFor="city-filter" className="text-sm font-medium text-muted-foreground">Filter by City:</label>
            <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger id="city-filter" className="w-[180px] bg-card">
                <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pan_india">Pan India</SelectItem>
                <SelectItem value="BLR_A">BLR_A</SelectItem>
                <SelectItem value="BLR_B">BLR_B</SelectItem>
                <SelectItem value="CHN">CHN</SelectItem>
                <SelectItem value="NCR">NCR</SelectItem>
                <SelectItem value="HYD">HYD</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* Main Content Area - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: BPL Leaderboard */}
        <Card className="lg:col-span-2 shadow-lg rounded-xl">
          <CardHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                BPL Leaderboard
              </CardTitle>
              <TabSelector tabs={roleTabs} selectedTab={selectedRole} onSelectTab={(roleId) => setSelectedRole(roleId as Role)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-center">Projects</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Runs</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboard.slice(0, 7).map((entry) => ( // Show top 7 for example
                    <TableRow key={entry.id}>
                      <TableCell className="text-center"><RankCircle rank={entry.rank} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={entry.profilePic} alt={entry.name} data-ai-hint="person face"/>
                            <AvatarFallback>{entry.name.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">{entry.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.city}</TableCell>
                      <TableCell className="text-center">{entry.projectCount ?? 'N/A'}</TableCell>
                      <TableCell className="text-center">
                         <StatusBadge status={
                            entry.ragStatus.red > 0 ? 'Red' : entry.ragStatus.amber > 0 ? 'Amber' : 'Green'
                         } />
                      </TableCell>
                      <TableCell className="text-center font-semibold">{entry.score}</TableCell>
                      <TableCell className="text-center"><TrendIndicator change={entry.rankChange} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Recent Activity */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <History className="h-6 w-6 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {dashboardData.recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={cn("mt-1 p-1.5 rounded-full flex items-center justify-center",
                    activity.type === 'milestone' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                    activity.type === 'status_change' ? 'bg-red-100 dark:bg-red-900/50' :
                    activity.type === 'assignment' ? 'bg-blue-100 dark:bg-blue-900/50' :
                    activity.type === 'completion' ? 'bg-green-100 dark:bg-green-900/50' :
                    'bg-gray-100 dark:bg-gray-900/50'
                )}>
                    <ActivityIcon type={activity.type}/>
                </div>
                <div className="flex-1">
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: activity.description }}></p>
                  {activity.details && (
                     <Badge variant="outline" className={cn("mt-1 text-xs",
                        activity.details.type === 'positive' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300' :
                        activity.details.type === 'negative' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300' :
                         'border-muted-foreground text-muted-foreground bg-muted/50'
                     )}>{activity.details.text}</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3"/> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
};

export default DashboardPage;
