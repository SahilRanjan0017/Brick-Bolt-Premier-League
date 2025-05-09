// src/app/rules/page.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

const RulesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ScrollText className="text-primary h-7 w-7" /> League Rules &amp; Guidelines
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Rules of the Brick & Bolt Premier League</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The official rules, scoring methodology, and guidelines for the Brick & Bolt Premier League
            will be detailed here.
          </p>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Content Coming Soon</h3>
            <p>Please check back later for the complete set of rules and regulations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RulesPage;