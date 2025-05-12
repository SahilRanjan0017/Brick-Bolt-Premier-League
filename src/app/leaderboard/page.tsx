// src/app/leaderboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getLeaderboardPageData, getDashboardStats } from '@/services/api';
import type { LeaderboardEntry, OMTrendData, LeaderboardPageData, HistoricalWinner, DashboardStatsData, Role as RoleType, StatCardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart as RechartsBarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, BarChart3, Crown, UserCheck, UserCog, AlertCircle, History, Award, ArrowUp, ArrowDown, Minus, ListChecks, PieChart as PieChartIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CityBadge from '@/components/shared/CityBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RAGIndicator from '@/components/shared/RAGIndicator';
import StatCard from '@/components/dashboard/StatCard'; // Import the new StatCard

const PodiumScenePlaceholder = () => (
     <Card className="shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background h-[350px] flex items-center justify-center">
        <div className="text-center p-4">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-muted-foreground">3D Podium Visualization Area</p>
            <p className="text-sm text-muted-foreground/80">(Placeholder for 3D content)</p>
        </div>
     </Card>
);

const getBarColor = (index: number) => {
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
    return colors[index % colors.length];
};

interface PodiumChartProps {
    data: LeaderboardEntry[];
    title: string;
    icon: React.ElementType;
}

const PodiumChart: React.FC<PodiumChartProps> = ({ data, title, icon: Icon }) => (
    <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="text-secondary h-5 w-5" /> Top 3 {title}
            </CardTitle>
            <CardDescription>By RAG Score</CardDescription>
        </CardHeader>
        <CardContent className="h-60 pr-4 -ml-1"> {/* Adjusted margin/padding for recharts */}
             {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}> {/* Increased left margin */}
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))"/>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={85}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, textAnchor: 'end' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                           cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                           contentStyle={{
                               backgroundColor: 'hsl(var(--background))',
                               borderColor: 'hsl(var(--border))',
                               borderRadius: 'var(--radius)',
                               fontSize: '12px',
                           }}
                           itemStyle={{ color: 'hsl(var(--foreground))' }}
                           labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}
                           formatter={(value: number) => [`${value}%`, `RAG Score`]}
                        />
                        <Bar dataKey="score" name="RAG Score" barSize={20} radius={[0, 4, 4, 0]}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${entry.id}`} fill={getBarColor(index)} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                     No data available
                </div>
             )}
        </CardContent>
    </Card>
);

interface OMTrendChartProps {
    data: OMTrendData;
}

const OMTrendChart: React.FC<OMTrendChartProps> = ({ data }) => (
    <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="text-primary h-5 w-5" /> {data.omName} - 8 Week RAG Score
            </CardTitle>
            <CardDescription className="text-xs">
                {data.subordinateRanks && data.subordinateRanks.length > 0 ? (
                    `Latest Ranks (Wk ${data.subordinateRanks[data.subordinateRanks.length - 1]?.week}): TL - ${data.subordinateRanks[data.subordinateRanks.length - 1]?.tlRank ?? 'N/A'}, SPM - ${data.subordinateRanks[data.subordinateRanks.length - 1]?.spmRank ?? 'N/A'}`
                 ) : "Subordinate ranks unavailable."}
            </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pr-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyScores} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <YAxis domain={[40, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}/>
                     <Tooltip
                           contentStyle={{
                               backgroundColor: 'hsl(var(--background))',
                               borderColor: 'hsl(var(--border))',
                               borderRadius: 'var(--radius)',
                               fontSize: '12px',
                           }}
                           itemStyle={{ color: 'hsl(var(--foreground))' }}
                           labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}
                         />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="score" name="Aggregated RAG Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3, fill: 'hsl(var(--primary))' }}/>
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

interface HistoricalWinnersListProps {
    winners: HistoricalWinner[];
    titleSuffix?: string;
}

const HistoricalWinnersList: React.FC<HistoricalWinnersListProps> = ({ winners, titleSuffix }) => (
     <Card className="shadow-md border rounded-lg overflow-hidden">
         <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <History className="text-secondary h-5 w-5"/> Past Weekly Winners {titleSuffix ? `(${titleSuffix})` : ''}
            </CardTitle>
            <CardDescription>Top performers from the last 8 weeks</CardDescription>
         </CardHeader>
        <CardContent className="pt-0 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
             {winners && winners.length > 0 ? (
                <ul className="space-y-3 divide-y divide-border">
                    {winners.map((winner) => (
                        <li key={`${winner.week}-${winner.name}-${winner.city}-${titleSuffix}`} className="flex items-center justify-between pt-3 first:pt-0">
                           <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={winner.profilePic} alt={winner.name} data-ai-hint="person winner"/>
                                    <AvatarFallback>{winner.name.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{winner.name}</p>
                                    <CityBadge city={winner.city} className="text-xs px-1.5 py-0"/>
                                </div>
                            </div>
                           <span className="text-xs font-semibold text-muted-foreground">Week {winner.week}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                 <p className="text-center text-muted-foreground py-6">No historical winner data available.</p>
             )}
         </CardContent>
     </Card>
);


const LoadingSkeleton = () => (
    <div className="space-y-8">
         {/* Performance Scoreboard Skeleton */}
        <Skeleton className="h-8 w-72 mb-1" />
        <Skeleton className="h-4 w-96 mb-6" />
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-7 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <Skeleton className="h-5 w-24" /> <Skeleton className="h-8 w-8 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" /> <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>

         <Skeleton className="h-8 w-64 mb-6 mt-10" />
         {[...Array(3)].map((_,i) => (
            <div key={`skel-dup-${i}`} className="space-y-8 border-b pb-12 last:border-b-0 last:pb-0">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, j) => (
                        <Card key={`skel-podium-main-${i}-${j}`}> <CardHeader><Skeleton className="h-6 w-32" /> <Skeleton className="h-4 w-24 mt-1" /></CardHeader> <CardContent className="h-60"><Skeleton className="h-full w-full" /></CardContent> </Card>
                    ))}
                </div>
                <Card className="h-[350px] flex items-center justify-center"> <Skeleton className="h-3/4 w-3/4" /> </Card>
                <Card> <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-56 mt-1" /></CardHeader> <CardContent className="pt-0 space-y-3">{[...Array(3)].map((_, k) => ( <div key={`skel-hist-main-${i}-${k}`} className="flex items-center justify-between pt-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full"/><div><Skeleton className="h-4 w-24 mb-1"/><Skeleton className="h-3 w-16 rounded-full"/></div></div><Skeleton className="h-4 w-12"/></div> ))}</CardContent> </Card>
            </div>
         ))}
        <Skeleton className="h-6 w-40 mb-4 mt-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                 <Card key={`om-skel-${i}`}> <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32 mt-1" /></CardHeader> <CardContent className="h-64"><Skeleton className="h-full w-full" /></CardContent> </Card>
             ))}
        </div>
        <Skeleton className="h-6 w-40 mb-4 mt-8" />
        <Card><CardContent className="p-0"><Skeleton className="w-full h-96" /></CardContent></Card>
    </div>
);


const LeaderboardPage: React.FC = () => {
    const [pageData, setPageData] = useState<LeaderboardPageData | null>(null);
    const [dashboardDataLDB, setDashboardDataLDB] = useState<DashboardStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedScoreboardRole, setSelectedScoreboardRole] = useState<RoleType>("All Roles");
    const [selectedScoreboardWeek, setSelectedScoreboardWeek] = useState<string>("This Week");


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [leaderboardPageResult, dashboardStatsResult] = await Promise.allSettled([
                    getLeaderboardPageData(),
                    getDashboardStats({ role: selectedScoreboardRole === 'All Roles' ? undefined : selectedScoreboardRole, week: selectedScoreboardWeek })
                ]);

                if (leaderboardPageResult.status === 'fulfilled') {
                    setPageData(leaderboardPageResult.value);
                } else {
                    console.error("Failed to load leaderboard page data:", leaderboardPageResult.reason);
                    setError(prev => prev ? `${prev} Leaderboard data failed.` : "Leaderboard data failed.");
                }

                if (dashboardStatsResult.status === 'fulfilled') {
                    setDashboardDataLDB(dashboardStatsResult.value);
                } else {
                    console.error("Failed to load dashboard stats for leaderboard page:", dashboardStatsResult.reason);
                     setError(prev => prev ? `${prev} Scoreboard data failed.` : "Scoreboard data failed.");
                }

            } catch (err) {
                console.error("Failed to load page data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [selectedScoreboardRole, selectedScoreboardWeek]);

    const duplicatedHistoricalWinners = useMemo(() => {
        if (!pageData) return [[], [], []];
        return [
            pageData.historicalWinnersOM || [],
            pageData.historicalWinnersTL || [],
            pageData.historicalWinnersSPM || [],
        ];
    }, [pageData]);


    if (isLoading) return <LoadingSkeleton />;
    if (error && !pageData && !dashboardDataLDB) return ( <div className="container mx-auto px-4 py-8"> <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> </div> );
    // Allow rendering if some data is available even with partial error
    // if (!pageData) return <p className="text-center text-muted-foreground mt-6 py-8">No main leaderboard data available.</p>;

    const { topPerformers, omTrends, fullLeaderboard, historicalWinners } = pageData || {};

    const RankChangeIcon = ({ change }: { change?: number }) => {
        if (change === undefined || change === null || change === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
        if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
        return <ArrowDown className="h-3 w-3 text-red-500" />;
    };

    const statCardsDisplayData = dashboardDataLDB ? [
        dashboardDataLDB.activeProjects,
        dashboardDataLDB.greenProjects,
        dashboardDataLDB.amberProjects,
        dashboardDataLDB.redProjects,
    ] : [];


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
        >
             {/* Moved Performance Scoreboard Section */}
            <section className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground">Brick & Bolt Premier League Dashboard</h1>
                <p className="text-muted-foreground">
                    Track performance, celebrate achievements, and compete for the top spot in our construction championship.
                </p>
                <Card className="shadow-lg rounded-xl border">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <PieChartIcon className="h-6 w-6 text-primary" /> Performance Scoreboard
                            </CardTitle>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Select value={selectedScoreboardRole} onValueChange={(value) => setSelectedScoreboardRole(value as RoleType)}>
                                    <SelectTrigger className="w-full sm:w-[160px] bg-card">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Roles">All Roles</SelectItem>
                                        <SelectItem value="OM">OM</SelectItem>
                                        <SelectItem value="TL">TL</SelectItem>
                                        <SelectItem value="SPM">SPM</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedScoreboardWeek} onValueChange={setSelectedScoreboardWeek}>
                                    <SelectTrigger className="w-full sm:w-[160px] bg-card">
                                        <SelectValue placeholder="This Week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="This Week">This Week</SelectItem>
                                        <SelectItem value="Last Week">Last Week</SelectItem>
                                        <SelectItem value="Last Month">Last Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        {isLoading && !dashboardDataLDB && Array.from({length: 4}).map((_,idx) => <Skeleton key={`stat-skel-${idx}`} className="h-[120px] w-full" />)}
                        {!isLoading && dashboardDataLDB && statCardsDisplayData.map((statData) => (
                            statData ? <StatCard key={statData.title} data={statData} /> : null
                        ))}
                         {!isLoading && !dashboardDataLDB && <p className="col-span-full text-center text-muted-foreground py-4">Scoreboard data could not be loaded.</p>}
                    </CardContent>
                </Card>
            </section>
        </motion.div>
    );
};

export default LeaderboardPage;
