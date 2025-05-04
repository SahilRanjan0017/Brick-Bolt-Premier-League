// src/app/incentive-vm/page.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const IncentiveVMPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Star className="text-primary h-7 w-7" /> Incentive-VM Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Incentive-VM Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
             Detailed metrics, performance tracking, and incentive calculations for the Vendor Management team will be displayed here.
          </p>
           {/* Placeholder for future charts, tables, etc. */}
            <div className="mt-6 border-t pt-6">
                 <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
                 <p>We are working on bringing detailed Incentive-VM data to this page.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncentiveVMPage;
