// src/types/index.ts
import type React from 'react';

// Role Type
export type Role = 'OM' | 'TL' | 'SPM' | string; // Operations Manager, Team Lead, Senior Project Manager

// RAG Status Type
export type RagStatus = 'Green' | 'Amber' | 'Red' | string; // Allow string for flexibility

export interface RAGCounts {
    green: number;
    amber: number;
    red: number;
}

// Leaderboard Entry Type
export interface LeaderboardEntry {
    id: string;
    rank: number;
    rankChange?: number;
    name: string;
    role: Role;
    city: string;
    score: number;
    projectCount?: number;
    ragStatus: RAGCounts;
    profilePic?: string;
    manages?: {
        tls?: string[];
        spms?: string[];
    }
    reportsTo?: string;
}

// Historical Winner Type
export interface HistoricalWinner {
    week: number;
    name: string;
    city: string;
    profilePic?: string;
}

// Project Type (for City View)
export interface Project {
    id: string;
    name: string;
    runRate: number;
    lastUpdated: string;
    ragStatus: RagStatus;
    managedBy: string;
    managerRole: 'TL' | 'SPM';
}

// City Data Type (for City View)
export interface CityData {
    id: string;
    name: string;
    performanceHistory?: {
        week: number;
        runRate: number;
    }[];
    ragBreakdown: {
        tl: RAGCounts;
        spm: RAGCounts;
    };
    projectCounts: {
        tl: number;
        spm: number;
        total: number;
    };
    personnel: LeaderboardEntry[];
}

// OM 8-Week Trend Data
export interface OMTrendData {
    omId: string;
    omName: string;
    weeklyScores: { week: number; score: number }[];
    subordinateRanks?: {
        week: number;
        tlRank?: number;
        spmRank?: number;
    }[];
}


// Reward Details Type
export interface RewardAward {
    title: string;
    awardeeId: string | null;
}

export interface RewardDetails {
    awards: {
        employeeOfMonth: RewardAward;
        cityChampion: RewardAward;
        innovationAward: RewardAward;
    };
    incentives: {
        ops: string[];
        vm: string[];
    };
    programs: {
        quarterlyAwards: string;
        annualConference: string;
    };
}

// --- Consolidated API Response Types ---

export interface LeaderboardPageData {
    topPerformers: {
        om: LeaderboardEntry[];
        tl: LeaderboardEntry[];
        spm: LeaderboardEntry[];
    };
    omTrends: OMTrendData[];
    fullLeaderboard: LeaderboardEntry[];
    historicalWinners: HistoricalWinner[];
    // Added to support duplicated historical winners per role
    historicalWinnersOM: HistoricalWinner[];
    historicalWinnersTL: HistoricalWinner[];
    historicalWinnersSPM: HistoricalWinner[];
    // Data for the Performance Scoreboard section, now on Leaderboard page
    dashboardStats?: DashboardStatsData; // Optional because it's specific to the new section
}

export interface CityViewsPageData {
    [cityId: string]: CityData;
}

// --- New Dashboard Types ---

// Updated StatCardData to be self-contained for rendering
export interface StatCardData {
    title: string;
    value: string | number;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
    percentage?: string;
    icon: React.ElementType; // Lucide icon component
    iconBgColor?: string; // e.g., 'bg-green-100 dark:bg-green-900/50'
    iconTextColor?: string; // e.g., 'text-green-600 dark:text-green-300'
}

export interface RecentActivityItem {
    id: string;
    type: 'milestone' | 'status_change' | 'assignment' | 'completion' | 'general';
    description: string; // HTML for bolding etc.
    time: string; // e.g., "2 hours ago"
    details?: {
        text: string; // e.g. "+6 Runs" or "Runs"
        type: 'positive' | 'negative' | 'neutral';
    };
    icon?: React.ElementType; // Optional: if specific icons per activity are needed beyond type
}


export interface DashboardStatsData {
    activeProjects: StatCardData;
    greenProjects: StatCardData;
    amberProjects: StatCardData;
    redProjects: StatCardData;
    leaderboard: LeaderboardEntry[];
    recentActivities: RecentActivityItem[];
}

// For API call parameters to getDashboardStats
export interface DashboardFilters {
    city?: string;
    role?: Role; // Added role for scoreboard filtering
    week?: string; // Added week for scoreboard filtering
}
