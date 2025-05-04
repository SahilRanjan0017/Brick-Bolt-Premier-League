import React from 'react';
import { Button } from "@/components/ui/button";
import { Building, UserCircle, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <div className="mr-4 flex items-center">
           <Building className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">Brick & Bolt Vista</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          {/* Add navigation links here if needed */}
        </nav>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon">
             <Settings className="h-5 w-5" />
             <span className="sr-only">Settings</span>
           </Button>
           <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">User Profile</span>
            </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
