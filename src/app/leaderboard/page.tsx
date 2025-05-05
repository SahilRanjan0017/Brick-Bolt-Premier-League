// src/app/leaderboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getLeaderboardPageData } from '@/services/api'; // Updated API call
import type { LeaderboardEntry, OMTrendData, LeaderboardPageData, HistoricalWinner } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, BarChart3, Crown, UserCheck, UserCog, AlertCircle, History, Award } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CityBadge from '@/components/shared/CityBadge';
import { Separator } from '@/components/ui/separator';

// Dynamic import for PodiumScene (placeholder for now)
const PodiumScenePlaceholder = () => (
     <Card className="shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background h-[350px] flex items-center justify-center">
        <div className="text-center p-4">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-muted-foreground">3D Podium Visualization Area</p>
            <p className="text-sm text-muted-foreground/80">(Placeholder: Three.js component would render here)</p>
        </div>
     </Card>
);

// --- Chart Color Logic ---
const getBarColor = (index: number) => {
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']; // Gold, Silver, Bronze-ish
    return colors[index % colors.length];
};

// --- Components ---

// Podium Chart for Top 3 by Role
interface PodiumChartProps {
    data: LeaderboardEntry[];
    title: string;
    icon: React.ElementType;
}

const PodiumChart: React.FC<PodiumChartProps> = ({ data, title, icon: Icon }) => (
    <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className="text-secondary h-5 w-5" /> Top 3 {title}
            </CardTitle>
            <CardDescription>By RAG Score</CardDescription>
        </CardHeader>
        <CardContent className="h-60 pr-4 -ml-4">
             {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))"/>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={80} // Adjust width for names
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
                           formatter={(value: number) => [`${value}%`, `RAG Score`]} // Format tooltip content
                        />
                        <Bar dataKey="score" name="RAG Score" barSize={20} radius={[0, 4, 4, 0]}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${entry.id}`} fill={getBarColor(index)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                     No data available
                </div>
             )}
        </CardContent>
    </Card>
);

// OM Trend Chart
interface OMTrendChartProps {
    data: OMTrendData;
}

const OMTrendChart: React.FC<OMTrendChartProps> = ({ data }) => (
    <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="text-primary h-5 w-5" /> {data.omName} - 8 Week RAG Score
            </CardTitle>
            {/* Optional: Display latest ranks if available */}
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

// Historical Winners List Component
interface HistoricalWinnersListProps {
    winners: HistoricalWinner[];
}

const HistoricalWinnersList: React.FC<HistoricalWinnersListProps> = ({ winners }) => (
     <Card className="shadow-md border rounded-lg overflow-hidden">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="text-secondary h-5 w-5"/> Past Weekly Winners
            </CardTitle>
            <CardDescription>Top performers from the last 8 weeks</CardDescription>
         </CardHeader>
        <CardContent className="pt-0 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
             {winners && winners.length > 0 ? (
                <ul className="space-y-3 divide-y divide-border">
                    {winners.map((winner) => (
                        <li key={winner.week} className="flex items-center justify-between pt-3">
                           <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={winner.profilePic} alt={winner.name} data-ai-hint="person winner portrait"/>
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


// --- Loading Skeleton ---
const LoadingSkeleton = () => (
    <div className="space-y-8">
         {/* Title Skeleton */}
         <Skeleton className="h-8 w-64 mb-6" />

         {/* Section Title Skeleton */}
         <Skeleton className="h-6 w-40 mb-4" />
         {/* Podium Charts Skeleton */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
             <Card key={i}>
                 <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                 </CardHeader>
                 <CardContent className="h-60">
                     <Skeleton className="h-full w-full" />
                 </CardContent>
             </Card>
           ))}
         </div>

        {/* Podium Scene Skeleton */}
        <Card className="shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background h-[350px] flex items-center justify-center">
             <Skeleton className="h-3/4 w-3/4" />
         </Card>

        {/* Historical Winners Skeleton */}
         <Card>
             <CardHeader>
                 <Skeleton className="h-6 w-48" />
                 <Skeleton className="h-4 w-56 mt-1" />
             </CardHeader>
            <CardContent className="pt-0 space-y-3">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between pt-3">
                         <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full"/>
                            <div>
                                <Skeleton className="h-4 w-24 mb-1"/>
                                <Skeleton className="h-3 w-16 rounded-full"/>
                            </div>
                         </div>
                        <Skeleton className="h-4 w-12"/>
                    </div>
                 ))}
            </CardContent>
         </Card>

        {/* OM Trend Charts Skeleton */}
        <Skeleton className="h-6 w-48 mb-4 mt-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => ( // Assuming 3 OM charts for skeleton
                 <Card key={`om-skel-${i}`}>
                     <CardHeader>
                         <Skeleton className="h-6 w-48" />
                         <Skeleton className="h-4 w-32 mt-1" />
                     </CardHeader>
                     <CardContent className="h-64">
                         <Skeleton className="h-full w-full" />
                     </CardContent>
                 </Card>
             ))}
        </div>
    </div>
);


// --- Leaderboard Page Component ---
const LeaderboardPage: React.FC = () => {
    const [pageData, setPageData] = useState<LeaderboardPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getLeaderboardPageData();
                setPageData(data);
            } catch (err) {
                console.error("Failed to load leaderboard page data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Error Loading Leaderboard Data</AlertTitle>
                   <AlertDescription>
                       {error}. Please try refreshing the page.
                   </AlertDescription>
                 </Alert>
            </div>
         );
    }

    if (!pageData) {
        return <p className="text-center text-muted-foreground mt-6 py-8">No leaderboard data available.</p>;
    }

    const { topPerformers, omTrends, historicalWinners } = pageData; // Extract historicalWinners

    // Duplicate data for display purposes as requested
    const duplicatedTopPerformers = [topPerformers, topPerformers, topPerformers];
    const duplicatedHistoricalWinners = historicalWinners ? [historicalWinners, historicalWinners, historicalWinners] : [[], [], []];


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12" // Increased spacing between sections
        >
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Crown className="text-primary h-7 w-7" /> Leaderboard & Performance Trends
            </h1>

             {/* Duplicated Top Performers, Podium, and Historical Winners Sections */}
            {[0, 1, 2].map((index) => (
                <div key={`duplicate-section-${index}`} className="space-y-8 border-b pb-12 last:border-b-0 last:pb-0">
                    {/* Top Performers by Role */}
                     <section>
                         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="text-secondary h-6 w-6"/> Top Performers by Role (#{index + 1})
                         </h2>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <PodiumChart data={duplicatedTopPerformers[index].om} title="Operations Managers" icon={UserCog} />
                             <PodiumChart data={duplicatedTopPerformers[index].tl} title="Team Leads" icon={Users} />
                             <PodiumChart data={duplicatedTopPerformers[index].spm} title="Senior Project Managers" icon={UserCheck} />
                         </div>
                     </section>

                     {/* Podium Scene Placeholder */}
                     <section>
                         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                           <Award className="text-secondary h-6 w-6" /> Podium Visualization (#{index + 1})
                        </h2>
                        <PodiumScenePlaceholder />
                    </section>

                    {/* Historical Winners */}
                    {duplicatedHistoricalWinners[index].length > 0 && (
                         <section>
                            <HistoricalWinnersList winners={duplicatedHistoricalWinners[index]}/>
                        </section>
                    )}
                     {/* Separator only between duplicated sections */}
                     {/* {index < 2 && <Separator className="my-12"/>} */}
                </div>
            ))}


             {/* OM 8-Week Trends (Only shown once) */}
             <section>
                 <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-secondary h-6 w-6"/> OM 8-Week RAG Score Trends
                 </h2>
                 {omTrends && omTrends.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {omTrends.map(omData => (
                            <OMTrendChart key={omData.omId} data={omData} />
                        ))}
                     </div>
                 ) : (
                     <Card>
                         <CardContent>
                             <p className="text-muted-foreground text-center py-6">No OM trend data available.</p>
                         </CardContent>
                     </Card>
                 )}
            </section>

            {/* Consider adding the full leaderboard table back here if needed */}
            {/* <section> ... Full Leaderboard Table ... </section> */}

        </motion.div>
    );
};

export default LeaderboardPage;

    