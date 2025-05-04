import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header'; // Import Header

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Brick & Bolt Premier League',
  description: 'Performance Dashboard for Brick & Bolt',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className={`antialiased flex flex-col min-h-screen font-sans`}>
        <Header /> {/* Add Header here */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
         <footer className="text-center p-4 text-sm text-muted-foreground border-t">
              © {new Date().getFullYear()} Brick & Bolt. All rights reserved.
         </footer>
      </body>
    </html>
  );
}
