import React from 'react';
import type { ProjectData } from '@/services/cloud-sql';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityStatsCardProps {
  data: ProjectData;
}

const getRagColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
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

const getRagIcon = (status: string): React.ReactNode => {
    switch (status.toLowerCase()) {
        case 'green':
            return <TrendingUp className="h-5 w-5 text-green-500" />;
        case 'amber':
            return <Minus className="h-5 w-5 text-yellow-500" />;
        case 'red':
            return <TrendingDown className="h-5 w-5 text-red-500" />;
        default:
            return null;
    }
}

const CityStatsCard: React.FC<CityStatsCardProps> = ({ data }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-border rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-secondary/10">
        <CardTitle className="text-lg font-medium">{data.city}</CardTitle>
        <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold",
            data.rag_status === 'Green' ? 'bg-green-100 text-green-800' :
            data.rag_status === 'Amber' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        )}>
            {getRagIcon(data.rag_status)}
            <span>{data.rag_status}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
         <div>
             <p className="text-sm font-medium text-muted-foreground mb-1">Weekly Run Rate</p>
             <div className="flex items-center space-x-2">
               <Progress value={data.run_rate} className="h-3 flex-grow" indicatorClassName={getRagColorClass(data.rag_status)} />
               <span className="text-lg font-bold text-foreground">{data.run_rate}%</span>
             </div>
         </div>
        <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
          <CalendarClock className="h-3 w-3 mr-1" />
          Last Updated: {new Date(data.last_updated).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default CityStatsCard;
