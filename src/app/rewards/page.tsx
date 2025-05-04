// src/app/rewards/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboardData, getRewardDetails } from '@/services/api';
import type { LeaderboardEntry, RewardDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RAGIndicator from '@/components/shared/RAGIndicator';
import CityBadge from '@/components/shared/CityBadge';
import PodiumScene from '@/components/Leaderboard/PodiumScene'; // Reuse podium
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Trophy, Star, Gift, Megaphone, Target, Medal } from 'lucide-react';

// Loading Skeleton for Rewards Page
const LoadingSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-8 w-48 mb-6" /> {/* Title */}

        {/* Podium Skeleton */}
        <Card className="h-[400px] flex items-center justify-center">
           <Skeleton className="h-3/4 w-3/4" />
        </Card>

        {/* Recognition Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
               <Card key={i}>
                   <CardHeader className="items-center">
                      <Skeleton className="h-10 w-10 mb-2" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                   </CardHeader>
                   <CardContent className="text-center">
                       <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
                       <Skeleton className="h-5 w-28 mx-auto" />
                       <Skeleton className="h-4 w-20 mx-auto mt-1" />
                   </CardContent>
               </Card>
           ))}
        </div>

        {/* Incentive Structure Skeleton */}
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ops">
                        <AccordionTrigger><Skeleton className="h-5 w-32" /></AccordionTrigger>
                        <AccordionContent><Skeleton className="h-4 w-full" /></AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="vm">
                        <AccordionTrigger><Skeleton className="h-5 w-32" /></AccordionTrigger>
                        <AccordionContent><Skeleton className="h-4 w-full" /></AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>

         {/* Recognition Programs Skeleton */}
        <Card>
             <CardHeader>
                <Skeleton className="h-6 w-52" />
            </CardHeader>
             <CardContent className="space-y-4">
                <div>
                     <Skeleton className="h-5 w-36 mb-1" />
                     <Skeleton className="h-4 w-full" />
                </div>
                 <div>
                     <Skeleton className="h-5 w-40 mb-1" />
                     <Skeleton className="h-4 w-full" />
                 </div>
             </CardContent>
         </Card>
    </div>
);

const RewardsPage: React.FC = () => {
    const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[]>([]);
    const [rewardDetails, setRewardDetails] = useState<RewardDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [leaderboard, rewards] = await Promise.all([
                    getLeaderboardData(3), // Fetch only top 3 for podium
                    getRewardDetails()
                ]);
                setTopPerformers(leaderboard);
                setRewardDetails(rewards);
            } catch (err) {
                console.error("Failed to load rewards data:", err);
                setError("Could not load rewards information. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const podiumPerformers = topPerformers.map(p => ({ // Adapt data for PodiumScene
        project_id: p.id,
        city: p.city,
        rag_status: p.ragStatus.status, // Assuming RAGIndicator returns 'Green', 'Amber', 'Red'
        run_rate: p.score, // Use score for podium height
        last_updated: new Date().toISOString(), // Mock last updated
        rank: p.rank,
    }));

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    if (!rewardDetails) {
         return <div className="text-center text-muted-foreground">Reward details are currently unavailable.</div>;
    }

    // Helper to find awardee data
    const findAwardee = (awardeeId: string | null): LeaderboardEntry | undefined => {
        if (!awardeeId) return undefined;
        // In a real app, you might need a separate fetch or a broader leaderboard fetch initially
        return topPerformers.find(p => p.id === awardeeId) // Simple check against top 3 for demo
            || { // Fallback mock data if not in top 3 (replace with proper lookup)
                id: awardeeId, name: 'Jane Doe', rank: 5, city: 'HYD', profilePic: 'https://picsum.photos/100/100?random=4', score: 85, projectCount: 18,
                ragStatus: { green: 15, amber: 2, red: 1, status: 'Green' }
            };
    }

    const employeeOfTheMonth = findAwardee(rewardDetails.awards.employeeOfMonth.awardeeId);
    const cityChampion = findAwardee(rewardDetails.awards.cityChampion.awardeeId);
    const innovationAwardee = findAwardee(rewardDetails.awards.innovationAward.awardeeId);


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

            {/* Podium Visualization */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="text-secondary h-6 w-6" /> Current Top Performers
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

            {/* Recognition Cards */}
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
                               <CardTitle>{rewardDetails.awards.employeeOfMonth.title}</CardTitle>
                               <CardDescription>Awarded for exceptional performance</CardDescription>
                           </CardHeader>
                           <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center">
                               {employeeOfTheMonth ? (
                                   <>
                                       <Avatar className="h-16 w-16 mb-3 border-2 border-amber-400 shadow-md">
                                           <AvatarImage src={employeeOfTheMonth.profilePic} alt={employeeOfTheMonth.name} data-ai-hint="employee award portrait"/>
                                           <AvatarFallback>{employeeOfTheMonth.name.substring(0, 1)}</AvatarFallback>
                                       </Avatar>
                                       <p className="font-semibold text-lg">{employeeOfTheMonth.name}</p>
                                       <CityBadge city={employeeOfTheMonth.city} className="mt-1" />
                                   </>
                               ) : <p className="text-muted-foreground">To be announced</p>}
                           </CardContent>
                       </Card>
                   </motion.div>

                    {/* City Champion */}
                   <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                       <Card className="text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col">
                           <CardHeader className="items-center pb-2 bg-gradient-to-b from-blue-100 to-background dark:from-blue-900/30">
                               <Award className="h-10 w-10 text-blue-500 mb-2" />
                               <CardTitle>{rewardDetails.awards.cityChampion.title}</CardTitle>
                               <CardDescription>Top performer in their city</CardDescription>
                           </CardHeader>
                           <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center">
                               {cityChampion ? (
                                   <>
                                       <Avatar className="h-16 w-16 mb-3 border-2 border-blue-400 shadow-md">
                                           <AvatarImage src={cityChampion.profilePic} alt={cityChampion.name} data-ai-hint="city champion award"/>
                                           <AvatarFallback>{cityChampion.name.substring(0, 1)}</AvatarFallback>
                                       </Avatar>
                                       <p className="font-semibold text-lg">{cityChampion.name}</p>
                                       <CityBadge city={cityChampion.city} className="mt-1" />
                                   </>
                               ) : <p className="text-muted-foreground">To be announced</p>}
                           </CardContent>
                       </Card>
                   </motion.div>

                   {/* Innovation Award */}
                   <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                       <Card className="text-center hover:shadow-xl transition-shadow duration-300 border rounded-lg overflow-hidden h-full flex flex-col">
                           <CardHeader className="items-center pb-2 bg-gradient-to-b from-purple-100 to-background dark:from-purple-900/30">
                               <Star className="h-10 w-10 text-purple-500 mb-2" />
                               <CardTitle>{rewardDetails.awards.innovationAward.title}</CardTitle>
                               <CardDescription>Recognizing creative solutions</CardDescription>
                           </CardHeader>
                           <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center">
                               {innovationAwardee ? (
                                   <>
                                       <Avatar className="h-16 w-16 mb-3 border-2 border-purple-400 shadow-md">
                                           <AvatarImage src={innovationAwardee.profilePic} alt={innovationAwardee.name} data-ai-hint="innovation award person"/>
                                           <AvatarFallback>{innovationAwardee.name.substring(0, 1)}</AvatarFallback>
                                       </Avatar>
                                       <p className="font-semibold text-lg">{innovationAwardee.name}</p>
                                        <CityBadge city={innovationAwardee.city} className="mt-1" />
                                   </>
                               ) : <p className="text-muted-foreground">To be announced</p>}
                           </CardContent>
                       </Card>
                   </motion.div>
                </div>
            </section>

            {/* Incentive Structure */}
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
                              {rewardDetails.incentives.ops.map((metric, index) => (
                                 <p key={index}>- {metric}</p>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="vm">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary" /> Incentive-VM Metrics
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 text-muted-foreground space-y-1">
                              {rewardDetails.incentives.vm.map((metric, index) => (
                                 <p key={index}>- {metric}</p>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </section>

            {/* Recognition Programs */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Megaphone className="text-secondary h-6 w-6" /> Recognition Programs
                </h2>
                <Card className="shadow-md border rounded-lg overflow-hidden">
                   <CardContent className="p-6 space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Quarterly Awards</h3>
                            <p className="text-muted-foreground">{rewardDetails.programs.quarterlyAwards}</p>
                        </div>
                        <div className="border-t pt-4">
                             <h3 className="font-semibold text-lg mb-1">Annual Conference</h3>
                             <p className="text-muted-foreground">{rewardDetails.programs.annualConference}</p>
                        </div>
                   </CardContent>
                 </Card>
            </section>
        </motion.div>
    );
};

export default RewardsPage;
