// src/app/leaderboard/page.tsx
'use client'; // This page uses client-side hooks like useState and useEffect

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboardData, getHistoricalWinners } from '@/services/api';
import type { LeaderboardEntry, HistoricalWinner } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RAGIndicator from '@/components/shared/RAGIndicator';
import CityBadge from '@/components/shared/CityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, TrendingDown, Minus, Trophy, Clock, User, AlertCircle } from 'lucide-react';
import PodiumScene from '@/components/Leaderboard/PodiumScene';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Placeholder Loading Component
const LoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Top Performers Skeleton */}
     <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-48" />
      </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-card to-muted/30">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-10 rounded-full border-2 border-primary/50" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-sm">
                 <Skeleton className="h-4 w-10" />
                 <Skeleton className="h-6 w-12" />
            </div>
            <div className="flex items-center justify-between text-sm">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-4 w-8" />
            </div>
             <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <Skeleton className="h-4 w-20" />
                 <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                 </div>
             </div>
          </CardContent>
        </Card>
      ))}
    </div>

     {/* Podium Skeleton */}
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
         <Skeleton className="h-6 w-6" />
         <Skeleton className="h-6 w-40" />
      </h2>
     <Card className="h-[400px] lg:h-[450px] flex items-center justify-center shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
        <Skeleton className="h-3/4 w-3/4" />
    </Card>

    {/* Historical Winners Skeleton */}
     <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
         <Skeleton className="h-6 w-6" />
         <Skeleton className="h-6 w-44" />
      </h2>
     <Card className="overflow-hidden shadow-md border rounded-lg">
       <CardContent className="p-4">
         <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="flex-shrink-0 w-36 text-center space-y-2 p-3 rounded-lg">
               <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2 border-2 border-primary/30 shadow-sm" />
               <Skeleton className="h-4 w-20 mx-auto" />
               <Skeleton className="h-5 w-16 mx-auto rounded-full" /> {/* Badge */}
               <Skeleton className="h-3 w-16 mx-auto" />
             </div>
           ))}
         </div>
       </CardContent>
     </Card>

    {/* Leaderboard Table Skeleton */}
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-40" />
      </h2>
    <Card className="shadow-md border rounded-lg overflow-hidden">
       <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px] text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableHead>
              <TableHead className="w-[80px] text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead className="text-center hidden sm:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableHead>
              <TableHead className="text-center hidden md:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></TableHead>
              <TableHead className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                 <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell>
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </TableCell>
                 <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-16 rounded-full mx-auto" /></TableCell>
                 <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                 <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                 <TableCell>
                     <div className="flex items-center justify-center space-x-1.5">
                         <Skeleton className="h-3 w-3 rounded-full" />
                         <Skeleton className="h-3 w-3 rounded-full" />
                         <Skeleton className="h-3 w-3 rounded-full" />
                     </div>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const [historicalWinners, setHistoricalWinners] = useState<HistoricalWinner[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setLeaderboardData(null); // Reset data on new fetch
      setHistoricalWinners(null);
      try {
        // Simulate parallel fetching
        const [leaderboardResult, winnersResult] = await Promise.allSettled([
          getLeaderboardData(),
          getHistoricalWinners()
        ]);

        let fetchedLeaderboard: LeaderboardEntry[] = [];
        let fetchedWinners: HistoricalWinner[] = [];

        if (leaderboardResult.status === 'fulfilled') {
          // Add rank changes (this is mock logic, replace with real calculation if available)
          fetchedLeaderboard = leaderboardResult.value.map(entry => ({
              ...entry,
              rankChange: Math.floor(Math.random() * 3) - 1 // Random -1, 0, 1
          }));
          setLeaderboardData(fetchedLeaderboard);
        } else {
          console.error("Failed to load leaderboard data:", leaderboardResult.reason);
          setError(prev => prev ? `${prev} Leaderboard data failed.` : "Leaderboard data failed.");
        }

        if (winnersResult.status === 'fulfilled') {
          fetchedWinners = winnersResult.value;
          setHistoricalWinners(fetchedWinners);
        } else {
           console.error("Failed to load historical winners:", winnersResult.reason);
           setError(prev => prev ? `${prev} Historical winners failed.` : "Historical winners failed.");
        }

      } catch (err) { // Catch any unexpected errors during Promise.allSettled or processing
        console.error("Unexpected error fetching data:", err);
        setError("An unexpected error occurred while loading data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize derived data to avoid recalculations
  const topPerformers = React.useMemo(() => leaderboardData?.slice(0, 3) ?? [], [leaderboardData]);
  const podiumPerformers = React.useMemo(() => topPerformers.map(p => ({
        project_id: p.id,
        city: p.city,
        rag_status: p.ragStatus.status,
        run_rate: p.score,
        last_updated: new Date().toISOString(),
        rank: p.rank,
  })), [topPerformers]);

   const getRankChangeIcon = (change: number | undefined) => {
      if (change === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
      if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-500" />;
    };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Display error if any part of the data fetching failed
   if (error && !leaderboardData && !historicalWinners) {
    return (
        <div className="container mx-auto px-4 py-8">
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading Data</AlertTitle>
               <AlertDescription>
                   {error} Please try refreshing the page.
               </AlertDescription>
             </Alert>
        </div>
     );
   }

   // Handle case where one fetch might fail but the other succeeds
    const partialError = error && (leaderboardData || historicalWinners);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <Trophy className="text-primary h-7 w-7" /> Leaderboard Overview
      </h1>

      {/* Display partial error message if needed */}
      {partialError && (
           <Alert variant="destructive" className="mb-6">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Partial Data Load</AlertTitle>
             <AlertDescription>
                 Could not load all data: {error} Some sections might be incomplete.
             </AlertDescription>
           </Alert>
      )}

      {/* Top Performers Cards - Only render if data is available */}
      {leaderboardData && leaderboardData.length > 0 && (
        <section>
           <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Award className="text-secondary h-6 w-6"/> Top 3 Performers
           </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformers.map((performer, index) => (
              <motion.div
                  key={performer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-primary/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-card to-muted/30">
                      <CardTitle className="text-lg font-semibold">{performer.name}</CardTitle>
                      <Avatar className="h-10 w-10 border-2 border-primary/50">
                        <AvatarImage src={performer.profilePic} alt={performer.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{performer.name.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">City:</span>
                         <CityBadge city={performer.city} />
                       </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-bold text-lg text-primary">{performer.score}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Projects:</span>
                        <span className="font-medium">{performer.projectCount}</span>
                      </div>
                       <div className="flex items-center justify-between text-sm pt-2 border-t">
                         <span className="text-muted-foreground">RAG Status:</span>
                         <div className="flex items-center space-x-2">
                           <TooltipProvider>
                               {performer.ragStatus?.green !== undefined && (
                                 <Tooltip>
                                   <TooltipTrigger>
                                     <RAGIndicator status="Green" count={performer.ragStatus.green} />
                                   </TooltipTrigger>
                                   <TooltipContent>Green: {performer.ragStatus.green}</TooltipContent>
                                 </Tooltip>
                               )}
                                {performer.ragStatus?.amber !== undefined && (
                                 <Tooltip>
                                   <TooltipTrigger>
                                     <RAGIndicator status="Amber" count={performer.ragStatus.amber} />
                                   </TooltipTrigger>
                                   <TooltipContent>Amber: {performer.ragStatus.amber}</TooltipContent>
                                 </Tooltip>
                                )}
                                {performer.ragStatus?.red !== undefined && (
                                  <Tooltip>
                                   <TooltipTrigger>
                                     <RAGIndicator status="Red" count={performer.ragStatus.red} />
                                   </TooltipTrigger>
                                   <TooltipContent>Red: {performer.ragStatus.red}</TooltipContent>
                                 </Tooltip>
                                )}
                           </TooltipProvider>
                         </div>
                       </div>
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}
       {leaderboardData && leaderboardData.length === 0 && !isLoading && !error && (
         <p className="text-muted-foreground text-center py-4">No top performers data available currently.</p>
       )}


       {/* 3D Podium Visualization - Only render if data is available */}
       {podiumPerformers.length > 0 && (
         <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               <Trophy className="text-secondary h-6 w-6"/> Podium Finishers
             </h2>
            <Card className="h-[400px] lg:h-[450px] overflow-hidden shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
              <CardContent className="p-0 h-full w-full flex items-center justify-center">
                  <PodiumScene performers={podiumPerformers} />
              </CardContent>
            </Card>
         </section>
       )}
        {podiumPerformers.length === 0 && leaderboardData && !isLoading && !error && (
            <Card className="h-[100px] flex items-center justify-center shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
                <p className="text-muted-foreground">Not enough data for podium visualization.</p>
            </Card>
        )}


      {/* Historical Winners - Only render if data is available */}
      {historicalWinners && historicalWinners.length > 0 && (
        <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               <Clock className="text-secondary h-6 w-6"/> Past Weekly Winners
             </h2>
            <Card className="overflow-hidden shadow-md border rounded-lg">
                <CardContent className="p-4">
                   <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                      {historicalWinners.map((winner) => (
                         <motion.div
                           key={winner.week}
                           className="flex-shrink-0 w-36 text-center space-y-2 p-3 rounded-lg hover:bg-accent transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                           <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-primary/30 shadow-sm">
                             <AvatarImage src={winner.profilePic} alt={winner.name} data-ai-hint="person portrait trophy"/>
                             <AvatarFallback>{winner.name.substring(0, 1)}</AvatarFallback>
                           </Avatar>
                           <p className="text-sm font-medium">{winner.name}</p>
                           <CityBadge city={winner.city} className="mx-auto" />
                           <p className="text-xs text-muted-foreground">Week {winner.week}</p>
                         </motion.div>
                       ))}
                   </div>
               </CardContent>
            </Card>
        </section>
      )}
       {historicalWinners && historicalWinners.length === 0 && !isLoading && !error && (
           <Card className="overflow-hidden shadow-md border rounded-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Clock className="text-secondary h-5 w-5"/> Past Weekly Winners</CardTitle>
                </CardHeader>
               <CardContent>
                   <p className="text-muted-foreground pl-4 py-4">No historical winner data available.</p>
               </CardContent>
           </Card>
       )}


      {/* Complete Leaderboard Table - Only render if data is available */}
      {leaderboardData && leaderboardData.length > 0 && (
        <section>
           <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Users className="text-secondary h-6 w-6"/> Full Leaderboard
           </h2>
          <Card className="shadow-md border rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">Rank</TableHead>
                    <TableHead className="w-[80px] text-center">Change</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">City</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Projects</TableHead>
                    <TableHead className="text-center">RAG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-center">{entry.rank ?? '-'}</TableCell>
                      <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center justify-center">{getRankChangeIcon(entry.rankChange)}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                   {entry.rankChange !== undefined ? (
                                       <p>Rank change from last week: {entry.rankChange > 0 ? `+${entry.rankChange}` : entry.rankChange}</p>
                                   ) : (
                                       <p>Rank change unavailable</p>
                                   )}
                                </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.profilePic} alt={entry.name} data-ai-hint="person avatar"/>
                            <AvatarFallback>{entry.name ? entry.name.substring(0, 1) : '?'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.name ?? 'N/A'}</span>
                        </div>
                      </TableCell>
                       <TableCell className="text-center hidden sm:table-cell">
                          {entry.city ? <CityBadge city={entry.city} /> : '-'}
                       </TableCell>
                      <TableCell className="text-right font-semibold text-primary">{entry.score ?? '-'}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">{entry.projectCount ?? '-'}</TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center space-x-1.5">
                           {entry.ragStatus?.green !== undefined ? <RAGIndicator status="Green" count={entry.ragStatus.green} size="sm" /> : <span className="text-muted-foreground">-</span>}
                           {entry.ragStatus?.amber !== undefined ? <RAGIndicator status="Amber" count={entry.ragStatus.amber} size="sm" /> : <span className="text-muted-foreground">-</span>}
                           {entry.ragStatus?.red !== undefined ? <RAGIndicator status="Red" count={entry.ragStatus.red} size="sm" /> : <span className="text-muted-foreground">-</span>}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}
      {leaderboardData && leaderboardData.length === 0 && !isLoading && !error && (
            <Card>
                <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2"><Users className="text-secondary h-5 w-5"/> Full Leaderboard</CardTitle>
                 </CardHeader>
                <CardContent>
                     <p className="text-center text-muted-foreground py-8">No leaderboard data available.</p>
                </CardContent>
            </Card>
      )}


        {/* Message shown if both fetches failed initially */}
       {!leaderboardData && !historicalWinners && !isLoading && error && (
             <p className="text-center text-muted-foreground py-8">
                 Failed to load leaderboard and historical data. Please try again later.
             </p>
       )}
    </motion.div>
  );
};

export default LeaderboardPage;
