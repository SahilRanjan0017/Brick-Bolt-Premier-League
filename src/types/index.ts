// src/types/index.ts

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
}

export interface CityViewsPageData {
    [cityId: string]: CityData;
}

// --- New Dashboard Types ---
export interface StatCardData {
    value: string | number;
    trend?: string; // e.g., "+12 from last month"
    trendDirection?: 'up' | 'down' | 'neutral';
    percentage?: string; // e.g., "65% of total"
}

export interface DashboardStatsData {
    activeProjects: StatCardData;
    greenProjects: StatCardData;
    amberProjects: StatCardData;
    redProjects: StatCardData;
    // Potentially other overall stats for the selected filters
}

// For API call parameters to getDashboardStats
export interface DashboardFilters {
    city?: string;
    role?: string;
    time?: string; // e.g. 'this_week', 'last_month'
}