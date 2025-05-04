// src/components/layout/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Trophy, Menu, X, ChevronDown, Building, Award, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navItems = [
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/city-views', label: 'City Views', icon: Building },
  { href: '/rewards', label: 'Rewards', icon: Award },
];

const subNavItems = [
    { href: '/incentive-ops', label: 'Incentive-Ops', icon: Users },
    { href: '/incentive-vm', label: 'Incentive-VM', icon: Star },
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
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-gradient-to-r from-primary to-orange-600 shadow-md border-transparent" : "bg-gradient-to-r from-primary/95 to-orange-600/95 backdrop-blur border-transparent",
        "text-primary-foreground" // Ensure text color contrasts with gradient
      )}
    >
      <div className="container flex h-16 items-center mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2 flex-shrink-0">
          <Trophy className="h-7 w-7 text-yellow-300" />
          <span className="font-bold text-xl whitespace-nowrap">B&B Premier League</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-grow">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "text-sm font-medium transition-colors hover:bg-white/20 hover:text-primary-foreground focus-visible:ring-white/50",
                  isActive(item.href) ? 'bg-white/20 underline underline-offset-4' : 'text-primary-foreground/90',
                  "px-3 py-2 rounded-md flex items-center gap-1" // Adjusted padding & added gap
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon className="h-4 w-4"/>
                {item.label}
              </Button>
            </Link>
          ))}

         {/* Sub Navigation Dropdown */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                 variant="ghost"
                 className="text-sm font-medium transition-colors hover:bg-white/20 hover:text-primary-foreground focus-visible:ring-white/50 text-primary-foreground/90 px-3 py-2 rounded-md flex items-center gap-1"
              >
                 Incentives <ChevronDown className="h-4 w-4 ml-1" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-background text-foreground border shadow-lg">
              {subNavItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                     <DropdownMenuItem className={cn("flex items-center gap-2 cursor-pointer hover:bg-accent", isActive(item.href) ? 'bg-accent font-medium' : '')}>
                        <item.icon className="h-4 w-4 text-muted-foreground"/>
                        {item.label}
                     </DropdownMenuItem>
                  </Link>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>
        </nav>

        {/* Spacer to push mobile menu trigger to the right */}
        <div className="flex-1 md:hidden"></div>

        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-white/20 focus-visible:ring-white/50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background p-0 text-foreground">
            <div className="flex h-full flex-col">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <Trophy className="h-6 w-6 text-primary" />
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
                          "w-full justify-start text-base font-medium flex items-center gap-3",
                          isActive(item.href) ? 'text-secondary-foreground' : 'text-foreground/80 hover:text-foreground'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                         <item.icon className="h-5 w-5"/>
                         {item.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                     <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">Incentives</p>
                      {subNavItems.map((item) => (
                         <Link key={item.href} href={item.href} passHref>
                           <Button
                             variant={isActive(item.href) ? 'secondary' : 'ghost'}
                             className={cn(
                               "w-full justify-start text-base font-medium flex items-center gap-3",
                               isActive(item.href) ? 'text-secondary-foreground' : 'text-foreground/80 hover:text-foreground'
                             )}
                             onClick={() => setIsMobileMenuOpen(false)}
                             aria-current={isActive(item.href) ? 'page' : undefined}
                           >
                              <item.icon className="h-5 w-5"/>
                              {item.label}
                           </Button>
                         </Link>
                       ))}
                  </div>
                </nav>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
};

export default Header;
