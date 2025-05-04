'use client';
import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CityStatsCard from './CityStatsCard';

interface CityPerformanceProps {
  data: (ProjectData & { rank: number })[]; // Expect data with rank
}

const CityPerformance: React.FC<CityPerformanceProps> = ({ data }) => {
  // Sort cities alphabetically for consistent tab order
  const cities = Array.from(new Set(data.map(item => item.city))).sort();

  if (!cities.length) {
      return <p className="text-muted-foreground">No city data available.</p>;
  }

  // Find the city with the highest rank (lowest rank number) to be the default tab
  const defaultCity = data.reduce((prev, curr) => (curr.rank < prev.rank ? curr : prev), data[0]).city;

  return (
    <Tabs defaultValue={defaultCity || cities[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {cities.map(city => (
          <TabsTrigger
             key={city}
             value={city}
             className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            {city}
          </TabsTrigger>
        ))}
      </TabsList>
      {cities.map(city => {
        // Find the specific data entry for this city. Assumes one entry per city.
        const cityData = data.find(item => item.city === city);
        return (
          <TabsContent key={city} value={city} className="mt-0">
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
