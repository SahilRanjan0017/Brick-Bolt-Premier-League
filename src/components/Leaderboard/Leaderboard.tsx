import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import PodiumScene from './PodiumScene';
import TopPerformersList from './TopPerformersList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

interface LeaderboardProps {
  // Expect data arrays to include the rank property
  podiumData: (ProjectData & { rank: number })[];
  topData: (ProjectData & { rank: number })[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ podiumData, topData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Podium Visualization */}
      <div className="lg:col-span-2">
         <Card className="h-full flex flex-col shadow-lg border border-border rounded-lg overflow-hidden bg-card">
           <CardHeader>
              <CardTitle className="text-xl font-semibold text-center text-card-foreground">Podium Finishers</CardTitle>
           </CardHeader>
           <CardContent className="flex-grow flex items-center justify-center p-0 bg-gradient-to-br from-secondary/10 via-background to-background">
             {/* Ensure PodiumScene takes available space */}
             <div className="w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[400px]">
               <PodiumScene performers={podiumData} />
             </div>
           </CardContent>
         </Card>
      </div>
       {/* Top 5 List */}
      <div className="lg:col-span-1">
         <Card className="h-full shadow-lg border border-border rounded-lg bg-card">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
               <CardTitle className="text-xl font-semibold text-card-foreground">Top 5 Performers</CardTitle>
               <ListChecks className="h-5 w-5 text-muted-foreground" />
             </CardHeader>
             <CardContent className="pt-4">
               <TopPerformersList performers={topData} />
             </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
