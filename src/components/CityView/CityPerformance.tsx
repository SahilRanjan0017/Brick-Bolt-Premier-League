'use client';
import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CityStatsCard from './CityStatsCard';

interface CityPerformanceProps {
  data: ProjectData[];
}

const CityPerformance: React.FC<CityPerformanceProps> = ({ data }) => {
  const cities = Array.from(new Set(data.map(item => item.city))).sort();

  if (!cities.length) {
      return <p className="text-muted-foreground">No city data available.</p>;
  }

  return (
    <Tabs defaultValue={cities[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {cities.map(city => (
          <TabsTrigger key={city} value={city} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {city}
          </TabsTrigger>
        ))}
      </TabsList>
      {cities.map(city => {
        const cityData = data.find(item => item.city === city); // Assuming one entry per city for simplicity now
        return (
          <TabsContent key={city} value={city} className="mt-4">
            {cityData ? (
              <CityStatsCard data={cityData} />
            ) : (
              <p className="text-muted-foreground p-4 text-center">No data available for {city}.</p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default CityPerformance;
