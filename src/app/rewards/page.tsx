// src/app/rewards/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboardData, getRewardDetails } from '@/services/api';
import type { LeaderboardEntry, RewardDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CityBadge from '@/components/shared/CityBadge';
import PodiumScene from '@/components/Leaderboard/PodiumScene'; // Reuse podium
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Trophy, Star, Gift, Megaphone, Target, Medal, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Loading Skeleton for Rewards Page
const LoadingSkeleton = () => (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
           <Skeleton className="h-7 w-7" /> <Skeleton className="h-7 w-48" />
        </h1>

        {/* Podium Skeleton */}
         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-52" />
         </h2>
        <Card className="h-[400px] lg:h-[450px] flex items-center justify-center shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
           <Skeleton className="h-3/4 w-3/4" />
        </Card>

        {/* Recognition Cards Skeleton */}
         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-48" />
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
               <Card key={i} className="text-center border rounded-lg overflow-hidden h-full flex flex-col">
                   <CardHeader className="items-center pb-2 bg-gradient-to-b from-muted/10 to-background">
                      <Skeleton className="h-10 w-10 mb-2 rounded-full" /> {/* Icon */}
                      <Skeleton className="h-6 w-32 mt-1" /> {/* Title */}
                      <Skeleton className="h-4 w-40 mt-1" /> {/* Description */}
                   </CardHeader>
                   <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center">
                       <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3 border-2 border-muted shadow-md" />
                       <Skeleton className="h-5 w-28 mx-auto" /> {/* Name */}
                       <Skeleton className="h-5 w-16 mx-auto mt-2 rounded-full" /> {/* Badge */}
                   </CardContent>
               </Card>
           ))}
        </div>

        {/* Incentive Structure Skeleton */}
         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-48" />
          </h2>
        <Card className="shadow-md border rounded-lg overflow-hidden">
             <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ops">
                        <AccordionTrigger className="hover:no-underline">
                           <div className="flex items-center gap-2 w-full">
                              <Skeleton className="h-5 w-5" />
                              <Skeleton className="h-5 w-32" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="vm">
                         <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2 w-full">
                               <Skeleton className="h-5 w-5" />
                               <Skeleton className="h-5 w-32" />
                             </div>
                         </AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-2">
                           <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>

         {/* Recognition Programs Skeleton */}
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-52" />
          </h2>
         <Card className="shadow-md border rounded-lg overflow-hidden">
            <CardContent className="p-6 space-y-4">
                <div>
                     <Skeleton className="h-5 w-36 mb-2" /> {/* Title */}
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-4/5" />
                </div>
                 <div className="border-t pt-4">
                      <Skeleton className="h-5 w-40 mb-2" /> {/* Title */}
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                 </div>
            </CardContent>
         </Card>
    </div>
);

const RewardsPage: React.FC = () => {
    const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[] | null>(null);
    const [rewardDetails, setRewardDetails] = useState<RewardDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // We need full leaderboard data to reliably find awardees if they aren't in top 3
    // Alternatively, modify the API or add a separate endpoint to get user details by ID
    const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setTopPerformers(null);
            setRewardDetails(null);
            setFullLeaderboard(null);

            try {
                // Fetch all data concurrently
                 const [leaderboardResult, rewardsResult] = await Promise.allSettled([
                    getLeaderboardData(), // Fetch full leaderboard first
                    getRewardDetails()
                ]);

                let fetchedLeaderboard: LeaderboardEntry[] = [];

                if (leaderboardResult.status === 'fulfilled') {
                    fetchedLeaderboard = leaderboardResult.value;
                    setFullLeaderboard(fetchedLeaderboard);
                    setTopPerformers(fetchedLeaderboard.slice(0, 3)); // Derive top 3 from full list
                } else {
                    console.error("Failed to load leaderboard data:", leaderboardResult.reason);
                    setError(prev => prev ? `${prev} Leaderboard data failed.` : "Leaderboard data failed.");
                }

                if (rewardsResult.status === 'fulfilled') {
                     setRewardDetails(rewardsResult.value);
                } else {
                     console.error("Failed to load reward details:", rewardsResult.reason);
                     setError(prev => prev ? `${prev} Reward details failed.` : "Reward details failed.");
                 }

            } catch (err) {
                 console.error("Unexpected error fetching rewards data:", err);
                 setError("An unexpected error occurred while loading data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const podiumPerformers = React.useMemo(() => {
        return (topPerformers ?? []).map(p => ({
            project_id: p.id,
            city: p.city,
            rag_status: p.ragStatus?.status ?? 'N/A', // Handle potential undefined
            run_rate: p.score,
            last_updated: new Date().toISOString(),
            rank: p.rank,
        }));
    }, [topPerformers]);


    // Helper to find awardee data using the full leaderboard
    const findAwardee = (awardeeId: string | null): LeaderboardEntry | undefined => {
        if (!awardeeId || !fullLeaderboard) return undefined;
        return fullLeaderboard.find(p => p.id === awardeeId);
    }

    const employeeOfTheMonth = useMemo(() => findAwardee(rewardDetails?.awards?.employeeOfMonth?.awardeeId ?? null), [rewardDetails, fullLeaderboard]);
    const cityChampion = useMemo(() => findAwardee(rewardDetails?.awards?.cityChampion?.awardeeId ?? null), [rewardDetails, fullLeaderboard]);
    const innovationAwardee = useMemo(() => findAwardee(rewardDetails?.awards?.innovationAward?.awardeeId ?? null), [rewardDetails, fullLeaderboard]);


    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Handle total failure
    if (error && !topPerformers && !rewardDetails) {
         return (
             <div className="container mx-auto px-4 py-8">
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Error Loading Rewards Page</AlertTitle>
                   <AlertDescription>
                       {error} Please try refreshing the page.
                   </AlertDescription>
                 </Alert>
             </div>
         );
    }

    // Handle partial failure
     const partialError = error && (topPerformers || rewardDetails);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Gift className="text-primary h-7 w-7" /> Rewards & Recognition
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

            {/* Podium Visualization - Only render if data is available */}
            {podiumPerformers.length > 0 ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="text-secondary h-6 w-6" /> Current Top Performers
                    </h2>
                    <Card className="h-[400px] lg:h-[450px] overflow-hidden shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
                       <CardContent className="p-0 h-full w-full flex items-center justify-center">
                           <PodiumScene performers={podiumPerformers} />
                       </CardContent>
                    </Card>
                </section>
             ) : (
                 topPerformers !== null && !isLoading && ( // Only show if loading finished and data is confirmed empty
                     <section>
                         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                             <Trophy className="text-secondary h-6 w-6" /> Current Top Performers
                         </h2>
                         <Card className="h-[100px] flex items-center justify-center shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
                             <p className="text-muted-foreground">Leaderboard data not available for podium.</p>
                         </Card>
                     </section>
                 )
             )}

            {/* Recognition Cards - Only render if data is available */}
            {rewardDetails ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Star className="text-secondary h-6 w-6" /> Special Recognitions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Employee of the Month */}
                       <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                           <Card className="text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col">
                               <CardHeader className="items-center pb-2 bg-gradient-to-b from-amber-100 to-background dark:from-amber-900/30">
                                   <Medal className="h-10 w-10 text-amber-500 mb-2" />
                                   <CardTitle>{rewardDetails.awards.employeeOfMonth?.title ?? 'Employee of the Month'}</CardTitle>
                                   <CardDescription>Awarded for exceptional performance</CardDescription>
                               </CardHeader>
                               <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center min-h-[150px]">
                                   {employeeOfTheMonth ? (
                                       <>
                                           <Avatar className="h-16 w-16 mb-3 border-2 border-amber-400 shadow-md">
                                               <AvatarImage src={employeeOfTheMonth.profilePic} alt={employeeOfTheMonth.name} data-ai-hint="employee award portrait"/>
                                               <AvatarFallback>{employeeOfTheMonth.name.substring(0, 1)}</AvatarFallback>
                                           </Avatar>
                                           <p className="font-semibold text-lg">{employeeOfTheMonth.name}</p>
                                           <CityBadge city={employeeOfTheMonth.city} className="mt-1" />
                                       </>
                                   ) : (
                                        <p className="text-muted-foreground">To be announced</p>
                                   )}
                               </CardContent>
                           </Card>
                       </motion.div>

                        {/* City Champion */}
                       <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                           <Card className="text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col">
                               <CardHeader className="items-center pb-2 bg-gradient-to-b from-blue-100 to-background dark:from-blue-900/30">
                                   <Award className="h-10 w-10 text-blue-500 mb-2" />
                                   <CardTitle>{rewardDetails.awards.cityChampion?.title ?? 'City Champion'}</CardTitle>
                                   <CardDescription>Top performer in their city</CardDescription>
                               </CardHeader>
                               <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center min-h-[150px]">
                                   {cityChampion ? (
                                       <>
                                           <Avatar className="h-16 w-16 mb-3 border-2 border-blue-400 shadow-md">
                                               <AvatarImage src={cityChampion.profilePic} alt={cityChampion.name} data-ai-hint="city champion award"/>
                                               <AvatarFallback>{cityChampion.name.substring(0, 1)}</AvatarFallback>
                                           </Avatar>
                                           <p className="font-semibold text-lg">{cityChampion.name}</p>
                                           <CityBadge city={cityChampion.city} className="mt-1" />
                                       </>
                                   ) : (
                                        <p className="text-muted-foreground">To be announced</p>
                                   )}
                               </CardContent>
                           </Card>
                       </motion.div>

                       {/* Innovation Award */}
                       <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                           <Card className="text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col">
                               <CardHeader className="items-center pb-2 bg-gradient-to-b from-purple-100 to-background dark:from-purple-900/30">
                                   <Star className="h-10 w-10 text-purple-500 mb-2" />
                                   <CardTitle>{rewardDetails.awards.innovationAward?.title ?? 'Innovation Award'}</CardTitle>
                                   <CardDescription>Recognizing creative solutions</CardDescription>
                               </CardHeader>
                               <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center min-h-[150px]">
                                   {innovationAwardee ? (
                                       <>
                                           <Avatar className="h-16 w-16 mb-3 border-2 border-purple-400 shadow-md">
                                               <AvatarImage src={innovationAwardee.profilePic} alt={innovationAwardee.name} data-ai-hint="innovation award person"/>
                                               <AvatarFallback>{innovationAwardee.name.substring(0, 1)}</AvatarFallback>
                                           </Avatar>
                                           <p className="font-semibold text-lg">{innovationAwardee.name}</p>
                                            <CityBadge city={innovationAwardee.city} className="mt-1" />
                                       </>
                                   ) : (
                                         <p className="text-muted-foreground">To be announced</p>
                                   )}
                               </CardContent>
                           </Card>
                       </motion.div>
                    </div>
                </section>
             ) : (
                  !isLoading && ( // Only show if loading finished and data is confirmed missing
                     <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                           <Star className="text-secondary h-6 w-6" /> Special Recognitions
                        </h2>
                        <Card><CardContent><p className="text-muted-foreground py-4 text-center">Reward details are currently unavailable.</p></CardContent></Card>
                    </section>
                  )
             )}


            {/* Incentive Structure */}
            {rewardDetails ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="text-secondary h-6 w-6" /> Incentive Structure
                    </h2>
                     <Card className="shadow-md border rounded-lg overflow-hidden">
                         <CardContent className="p-6">
                            <Accordion type="single" collapsible defaultValue="ops" className="w-full">
                              <AccordionItem value="ops">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" /> Incentive-Ops Metrics
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 text-muted-foreground space-y-1">
                                  {rewardDetails.incentives?.ops?.length > 0 ? rewardDetails.incentives.ops.map((metric, index) => (
                                     <p key={index}>- {metric}</p>
                                  )) : <p>No Ops incentive metrics defined.</p>}
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="vm">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" /> Incentive-VM Metrics
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 text-muted-foreground space-y-1">
                                   {rewardDetails.incentives?.vm?.length > 0 ? rewardDetails.incentives.vm.map((metric, index) => (
                                      <p key={index}>- {metric}</p>
                                   )) : <p>No VM incentive metrics defined.</p>}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </section>
             ) : (
                  !isLoading && (
                       <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <Target className="text-secondary h-6 w-6" /> Incentive Structure
                            </h2>
                           <Card><CardContent><p className="text-muted-foreground py-4 text-center">Incentive structure details unavailable.</p></CardContent></Card>
                       </section>
                  )
             )}

            {/* Recognition Programs */}
             {rewardDetails ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Megaphone className="text-secondary h-6 w-6" /> Recognition Programs
                    </h2>
                    <Card className="shadow-md border rounded-lg overflow-hidden">
                       <CardContent className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Quarterly Awards</h3>
                                <p className="text-muted-foreground">{rewardDetails.programs?.quarterlyAwards ?? 'Details unavailable.'}</p>
                            </div>
                            <div className="border-t pt-4">
                                 <h3 className="font-semibold text-lg mb-1">Annual Conference</h3>
                                 <p className="text-muted-foreground">{rewardDetails.programs?.annualConference ?? 'Details unavailable.'}</p>
                            </div>
                       </CardContent>
                     </Card>
                </section>
            ) : (
                 !isLoading && (
                      <section>
                           <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                               <Megaphone className="text-secondary h-6 w-6" /> Recognition Programs
                           </h2>
                          <Card><CardContent><p className="text-muted-foreground py-4 text-center">Recognition program details unavailable.</p></CardContent></Card>
                      </section>
                 )
            )}
        </motion.div>
    );
};

export default RewardsPage;
