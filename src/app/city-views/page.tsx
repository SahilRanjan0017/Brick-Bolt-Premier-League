// src/app/city-views/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCityData } from '@/services/api';
import type { CityData, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RAGIndicator from '@/components/shared/RAGIndicator';
import CityBadge from '@/components/shared/CityBadge';
import TabSelector from '@/components/shared/TabSelector'; // Use animated tabs
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Building, BarChart3, Users, ListChecks, CalendarClock, TrendingUp, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns'; // For formatting dates

const cities = ['BLR_A', 'BLR_B', 'CHN', 'NCR', 'HYD'];

// Placeholder Loading Component for City Views
const LoadingSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-8 w-48 mb-6" /> {/* Title Skeleton */}

    {/* Tabs Skeleton */}
    <div className="flex space-x-2 mb-4">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-20 rounded-md" />)}
    </div>

    {/* Content Skeleton */}
    <div className="space-y-6">
       {/* Chart Skeleton */}
       <Card>
         <CardHeader>
           <Skeleton className="h-6 w-40" />
           <Skeleton className="h-4 w-32" />
         </CardHeader>
         <CardContent className="h-72 flex items-center justify-center">
           <Skeleton className="h-full w-full" />
         </CardContent>
       </Card>

       {/* RAG Summary Skeleton */}
       <Card>
           <CardHeader>
                <Skeleton className="h-6 w-36" />
           </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-2">
                       <Skeleton className="h-5 w-16" />
                       <Skeleton className="h-4 w-full rounded-full" />
                       <Skeleton className="h-4 w-12" />
                   </div>
                ))}
            </CardContent>
        </Card>

        {/* Project List Skeleton */}
       <Card>
           <CardHeader>
                <Skeleton className="h-6 w-32" />
           </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                           <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                           <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                           <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                           <TableHead><Skeleton className="h-5 w-10" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                               <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-8" /></TableCell>
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
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                           <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                           <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                               <TableCell>
                                   <div className="flex items-center gap-2">
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
  </div>
);

const CityViewPage: React.FC = () => {
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [selectedCity, setSelectedCity] = useState<string>(cities[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCityData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dataPromises = cities.map(city => getCityData(city));
        const results = await Promise.all(dataPromises);
        const dataMap: Record<string, CityData> = {};
        cities.forEach((city, index) => {
          dataMap[city] = results[index];
        });
        setCityData(dataMap);
      } catch (err) {
        console.error("Failed to load city data:", err);
        setError("Could not load city data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCityData();
  }, []);

  const currentCityData = useMemo(() => cityData[selectedCity], [cityData, selectedCity]);

  const handleTabChange = (city: string) => {
    setSelectedCity(city);
  };

  // Format data for the chart
   const chartData = useMemo(() => {
     return currentCityData?.performanceHistory?.map(item => ({
       week: `W${item.week}`,
       runRate: item.runRate,
     })) ?? [];
   }, [currentCityData]);

   // Calculate RAG summary percentages
    const totalProjects = currentCityData?.ragSummary.totalProjects ?? 0;
    const greenPercent = totalProjects > 0 ? (currentCityData?.ragSummary.green ?? 0) / totalProjects * 100 : 0;
    const amberPercent = totalProjects > 0 ? (currentCityData?.ragSummary.amber ?? 0) / totalProjects * 100 : 0;
    const redPercent = totalProjects > 0 ? (currentCityData?.ragSummary.red ?? 0) / totalProjects * 100 : 0;


  if (isLoading && Object.keys(cityData).length === 0) { // Show initial loading skeleton only
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
        <Building className="text-primary h-7 w-7" /> City Performance Views
      </h1>

      {/* Animated Tab Selector */}
      <TabSelector
        tabs={cities.map(city => ({ id: city, label: city }))}
        selectedTab={selectedCity}
        onSelectTab={handleTabChange}
      />

      {isLoading && !currentCityData && ( // Show loading indicator when switching tabs before data loads
         <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading {selectedCity} data...</span>
         </div>
      )}

      {currentCityData ? (
        <motion.div
          key={selectedCity} // Ensures animation runs on tab change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 mt-6" // Add margin top after tabs
        >
          {/* Performance Chart */}
          <Card className="shadow-md border rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-secondary h-5 w-5"/> Weekly Run Rate - {selectedCity}
              </CardTitle>
               <CardDescription>Last {chartData.length} weeks performance trend</CardDescription>
            </CardHeader>
            <CardContent className="h-72 pr-4 -ml-4"> {/* Adjust padding for axes */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}> {/* Adjust margins */}
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

          {/* RAG Status Summary */}
          <Card className="shadow-md border rounded-lg overflow-hidden">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <TrendingUp className="text-secondary h-5 w-5"/> RAG Status Summary
               </CardTitle>
               <CardDescription>
                   Total Projects: {totalProjects} | Active Projects: {currentCityData.ragSummary.activeProjects}
               </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Green */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                         <span className="font-medium text-green-600 dark:text-green-400">Green</span>
                         <span className="text-sm font-semibold">{currentCityData.ragSummary.green}</span>
                    </div>
                    <Progress value={greenPercent} indicatorClassName="bg-green-500" className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{greenPercent.toFixed(1)}%</p>
                </div>
                 {/* Amber */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                         <span className="font-medium text-yellow-600 dark:text-yellow-400">Amber</span>
                         <span className="text-sm font-semibold">{currentCityData.ragSummary.amber}</span>
                    </div>
                    <Progress value={amberPercent} indicatorClassName="bg-yellow-500" className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{amberPercent.toFixed(1)}%</p>
                </div>
                {/* Red */}
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                         <span className="font-medium text-red-600 dark:text-red-400">Red</span>
                         <span className="text-sm font-semibold">{currentCityData.ragSummary.red}</span>
                    </div>
                    <Progress value={redPercent} indicatorClassName="bg-red-500" className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{redPercent.toFixed(1)}%</p>
                </div>
            </CardContent>
          </Card>

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
                           {format(new Date(project.lastUpdated), 'MMM d, yyyy')}
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
                    {/* Add more relevant columns if needed */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCityData.teamMembers.length > 0 ? currentCityData.teamMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profilePic} alt={member.name} data-ai-hint="person avatar team" />
                            <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.role}</TableCell>
                       {/* Add more cells here */}
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
      ) : (
         !isLoading && <p className="text-center text-muted-foreground mt-6">No data available for {selectedCity}.</p> // Message if data is loaded but empty for the city
      )}
    </motion.div>
  );
};

export default CityViewPage;
