// src/types/index.ts

// Role Type
export type Role = 'OM' | 'TL' | 'SPM' | string; // Operations Manager, Team Lead, Senior Project Manager

// RAG Status Type
export type RagStatus = 'Green' | 'Amber' | 'Red' | string; // Allow string for flexibility

export interface RAGCounts {
    green: number;
    amber: number;
    red: number;
    // Derived or explicit overall status is less relevant now with role-based views
}

// Leaderboard Entry Type
export interface LeaderboardEntry {
    id: string; // Unique identifier for the entry/employee
    rank: number;
    rankChange?: number; // Optional: +1, 0, -1 for up, same, down
    name: string;
    role: Role; // Added Role
    city: string; // e.g., 'BLR_A', 'CHN'
    score: number; // Represents overall performance/RAG score
    projectCount?: number; // Make optional as it might not apply to all roles (e.g., OM)
    ragStatus: RAGCounts; // RAG counts for their direct responsibility area
    profilePic?: string; // URL to profile picture (optional)
    // For OMs, link to their subordinates
    manages?: {
        tls?: string[]; // Array of TL IDs
        spms?: string[]; // Array of SPM IDs
    }
    // For TLs/SPMs, link to their manager
    reportsTo?: string; // OM ID or TL ID
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
    runRate: number; // Specific run rate for this project
    lastUpdated: string; // ISO date string
    ragStatus: RagStatus;
    managedBy: string; // ID of the TL or SPM managing this project
    managerRole: 'TL' | 'SPM'; // Role of the manager
}

// Team Member Type (for City View - Now using LeaderboardEntry, can be removed if not needed elsewhere)
// export interface TeamMember {
//     id: string;
//     name: string;
//     role: Role;
//     profilePic?: string;
// }


// City Data Type (for City View) - Updated for new requirements
export interface CityData {
    id: string; // e.g., 'BLR_A'
    name: string; // e.g., 'Bangalore Alpha'
    // Keep overall performance history for the city if needed
    performanceHistory?: {
        week: number;
        runRate: number; // Average run rate for the city that week
    }[];
    // RAG breakdown by role
    ragBreakdown: {
        tl: RAGCounts;
        spm: RAGCounts;
    };
    // Project count by role
    projectCounts: {
        tl: number;
        spm: number;
        total: number;
    };
    // List of personnel in the city (fetched from leaderboard data, filtered by city)
    personnel: LeaderboardEntry[];
}

// OM 8-Week Trend Data
export interface OMTrendData {
    omId: string;
    omName: string;
    weeklyScores: { week: number; score: number }[]; // Aggregated RAG score per week
    subordinateRanks?: { // Optional: Placeholder for ranks
        week: number;
        tlRank?: number; // Average/Top rank of TLs under OM
        spmRank?: number; // Average/Top rank of SPMs under OM
    }[];
}


// Reward Details Type (remains mostly the same, awardee selection might change based on roles)
export interface RewardAward {
    title: string;
    awardeeId: string | null; // ID linking to LeaderboardEntry, or null if TBD
}

export interface RewardDetails {
    awards: {
        employeeOfMonth: RewardAward; // Consider if this should be role specific
        cityChampion: RewardAward; // Consider if this should be role specific
        innovationAward: RewardAward; // Consider if this should be role specific
        // Add more awards as needed
    };
    incentives: {
        ops: string[]; // List of incentive metrics/descriptions (may need role separation OM/TL/SPM)
        vm: string[]; // Assuming this is separate from OM/TL/SPM roles
    };
    programs: {
        quarterlyAwards: string; // Description of the program
        annualConference: string;
    };
}

// --- Consolidated API Response Types (Optional but helpful) ---

export interface LeaderboardPageData {
    topPerformers: {
        om: LeaderboardEntry[];
        tl: LeaderboardEntry[];
        spm: LeaderboardEntry[];
    };
    omTrends: OMTrendData[];
    fullLeaderboard: LeaderboardEntry[];
    historicalWinners: HistoricalWinner[]; // Ensure this is mandatory if page depends on it
}

export interface CityViewsPageData {
    [cityId: string]: CityData;
}

    