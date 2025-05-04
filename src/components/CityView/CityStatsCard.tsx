import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, CalendarClock, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityStatsCardProps {
  data: ProjectData & { rank: number }; // Expect data with rank
}

const getRagColorClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'green':
      return 'bg-green-500';
    case 'amber':
      return 'bg-yellow-500';
    case 'red':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
};

const getRagTextClass = (status: string): string => {
   switch (status?.toLowerCase()) {
     case 'green':
       return 'text-green-600 dark:text-green-400';
     case 'amber':
       return 'text-yellow-600 dark:text-yellow-400';
     case 'red':
       return 'text-red-600 dark:text-red-400';
     default:
       return 'text-muted-foreground';
   }
}

const getRagIcon = (status: string): React.ReactNode => {
    switch (status?.toLowerCase()) {
        case 'green':
            return <TrendingUp className={cn("h-5 w-5", getRagTextClass(status))} />;
        case 'amber':
            return <Minus className={cn("h-5 w-5", getRagTextClass(status))} />;
        case 'red':
            return <TrendingDown className={cn("h-5 w-5", getRagTextClass(status))} />;
        default:
            return null;
    }
}

const CityStatsCard: React.FC<CityStatsCardProps> = ({ data }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border border-border rounded-lg overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-card">
        <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-foreground">{data.city}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground flex items-center">
                 <Medal className="h-3 w-3 mr-1 text-primary" />
                 Overall Rank: <span className="font-medium ml-1">{data.rank}</span>
             </CardDescription>
        </div>
        <div className={cn(
            "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border",
            data.rag_status === 'Green' ? 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' :
            data.rag_status === 'Amber' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700' :
            data.rag_status === 'Red' ? 'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' :
            'bg-muted text-muted-foreground border-border'
        )}>
            {getRagIcon(data.rag_status)}
            <span className="ml-1">{data.rag_status}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
         <div className="border-t pt-4">
             <p className="text-sm font-medium text-muted-foreground mb-1">Weekly Run Rate</p>
             <div className="flex items-center space-x-3">
               <Progress value={data.run_rate} className="h-2 flex-grow rounded-full" indicatorClassName={cn('transition-all duration-500 ease-out', getRagColorClass(data.rag_status))} />
               <span className="text-lg font-bold text-foreground">{data.run_rate}%</span>
             </div>
         </div>
        <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border/50">
          <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
          Last Updated: {new Date(data.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CityStatsCard;
