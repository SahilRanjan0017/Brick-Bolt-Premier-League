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
import { Award, TrendingUp, TrendingDown, Minus, Trophy, Clock, User } from 'lucide-react';
import PodiumScene from '@/components/Leaderboard/PodiumScene'; // Re-use existing podium if suitable

// Placeholder Loading Component
const LoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Top Performers Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-4 w-12 mb-4" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>

     {/* Podium Skeleton */}
    <Card className="h-[400px] flex items-center justify-center">
        <Skeleton className="h-3/4 w-3/4" />
    </Card>

    {/* Historical Winners Skeleton */}
     <Card>
       <CardHeader>
         <Skeleton className="h-6 w-40" />
       </CardHeader>
       <CardContent className="flex space-x-4 overflow-x-auto pb-4">
         {[...Array(8)].map((_, i) => (
           <div key={i} className="flex-shrink-0 w-32 text-center space-y-2">
             <Skeleton className="h-16 w-16 rounded-full mx-auto" />
             <Skeleton className="h-4 w-20 mx-auto" />
             <Skeleton className="h-3 w-16 mx-auto" />
           </div>
         ))}
       </CardContent>
     </Card>

    {/* Leaderboard Table Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(7)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<HistoricalWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [leaderboard, winners] = await Promise.all([
          getLeaderboardData(),
          getHistoricalWinners()
        ]);
        // Add rank changes (this is mock logic, replace with real calculation if available)
        const dataWithRankChange = leaderboard.map(entry => ({
            ...entry,
            rankChange: Math.floor(Math.random() * 3) - 1 // Random -1, 0, 1
        }));
        setLeaderboardData(dataWithRankChange);
        setHistoricalWinners(winners);
      } catch (err) {
        console.error("Failed to load leaderboard data:", err);
        setError("Could not load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const topPerformers = leaderboardData.slice(0, 3);
  const podiumPerformers = leaderboardData.slice(0, 3).map(p => ({ // Adapt data for PodiumScene
        project_id: p.id,
        city: p.city,
        rag_status: p.ragStatus.status, // Assuming RAGIndicator returns 'Green', 'Amber', 'Red'
        run_rate: p.score, // Use score as run_rate for podium height
        last_updated: new Date().toISOString(), // Mock last updated
        rank: p.rank,
  }));

   const getRankChangeIcon = (change: number) => {
      if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-500" />;
    };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
      return <div className="text-center text-red-600">{error}</div>;
  }

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

      {/* Top Performers Cards */}
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
                             <Tooltip>
                               <TooltipTrigger>
                                 <RAGIndicator status="Green" count={performer.ragStatus.green} />
                               </TooltipTrigger>
                               <TooltipContent>Green: {performer.ragStatus.green}</TooltipContent>
                             </Tooltip>
                              <Tooltip>
                               <TooltipTrigger>
                                 <RAGIndicator status="Amber" count={performer.ragStatus.amber} />
                               </TooltipTrigger>
                               <TooltipContent>Amber: {performer.ragStatus.amber}</TooltipContent>
                             </Tooltip>
                              <Tooltip>
                               <TooltipTrigger>
                                 <RAGIndicator status="Red" count={performer.ragStatus.red} />
                               </TooltipTrigger>
                               <TooltipContent>Red: {performer.ragStatus.red}</TooltipContent>
                             </Tooltip>
                         </TooltipProvider>
                       </div>
                     </div>
                  </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>
      </section>

       {/* 3D Podium Visualization */}
      <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Trophy className="text-secondary h-6 w-6"/> Podium Finishers
           </h2>
          <Card className="h-[400px] lg:h-[450px] overflow-hidden shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
            <CardContent className="p-0 h-full w-full flex items-center justify-center">
               {podiumPerformers.length > 0 ? (
                  <PodiumScene performers={podiumPerformers} />
               ) : (
                  <p className="text-muted-foreground">Podium data not available.</p>
               )}
            </CardContent>
          </Card>
      </section>

      {/* Historical Winners */}
      <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Clock className="text-secondary h-6 w-6"/> Past Weekly Winners
           </h2>
          <Card className="overflow-hidden shadow-md border rounded-lg">
              <CardContent className="p-4">
                 <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {historicalWinners.length > 0 ? historicalWinners.map((winner) => (
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
                     )) : <p className="text-muted-foreground pl-4">No historical winner data available.</p>}
                 </div>
             </CardContent>
          </Card>
      </section>

      {/* Complete Leaderboard Table */}
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
                {leaderboardData.length > 0 ? leaderboardData.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold text-center">{entry.rank}</TableCell>
                    <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center justify-center">{getRankChangeIcon(entry.rankChange)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>Rank change from last week: {entry.rankChange > 0 ? `+${entry.rankChange}` : entry.rankChange}</p>
                              </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                     </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.profilePic} alt={entry.name} data-ai-hint="person avatar"/>
                          <AvatarFallback>{entry.name.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                    </TableCell>
                     <TableCell className="text-center hidden sm:table-cell">
                        <CityBadge city={entry.city} />
                     </TableCell>
                    <TableCell className="text-right font-semibold text-primary">{entry.score}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">{entry.projectCount}</TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center space-x-1.5">
                         <RAGIndicator status="Green" count={entry.ragStatus.green} size="sm" />
                         <RAGIndicator status="Amber" count={entry.ragStatus.amber} size="sm" />
                         <RAGIndicator status="Red" count={entry.ragStatus.red} size="sm" />
                       </div>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No leaderboard data available.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
};

export default LeaderboardPage;
