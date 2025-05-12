// src/components/layout/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Target, Menu, X, Trophy, LayoutDashboard, ListChecks, ScrollText, Database, Building2, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

// Updated navItems based on the user's general app description and new page
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: ListChecks },
  { href: '/city-views', label: 'City Views', icon: Building2 },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/performance-data', label: 'Performance Log', icon: Database },
  { href: '/rules', label: 'Rules', icon: ScrollText },
  // Note: Incentive-Ops and Incentive-VM are not currently top-level nav items here.
  // If they are sub-navigation, that would be handled differently (e.g., dropdown).
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-shadow duration-300",
        isScrolled ? "shadow-lg" : "shadow-none",
        "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-primary-foreground border-transparent" // Updated gradient to match proposal
      )}
    >
      <div className="container mx-auto flex h-20 items-center px-4">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-3 flex-shrink-0">
          <Trophy className="h-10 w-10 text-primary-foreground" /> {/* Main Logo Icon: Trophy */}
          <div>
            <span className="font-bold text-xl whitespace-nowrap">Brick & Bolt Premier League</span> {/* App Name */}
            <p className="text-xs text-primary-foreground/80 whitespace-nowrap">Construction Champions 2025</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 flex-grow">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "text-sm font-medium transition-colors hover:bg-primary-foreground/10 focus-visible:ring-primary-foreground/50 py-2 px-3 rounded-md",
                  isActive(item.href) ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm' : 'text-primary-foreground/90 hover:text-primary-foreground',
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Season Button - Pushed to the right */}
         <div className="hidden md:flex ml-auto items-center">
             <Button
              variant="secondary" // Using secondary for a different look from nav items
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-md px-4 py-2" // Teal accent color
            >
              SEASON 1 - 2025
            </Button>
        </div>


        <div className="ml-auto md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 focus-visible:ring-primary-foreground/50 text-primary-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 text-foreground">
              <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                      <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <Trophy className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">B&B Vista</span>
                      </Link>
                       <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                          </Button>
                        </SheetTrigger>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                   {navItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={isActive(item.href) ? 'secondary' : 'ghost'}
                          className={cn(
                            "w-full justify-start text-base font-medium flex items-center gap-3 py-3",
                            isActive(item.href) ? 'text-secondary-foreground bg-secondary' : 'text-foreground/80 hover:text-foreground hover:bg-accent/10'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isActive(item.href) ? 'page' : undefined}
                        >
                           <item.icon className="h-5 w-5"/>
                           {item.label}
                        </Button>
                      </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                       <Button
                        variant="default" // Or secondary, depending on desired emphasis
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        SEASON 1 - 2025
                      </Button>
                    </div>
                  </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;