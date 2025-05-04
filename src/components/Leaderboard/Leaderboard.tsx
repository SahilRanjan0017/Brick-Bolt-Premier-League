import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import PodiumScene from './PodiumScene';
import TopPerformersList from './TopPerformersList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

interface LeaderboardProps {
  podiumData: ProjectData[];
  topData: ProjectData[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ podiumData, topData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
         <Card className="h-full flex flex-col shadow-lg border border-border rounded-lg overflow-hidden">
           <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">Podium Finishers</CardTitle>
           </CardHeader>
           <CardContent className="flex-grow flex items-center justify-center p-0 bg-gradient-to-br from-secondary/30 to-background">
             {/* Ensure PodiumScene takes available space */}
             <div className="w-full h-[300px] md:h-[400px]">
               <PodiumScene performers={podiumData} />
             </div>
           </CardContent>
         </Card>
      </div>
      <div className="md:col-span-1">
         <Card className="h-full shadow-lg border border-border rounded-lg">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-xl font-semibold">Top 5 Performers</CardTitle>
               <ListChecks className="h-5 w-5 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <TopPerformersList performers={topData} />
             </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
