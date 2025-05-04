// src/app/incentive-ops/page.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const IncentiveOpsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users className="text-primary h-7 w-7" /> Incentive-Ops Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Incentive-Ops Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed metrics, performance tracking, and incentive calculations for the Operations team will be displayed here.
          </p>
          {/* Placeholder for future charts, tables, etc. */}
           <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                <p>We are working on bringing detailed Incentive-Ops data to this page.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncentiveOpsPage;
