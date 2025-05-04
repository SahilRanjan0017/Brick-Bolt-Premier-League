// src/types/index.ts

// RAG Status Type
export type RagStatus = 'Green' | 'Amber' | 'Red' | string; // Allow string for flexibility

export interface RAGCounts {
    green: number;
    amber: number;
    red: number;
    status: RagStatus; // Overall status (can be derived or explicit)
}

// Leaderboard Entry Type
export interface LeaderboardEntry {
    id: string; // Unique identifier for the entry/employee
    rank: number;
    rankChange: number; // +1, 0, -1 for up, same, down
    name: string;
    city: string; // e.g., 'BLR_A', 'CHN'
    score: number; // Overall performance score
    projectCount: number;
    ragStatus: RAGCounts;
    profilePic?: string; // URL to profile picture (optional)
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
}

// Team Member Type (for City View)
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    profilePic?: string;
}

// City Data Type (for City View)
export interface CityData {
    id: string; // e.g., 'BLR_A'
    name: string; // e.g., 'Bangalore Alpha'
    performanceHistory: {
        week: number;
        runRate: number; // Average run rate for the city that week
    }[];
    ragSummary: {
        green: number;
        amber: number;
        red: number;
        totalProjects: number;
        activeProjects: number;
    };
    projects: Project[];
    teamMembers: TeamMember[];
}

// Reward Details Type
export interface RewardAward {
    title: string;
    awardeeId: string | null; // ID linking to LeaderboardEntry, or null if TBD
}

export interface RewardDetails {
    awards: {
        employeeOfMonth: RewardAward;
        cityChampion: RewardAward;
        innovationAward: RewardAward;
        // Add more awards as needed
    };
    incentives: {
        ops: string[]; // List of incentive metrics/descriptions
        vm: string[];
    };
    programs: {
        quarterlyAwards: string; // Description of the program
        annualConference: string;
    };
}
