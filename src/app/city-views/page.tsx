// src/app/city-views/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCityData } from '@/services/api';
import type { CityData, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RAGIndicator from '@/components/shared/RAGIndicator';
import TabSelector from '@/components/shared/TabSelector'; // Use animated tabs
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Building, BarChart3, Users, ListChecks, CalendarClock, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns'; // For formatting dates
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const cities = ['BLR_A', 'BLR_B', 'CHN', 'NCR', 'HYD'];

// Placeholder Loading Component for City Views Content Area
const CityContentSkeleton = () => (
    <div className="space-y-6 mt-6">
       {/* Chart Skeleton */}
       <Card>
         <CardHeader>
           <Skeleton className="h-6 w-40" />
           <Skeleton className="h-4 w-32" />
         </CardHeader>
         <CardContent className="h-72 flex items-center justify-center pr-4 -ml-4">
           <Skeleton className="h-full w-full" />
         </CardContent>
       </Card>

       {/* RAG Summary Skeleton */}
       <Card>
           <CardHeader>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-48" />
           </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-6" />
                       </div>
                       <Skeleton className="h-2 w-full rounded-full" />
                       <Skeleton className="h-3 w-12 ml-auto" /> {/* Percentage */}
                   </div>
                ))}
            </CardContent>
        </Card>

        {/* Project List Skeleton */}
       <Card>
           <CardHeader>
                <Skeleton className="h-6 w-32" />
           </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                           <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                           <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                           <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableHead>
                           <TableHead className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                               <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                               <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                               <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-1">
                                         <Skeleton className="h-3.5 w-3.5" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </TableCell>
                               <TableCell className="text-center">
                                   <div className="h-3 w-3 rounded-full bg-muted mx-auto"></div>
                               </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>

       {/* Team Members Skeleton */}
        <Card>
           <CardHeader>
                <Skeleton className="h-6 w-40" />
           </CardHeader>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                           <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                           <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                               <TableCell>
                                   <div className="flex items-center space-x-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                   </div>
                                </TableCell>
                               <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);


const CityViewPage: React.FC = () => {
  const [cityDataCache, setCityDataCache] = useState<Record<string, CityData | null | 'error'>>({});
  const [selectedCity, setSelectedCity] = useState<string>(cities[0]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  useEffect(() => {
    const fetchCityData = async (cityId: string) => {
      if (cityDataCache[cityId] !== undefined) { // Already fetched, loading, or errored
        return;
      }

      setIsLoadingCity(true);
      setCityDataCache(prev => ({ ...prev, [cityId]: null })); // Indicate loading

      try {
        const data = await getCityData(cityId);
        setCityDataCache(prev => ({ ...prev, [cityId]: data }));
      } catch (err) {
        console.error(`Failed to load data for city ${cityId}:`, err);
        setCityDataCache(prev => ({ ...prev, [cityId]: 'error' }));
      } finally {
          // Only stop loading if we are still viewing the city that just finished loading
          if(cityId === selectedCity) {
             setIsLoadingCity(false);
          }
      }
    };

    fetchCityData(selectedCity); // Fetch data for the initially selected city or when tab changes

  }, [selectedCity, cityDataCache]); // Re-run when selectedCity changes


  const handleTabChange = (city: string) => {
    setSelectedCity(city);
    // Reset loading state specifically for the new tab if its data isn't loaded yet
    if(cityDataCache[city] === undefined) {
        setIsLoadingCity(true);
    } else if (cityDataCache[city] === null) {
        setIsLoadingCity(true); // Still loading
    }
    else {
        setIsLoadingCity(false); // Already loaded or errored
    }
  };

  // --- Derived Data Calculation ---
  const currentCityLoadState = cityDataCache[selectedCity];
  const currentCityData = typeof currentCityLoadState === 'object' && currentCityLoadState !== null ? currentCityLoadState : null;

  const chartData = useMemo(() => {
    return currentCityData?.performanceHistory?.map(item => ({
      week: `W${item.week}`,
      runRate: item.runRate ?? 0, // Default to 0 if undefined
    })) ?? [];
  }, [currentCityData]);

  const ragSummary = currentCityData?.ragSummary;
  const totalProjects = ragSummary?.totalProjects ?? 0;
  const greenCount = ragSummary?.green ?? 0;
  const amberCount = ragSummary?.amber ?? 0;
  const redCount = ragSummary?.red ?? 0;
  const greenPercent = totalProjects > 0 ? (greenCount / totalProjects) * 100 : 0;
  const amberPercent = totalProjects > 0 ? (amberCount / totalProjects) * 100 : 0;
  const redPercent = totalProjects > 0 ? (redCount / totalProjects) * 100 : 0;


  // --- Render Logic ---

  const renderContent = () => {
    if (isLoadingCity) {
       return <CityContentSkeleton />;
    }

    if (currentCityLoadState === 'error') {
      return (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading City Data</AlertTitle>
            <AlertDescription>
              Could not load data for {selectedCity}. Please try selecting another city or refresh the page.
            </AlertDescription>
          </Alert>
       );
    }

     if (!currentCityData) {
          return <p className="text-center text-muted-foreground mt-6 py-8">No data available for {selectedCity}.</p>;
     }

     // Data is available, render the components
     return (
         <motion.div
           key={selectedCity} // Ensures animation runs on tab change
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.3 }}
           className="space-y-6 mt-6"
         >
           {/* Performance Chart */}
           {chartData.length > 0 ? (
              <Card className="shadow-md border rounded-lg overflow-hidden">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <BarChart3 className="text-secondary h-5 w-5"/> Weekly Run Rate - {selectedCity}
                   </CardTitle>
                    <CardDescription>Last {chartData.length} weeks performance trend</CardDescription>
                 </CardHeader>
                 <CardContent className="h-72 pr-4 -ml-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                       <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                       <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
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
                       <Line type="monotone" dataKey="runRate" name="Run Rate (%)" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3, fill: 'hsl(var(--primary))' }}/>
                     </LineChart>
                   </ResponsiveContainer>
                 </CardContent>
              </Card>
            ) : (
                <Card><CardContent><p className="text-muted-foreground py-4 text-center">No performance history data available.</p></CardContent></Card>
            )}


           {/* RAG Status Summary */}
           {ragSummary ? (
             <Card className="shadow-md border rounded-lg overflow-hidden">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-secondary h-5 w-5"/> RAG Status Summary
                  </CardTitle>
                  <CardDescription>
                      Total Projects: {totalProjects} | Active Projects: {ragSummary.activeProjects ?? 'N/A'}
                  </CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Green */}
                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                            <span className="font-medium text-green-600 dark:text-green-400">Green</span>
                            <span className="text-sm font-semibold">{greenCount}</span>
                       </div>
                       <Progress value={greenPercent} indicatorClassName="bg-green-500" className="h-2" />
                       <p className="text-xs text-muted-foreground text-right">{greenPercent.toFixed(1)}%</p>
                   </div>
                    {/* Amber */}
                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                            <span className="font-medium text-yellow-600 dark:text-yellow-400">Amber</span>
                            <span className="text-sm font-semibold">{amberCount}</span>
                       </div>
                       <Progress value={amberPercent} indicatorClassName="bg-yellow-500" className="h-2" />
                       <p className="text-xs text-muted-foreground text-right">{amberPercent.toFixed(1)}%</p>
                   </div>
                   {/* Red */}
                   <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-red-600 dark:text-red-400">Red</span>
                            <span className="text-sm font-semibold">{redCount}</span>
                       </div>
                       <Progress value={redPercent} indicatorClassName="bg-red-500" className="h-2" />
                       <p className="text-xs text-muted-foreground text-right">{redPercent.toFixed(1)}%</p>
                   </div>
               </CardContent>
             </Card>
            ) : (
               <Card><CardContent><p className="text-muted-foreground py-4 text-center">RAG summary data not available.</p></CardContent></Card>
            )}

           {/* Project List */}
           <Card className="shadow-md border rounded-lg overflow-hidden">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <ListChecks className="text-secondary h-5 w-5"/> Project Details
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-muted/50">
                   <TableRow>
                     <TableHead>Project Name</TableHead>
                     <TableHead className="text-right">Run Rate (%)</TableHead>
                     <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                     <TableHead className="text-center">RAG</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {currentCityData.projects.length > 0 ? currentCityData.projects.map((project: Project) => (
                     <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                       <TableCell className="font-medium">{project.name}</TableCell>
                       <TableCell className="text-right font-semibold">{project.runRate}%</TableCell>
                       <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                         <div className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5"/>
                            {project.lastUpdated ? format(new Date(project.lastUpdated), 'MMM d, yyyy') : 'N/A'}
                         </div>
                       </TableCell>
                       <TableCell className="text-center">
                          <RAGIndicator status={project.ragStatus} count={1} size="sm" hideCount={true}/>
                       </TableCell>
                     </TableRow>
                   )) : (
                      <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No project data available for {selectedCity}.
                          </TableCell>
                      </TableRow>
                   )}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>

            {/* Team Members */}
           <Card className="shadow-md border rounded-lg overflow-hidden">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Users className="text-secondary h-5 w-5"/> Team Members ({selectedCity})
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-muted/50">
                   <TableRow>
                     <TableHead>Member Name</TableHead>
                     <TableHead>Role</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {currentCityData.teamMembers.length > 0 ? currentCityData.teamMembers.map((member) => (
                     <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                       <TableCell>
                         <div className="flex items-center space-x-3">
                           <Avatar className="h-8 w-8">
                             <AvatarImage src={member.profilePic} alt={member.name} data-ai-hint="person avatar team" />
                             <AvatarFallback>{member.name ? member.name.substring(0, 1) : '?'}</AvatarFallback>
                           </Avatar>
                           <span className="font-medium">{member.name ?? 'N/A'}</span>
                         </div>
                       </TableCell>
                       <TableCell className="text-muted-foreground">{member.role ?? 'N/A'}</TableCell>
                     </TableRow>
                   )) : (
                      <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              No team member data available for {selectedCity}.
                          </TableCell>
                      </TableRow>
                   )}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>

         </motion.div>
     );
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Building className="text-primary h-7 w-7" /> City Performance Views
      </h1>

      {/* Animated Tab Selector */}
      <TabSelector
        tabs={cities.map(city => ({ id: city, label: city }))}
        selectedTab={selectedCity}
        onSelectTab={handleTabChange}
      />

      {/* Render Content based on loading/error/data state */}
      {renderContent()}

    </motion.div>
  );
};

export default CityViewPage;
