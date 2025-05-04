import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TopPerformersListProps {
  performers: (ProjectData & { rank: number })[]; // Expect data with rank property
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-500'; // Gold
  if (rank === 2) return 'text-gray-400'; // Silver
  if (rank === 3) return 'text-orange-700'; // Bronze
  return 'text-muted-foreground';
};

const getRagIndicator = (ragStatus: string): React.ReactNode => {
    switch (ragStatus.toLowerCase()) {
        case 'green':
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        case 'amber':
            return <Minus className="h-4 w-4 text-yellow-500" />;
        case 'red':
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        default:
            return null;
    }
};


const TopPerformersList: React.FC<TopPerformersListProps> = ({ performers }) => {
  return (
    <ul className="space-y-4">
      {performers.map((performer) => (
        <li key={performer.project_id} className="flex items-center space-x-3 p-2 hover:bg-accent/10 rounded-md transition-colors duration-150">
           <span className={cn("font-bold text-lg w-6 text-center", getRankColor(performer.rank))}>
              {performer.rank <= 3 ? <Trophy className={cn("h-5 w-5 inline-block", getRankColor(performer.rank))} /> : performer.rank}
           </span>
          <Avatar className="h-9 w-9">
             {/* Placeholder Avatar - replace with actual images if available */}
            <AvatarFallback className="bg-secondary text-secondary-foreground">{performer.city.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{performer.city}</p>
            <div className="flex items-center space-x-2">
               <Progress value={performer.run_rate} className="h-2 w-[100px]" indicatorClassName={cn(
                   'transition-all duration-300', // Base class for progress indicator
                   performer.rag_status === 'Green' ? 'bg-green-500' :
                   performer.rag_status === 'Amber' ? 'bg-yellow-500' : 'bg-red-500'
               )} />
                <span className="text-xs text-muted-foreground">{performer.run_rate}%</span>
            </div>
          </div>
           <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-auto min-w-[60px] justify-end">
                {getRagIndicator(performer.rag_status)}
                <span className="font-medium">{performer.rag_status}</span>
           </div>
        </li>
      ))}
    </ul>
  );
};

export default TopPerformersList;
