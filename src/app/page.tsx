import { getProjectData } from '@/services/cloud-sql';
import type { ProjectData } from '@/services/cloud-sql';
import Header from '@/components/layout/Header';
import Leaderboard from '@/components/Leaderboard/Leaderboard';
import CityPerformance from '@/components/CityView/CityPerformance';
import { Award, BarChart3, Building, ChevronRight, Home, Trophy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function Home() {
  const projectData: ProjectData[] = await getProjectData();

  // Sort data by run_rate descending to determine rankings
  const sortedData = [...projectData].sort((a, b) => b.run_rate - a.run_rate);
  const topPerformers = sortedData.slice(0, 5);
  const podiumPerformers = sortedData.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </a>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <span className="font-medium text-foreground">Performance Overview</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="text-primary" /> Brick & Bolt Vista
        </h1>
        <p className="text-muted-foreground mb-8">
          Weekly Performance Leaderboard & City Insights
        </p>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <Award className="text-accent"/> Top Performers
          </h2>
          <Leaderboard podiumData={podiumPerformers} topData={topPerformers} />
        </section>

        <Separator className="my-8"/>

        {/* City Performance Section */}
        <section id="city-performance">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Building className="text-accent" /> City Performance
          </h2>
           <CityPerformance data={projectData} />
        </section>

         <Separator className="my-8"/>

         {/* Placeholder for Run Rate Visualization */}
         <section id="run-rate-visualization" className="mb-12">
           <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
             <BarChart3 className="text-accent"/> Weekly Run Rate Overview
           </h2>
           <div className="p-6 bg-card rounded-lg shadow-sm border">
             <p className="text-muted-foreground">Detailed run rate charts will be displayed here.</p>
             {/* Future implementation of charts */}
           </div>
         </section>
      </div>
       <footer className="text-center p-4 text-sm text-muted-foreground border-t">
            © {new Date().getFullYear()} Brick & Bolt. All rights reserved.
       </footer>
    </div>
  );
}
