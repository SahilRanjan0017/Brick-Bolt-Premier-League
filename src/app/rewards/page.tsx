// src/app/rewards/page.tsx
'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
// Use consolidated API call or specific ones if needed
import { getFullLeaderboard, getRewardDetails } from '@/services/api';
import type { LeaderboardEntry, RewardDetails, Role } from '@/types'; // Import Role type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CityBadge from '@/components/shared/CityBadge';
// PodiumScene might not be needed here anymore if Leaderboard page handles top performers
// import PodiumScene from '@/components/Leaderboard/PodiumScene';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Star, Gift, Megaphone, Target, Medal, Users, UserCog, UserCheck, AlertCircle } from 'lucide-react'; // Added role icons
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamic import (if PodiumScene is kept)
// const PodiumScene = dynamic(() => import('@/components/Leaderboard/PodiumScene'), {
//   loading: () => <Skeleton className="h-[400px] lg:h-[450px] w-full" />,
//   ssr: false
// });


// Loading Skeleton for Rewards Page
const LoadingSkeleton = () => (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
           <Skeleton className="h-7 w-7" /> <Skeleton className="h-7 w-48" />
        </h1>

        {/* Podium Skeleton (Optional: Can be removed if Podium is only on Leaderboard) */}
        {/* <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
           <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-52" />
        </h2>
        <Card className="h-[400px] lg:h-[450px] flex items-center justify-center shadow-lg border rounded-lg bg-gradient-to-br from-secondary/10 via-background to-background">
           <Skeleton className="h-3/4 w-3/4" />
        </Card> */}

        {/* Recognition Cards Skeleton */}
         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Skeleton className="h-6 w-6" /> <Skeleton className="h-6 w-48" />
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
               <Card key={i} className="text-center border rounded-lg overflow-hidden h-full flex flex-col min-h-[300px]">
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

// --- Award Card Component ---
interface AwardCardProps {
    award: { title: string; awardeeId: string | null };
    awardee: LeaderboardEntry | undefined | null; // Allow null if loading/not found
    icon: React.ElementType;
    iconColorClass: string;
    gradientClass: string;
    borderColorClass: string;
    description: string;
    aiHint: string;
}

const AwardCard: React.FC<AwardCardProps> = ({ award, awardee, icon: Icon, iconColorClass, gradientClass, borderColorClass, description, aiHint }) => (
     <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className={`text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col min-h-[300px]`}>
            <CardHeader className={`items-center pb-2 ${gradientClass}`}>
                <Icon className={`h-10 w-10 ${iconColorClass} mb-2`} />
                <CardTitle>{award.title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center">
                {awardee === null ? ( // Check for explicitly null (loading/not found)
                    <p className="text-muted-foreground">Details loading...</p>
                ) : awardee ? ( // Check if awardee data exists
                    <>
                        <Avatar className={`h-16 w-16 mb-3 border-2 ${borderColorClass} shadow-md`}>
                            <AvatarImage src={awardee.profilePic} alt={awardee.name} data-ai-hint={aiHint}/>
                            <AvatarFallback>{awardee.name.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-lg">{awardee.name}</p>
                        <p className="text-sm text-muted-foreground">{awardee.role}</p> {/* Show role */}
                        <CityBadge city={awardee.city} className="mt-1" />
                    </>
                ) : ( // Awardee ID was null or not found in leaderboard
                    <p className="text-muted-foreground">To be announced</p>
                )}
            </CardContent>
        </Card>
     </motion.div>
);


// --- Rewards Page Component ---
const RewardsPage: React.FC = () => {
    const [rewardDetails, setRewardDetails] = useState<RewardDetails | null>(null);
    const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setRewardDetails(null);
            setFullLeaderboard(null);

            try {
                // Fetch concurrently
                 const [leaderboardResult, rewardsResult] = await Promise.allSettled([
                    getFullLeaderboard(),
                    getRewardDetails()
                ]);

                if (leaderboardResult.status === 'fulfilled') {
                    setFullLeaderboard(leaderboardResult.value);
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


    // Helper to find awardee data from the full leaderboard
    const findAwardee = (awardeeId: string | null): LeaderboardEntry | undefined | null=> {
         if (isLoading) return null; // Indicate loading if leaderboard isn't ready
        if (!awardeeId || !fullLeaderboard) return undefined; // Not found or leaderboard unavailable
        return fullLeaderboard.find(p => p.id === awardeeId);
    }

    // Memoize finding awardees to prevent re-renders
    const employeeOfTheMonth = useMemo(() => findAwardee(rewardDetails?.awards?.employeeOfMonth?.awardeeId ?? null), [rewardDetails, fullLeaderboard, isLoading]);
    const cityChampion = useMemo(() => findAwardee(rewardDetails?.awards?.cityChampion?.awardeeId ?? null), [rewardDetails, fullLeaderboard, isLoading]);
    const innovationAwardee = useMemo(() => findAwardee(rewardDetails?.awards?.innovationAward?.awardeeId ?? null), [rewardDetails, fullLeaderboard, isLoading]);


    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Handle total failure
    if (error && !fullLeaderboard && !rewardDetails) {
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
     const partialError = error && (fullLeaderboard || rewardDetails);

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

             {/* Optional: Podium Visualization (Remove if only on Leaderboard) */}
            {/* {podiumPerformers.length > 0 && ( ... )} */}


            {/* Recognition Cards - Only render if rewardDetails is available */}
            {rewardDetails ? (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Star className="text-secondary h-6 w-6" /> Special Recognitions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Manager of the Month (OM) */}
                       {rewardDetails.awards.employeeOfMonth && (
                           <AwardCard
                                award={rewardDetails.awards.employeeOfMonth}
                                awardee={employeeOfTheMonth}
                                icon={Medal}
                                iconColorClass="text-amber-500"
                                gradientClass="bg-gradient-to-b from-amber-100 to-background dark:from-amber-900/30"
                                borderColorClass="border-amber-400"
                                description="Awarded for exceptional leadership (OM)"
                                aiHint="manager award portrait"
                           />
                        )}

                        {/* Lead Champion (TL) */}
                        {rewardDetails.awards.cityChampion && (
                            <AwardCard
                                award={rewardDetails.awards.cityChampion}
                                awardee={cityChampion}
                                icon={Award}
                                iconColorClass="text-blue-500"
                                gradientClass="bg-gradient-to-b from-blue-100 to-background dark:from-blue-900/30"
                                borderColorClass="border-blue-400"
                                description="Top performing Team Lead (TL)"
                                aiHint="team lead award"
                            />
                        )}

                       {/* Execution Excellence (SPM) */}
                       {rewardDetails.awards.innovationAward && (
                            <AwardCard
                                award={rewardDetails.awards.innovationAward}
                                awardee={innovationAwardee}
                                icon={UserCheck} // Changed icon
                                iconColorClass="text-purple-500"
                                gradientClass="bg-gradient-to-b from-purple-100 to-background dark:from-purple-900/30"
                                borderColorClass="border-purple-400"
                                description="Recognizing execution excellence (SPM)"
                                aiHint="project manager award person"
                            />
                       )}
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
                            {/* Consider splitting Ops into OM/TL/SPM if data allows */}
                            <Accordion type="single" collapsible defaultValue="ops" className="w-full">
                              <AccordionItem value="ops">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        {/* Use a generic icon or specific ones if split */}
                                        <Users className="h-5 w-5 text-primary" /> Operations Team Metrics (OM/TL/SPM)
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 text-muted-foreground space-y-1">
                                  {rewardDetails.incentives?.ops?.length > 0 ? rewardDetails.incentives.ops.map((metric, index) => (
                                     <p key={index}>- {metric}</p>
                                  )) : <p>No Ops incentive metrics defined.</p>}
                                </AccordionContent>
                              </AccordionItem>
                              {/* Keep VM separate as requested */}
                              <AccordionItem value="vm">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" /> Vendor Management Metrics
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