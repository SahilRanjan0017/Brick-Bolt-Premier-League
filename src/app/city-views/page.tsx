// src/app/city-views/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCityViewsPageData } from '@/services/api'; // Updated API call
import type { CityData, CityViewsPageData, RAGCounts } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import TabSelector from '@/components/shared/TabSelector';
import { Building, Users, UserCheck, ClipboardList, PieChart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const cities = ['BLR_A', 'BLR_B', 'CHN', 'NCR', 'HYD'];

// --- Chart Color Logic ---
const getRagColor = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
        case 'green': return 'hsl(var(--chart-2))'; // Use theme colors (adjust as needed)
        case 'amber': return 'hsl(var(--chart-4))';
        case 'red': return 'hsl(var(--destructive))';
        default: return 'hsl(var(--muted-foreground))';
    }
}

// --- Components ---

// City RAG Breakdown Chart
interface RagBreakdownChartProps {
    data: {
        name: string; // Role (TL/SPM)
        green: number;
        amber: number;
        red: number;
    }[];
}

const RagBreakdownChart: React.FC<RagBreakdownChartProps> = ({ data }) => (
     <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart className="text-secondary h-5 w-5"/> RAG Score Breakdown by Role
            </CardTitle>
            <CardDescription>Count of Red, Amber, Green statuses for TLs and SPMs</CardDescription>
        </CardHeader>
        <CardContent className="h-72 pr-4 -ml-4">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                        <XAxis
                            dataKey="name"
                            type="category"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis type="number" allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
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
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="red" name="Red" stackId="a" fill={getRagColor('red')} barSize={30}/>
                        <Bar dataKey="amber" name="Amber" stackId="a" fill={getRagColor('amber')} barSize={30}/>
                        <Bar dataKey="green" name="Green" stackId="a" fill={getRagColor('green')} barSize={30} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                     No RAG breakdown data available
                 </div>
             )}
        </CardContent>
     </Card>
);

// Project Count Card
interface ProjectCountCardProps {
    data: CityData['projectCounts'];
}

const ProjectCountCard: React.FC<ProjectCountCardProps> = ({ data }) => (
     <Card className="shadow-md border rounded-lg overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardList className="text-secondary h-5 w-5"/> Total Project Count
            </CardTitle>
            <CardDescription>Breakdown by managing role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
             <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-medium flex items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground"/> Team Leads (TL)</span>
                 <span className="text-lg font-semibold text-primary">{data?.tl ?? 0}</span>
             </div>
             <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-medium flex items-center gap-1.5"><UserCheck className="h-4 w-4 text-muted-foreground"/> Sr. Project Managers (SPM)</span>
                 <span className="text-lg font-semibold text-primary">{data?.spm ?? 0}</span>
             </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="font-bold">Total Projects</span>
                 <span className="text-xl font-bold text-primary">{data?.total ?? 0}</span>
             </div>
        </CardContent>
     </Card>
);


// --- Loading Skeleton ---
const CityContentSkeleton = () => (
    <div className="space-y-6 mt-6">
       {/* RAG Breakdown Chart Skeleton */}
       <Card>
         <CardHeader>
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-56 mt-1" />
         </CardHeader>
         <CardContent className="h-72 flex items-center justify-center pr-4 -ml-4">
           <Skeleton className="h-full w-full" />
         </CardContent>
       </Card>

       {/* Project Count Card Skeleton */}
       <Card>
           <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32 mt-1" />
           </CardHeader>
            <CardContent className="space-y-3 pt-4">
               <div className="flex justify-between items-center border-b pb-2">
                   <Skeleton className="h-5 w-24" />
                   <Skeleton className="h-6 w-10" />
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                   <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-6 w-10" />
               </div>
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-28 font-bold" />
                    <Skeleton className="h-7 w-12 font-bold" />
                </div>
            </CardContent>
        </Card>

       {/* Optional: Personnel List Skeleton (if needed) */}
        {/* <Card> ... </Card> */}
    </div>
);

// --- City Views Page Component ---
const CityViewPage: React.FC = () => {
  const [cityViewsData, setCityViewsData] = useState<CityViewsPageData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(cities[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCityViewsPageData();
        setCityViewsData(data);
      } catch (err) {
        console.error("Failed to load city views data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleTabChange = (city: string) => {
    setSelectedCity(city);
  };

  // --- Derived Data Calculation ---
  const currentCityData = cityViewsData ? cityViewsData[selectedCity] : null;

  const ragChartData = useMemo(() => {
    if (!currentCityData?.ragBreakdown) return [];
    return [
        { name: 'TL', ...currentCityData.ragBreakdown.tl },
        { name: 'SPM', ...currentCityData.ragBreakdown.spm },
    ];
  }, [currentCityData]);

  const projectCounts = useMemo(() => {
     return currentCityData?.projectCounts;
  }, [currentCityData]);


  // --- Render Logic ---

  const renderContent = () => {
    if (isLoading) { // Use overall loading state now
       return <CityContentSkeleton />;
    }

     if (!currentCityData) { // Handle case where data for the selected city doesn't exist even after loading
         return (
             <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Data Not Found</AlertTitle>
                <AlertDescription>
                  Could not find data for {selectedCity}. Please select another city.
                </AlertDescription>
             </Alert>
         );
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
           {/* RAG Breakdown Chart */}
           <RagBreakdownChart data={ragChartData}/>

            {/* Project Count Card */}
            {projectCounts ? (
                <ProjectCountCard data={projectCounts} />
            ) : (
                 <Card><CardContent><p className="text-muted-foreground py-4 text-center">Project count data not available.</p></CardContent></Card>
            )}

           {/* Optional: Display Personnel List */}
            {/* <Card>
                <CardHeader><CardTitle>Personnel in {selectedCity}</CardTitle></CardHeader>
                <CardContent> ... Table/List of currentCityData.personnel ... </CardContent>
            </Card> */}

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
       {!isLoading && !error && cityViewsData && ( // Only show tabs if data loaded successfully
            <TabSelector
                tabs={cities.map(city => ({ id: city, label: city }))}
                selectedTab={selectedCity}
                onSelectTab={handleTabChange}
            />
        )}
        {isLoading && <Skeleton className="h-10 w-full md:w-[400px] rounded-lg" />} {/* Tab Skeleton */}


      {/* Render Content based on loading/error/data state */}
       {error && !isLoading && ( // Show error prominently if loading failed
           <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Loading City Data</AlertTitle>
                  <AlertDescription>
                      {error}. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
           </div>
       )}
      {!error && renderContent()} {/* Render content if no error */}

    </motion.div>
  );
};

export default CityViewPage;