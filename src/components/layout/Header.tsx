// src/components/layout/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Target, Menu, X, Trophy, LayoutDashboard, ListChecks, ScrollText } from 'lucide-react'; // Added Target, LayoutDashboard, ScrollText
import { cn } from '@/lib/utils';

// Updated navItems based on the image
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: ListChecks },
  { href: '/rules', label: 'Rules', icon: ScrollText },
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

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-shadow duration-300",
        isScrolled ? "shadow-lg" : "shadow-none",
        // Applying gradient from CSS variables
        "bg-gradient-to-r from-[hsl(var(--header-gradient-start))] to-[hsl(var(--header-gradient-end))] text-primary-foreground border-transparent"
      )}
    >
      <div className="container mx-auto flex h-20 items-center px-4">
        {/* Logo and Title */}
        <Link href="/dashboard" className="mr-6 flex items-center space-x-3 flex-shrink-0">
          <Target className="h-10 w-10 text-primary-foreground" /> {/* Updated Icon */}
          <div>
            <span className="font-bold text-xl whitespace-nowrap">Brick & Bolt Premier League</span>
            <p className="text-xs text-primary-foreground/80 whitespace-nowrap">Construction Champions 2025</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-grow">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "text-sm font-medium transition-colors hover:bg-white/10 focus-visible:ring-white/50 py-2 px-3 rounded-md",
                  isActive(item.href) ? 'bg-secondary text-secondary-foreground shadow-md' : 'text-primary-foreground/90 hover:text-primary-foreground',
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Season Button - Pushed to the right */}
        <div className="hidden md:flex ml-auto items-center">
            <Button
              variant="default"
              className="bg-gradient-to-r from-[hsl(var(--season-button-gradient-start))] to-[hsl(var(--season-button-gradient-end))] text-accent-foreground hover:opacity-90 transition-opacity shadow-md px-4 py-2"
            >
              <Trophy className="mr-2 h-4 w-4" />
              SEASON 1 - MAY 2025
            </Button>
        </div>


        {/* Mobile Menu Trigger */}
        <div className="ml-auto md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/20 focus-visible:ring-white/50 text-primary-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 text-foreground">
              <div className="flex h-full flex-col">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                      <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <Target className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">B&B Premier League</span>
                      </Link>
                       <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                          </Button>
                        </SheetTrigger>
                  </div>

                  {/* Mobile Navigation Links */}
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
                    {/* Season button in mobile */}
                    <div className="pt-4 mt-4 border-t">
                       <Button
                        variant="default"
                        className="w-full bg-gradient-to-r from-[hsl(var(--season-button-gradient-start))] to-[hsl(var(--season-button-gradient-end))] text-accent-foreground hover:opacity-90 transition-opacity shadow-md"
                        onClick={() => {
                            // Potentially navigate or just close menu
                            setIsMobileMenuOpen(false);
                        }}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        SEASON 1 - MAY 2025
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