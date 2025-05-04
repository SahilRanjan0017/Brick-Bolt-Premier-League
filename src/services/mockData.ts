// src/services/mockData.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, Project, TeamMember } from '@/types';

// Mock Leaderboard Data (Ranks and RAG will be calculated in API service)
export const mockLeaderboard: Omit<LeaderboardEntry, 'rank' | 'ragStatus' | 'rankChange'>[] = [
  { id: 'emp001', name: 'Arjun Sharma', city: 'BLR_A', score: 95, projectCount: 25, profilePic: 'https://picsum.photos/100/100?random=1' },
  { id: 'emp002', name: 'Priya Singh', city: 'NCR', score: 92, projectCount: 28, profilePic: 'https://picsum.photos/100/100?random=2' },
  { id: 'emp003', name: 'Vikram Reddy', city: 'HYD', score: 88, projectCount: 22, profilePic: 'https://picsum.photos/100/100?random=3' },
  { id: 'emp004', name: 'Sneha Patel', city: 'BLR_B', score: 85, projectCount: 26, profilePic: 'https://picsum.photos/100/100?random=4' },
  { id: 'emp005', name: 'Rohan Gupta', city: 'CHN', score: 82, projectCount: 20, profilePic: 'https://picsum.photos/100/100?random=5' },
  { id: 'emp006', name: 'Meera Iyer', city: 'BLR_A', score: 78, projectCount: 23, profilePic: 'https://picsum.photos/100/100?random=6' },
  { id: 'emp007', name: 'Amit Kumar', city: 'NCR', score: 75, projectCount: 21, profilePic: 'https://picsum.photos/100/100?random=7' },
  { id: 'emp008', name: 'Deepika Rao', city: 'HYD', score: 70, projectCount: 19, profilePic: 'https://picsum.photos/100/100?random=8' },
  { id: 'emp009', name: 'Karan Mehta', city: 'BLR_B', score: 65, projectCount: 24, profilePic: 'https://picsum.photos/100/100?random=9' },
  { id: 'emp010', name: 'Anjali Nair', city: 'CHN', score: 58, projectCount: 18, profilePic: 'https://picsum.photos/100/100?random=10' },
  // Add more entries as needed
];

// Mock Historical Winners
export const mockHistoricalWinners: HistoricalWinner[] = Array.from({ length: 8 }, (_, i) => {
    const week = 30 - i; // Example: Weeks 30 down to 23
    const winnerIndex = Math.floor(Math.random() * mockLeaderboard.length);
    const winner = mockLeaderboard[winnerIndex];
    return {
        week: week,
        name: winner.name,
        city: winner.city,
        profilePic: winner.profilePic, // Reuse profile pic from leaderboard mock
    }
});

// --- Mock City Details ---

const generateProjects = (cityPrefix: string, count: number): Project[] => {
    return Array.from({ length: count }, (_, i) => {
        const runRate = Math.floor(50 + Math.random() * 50); // Random run rate 50-99
        return {
            id: `${cityPrefix}_proj_${i + 1}`,
            name: `${cityPrefix} Project #${i + 1}`,
            runRate: runRate,
            lastUpdated: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 10 days
            ragStatus: runRate > 85 ? 'Green' : runRate > 65 ? 'Amber' : 'Red',
        };
    });
};

const generateTeamMembers = (cityPrefix: string, count: number): TeamMember[] => {
     return Array.from({ length: count }, (_, i) => ({
         id: `${cityPrefix}_mem_${i + 1}`,
         name: `${cityPrefix} Member ${i + 1}`,
         role: Math.random() > 0.5 ? 'Project Manager' : 'Site Engineer', // Example roles
         profilePic: `https://picsum.photos/100/100?random=${cityPrefix}${i + 1}`,
     }));
};

const generatePerformanceHistory = (weeks: number): { week: number; runRate: number }[] => {
    return Array.from({ length: weeks }, (_, i) => ({
        week: 30 - weeks + i + 1, // Example: Last 'weeks' weeks ending week 30
        runRate: Math.floor(60 + Math.random() * 35), // Random run rate 60-94
    }));
};

const calculateRagSummary = (projects: Project[]): CityData['ragSummary'] => {
    const summary = projects.reduce(
        (acc, project) => {
            if (project.ragStatus === 'Green') acc.green++;
            else if (project.ragStatus === 'Amber') acc.amber++;
            else if (project.ragStatus === 'Red') acc.red++;
            return acc;
        },
        { green: 0, amber: 0, red: 0 }
    );
    const totalProjects = projects.length;
    // Simulate active projects (e.g., 90% of total)
    const activeProjects = Math.floor(totalProjects * 0.9);
    return { ...summary, totalProjects, activeProjects };
};

const generateCityData = (cityId: string, projectCount: number, memberCount: number, historyWeeks: number): CityData => {
    const projects = generateProjects(cityId, projectCount);
    return {
        id: cityId,
        name: `City ${cityId}`, // Or a more descriptive name if available
        performanceHistory: generatePerformanceHistory(historyWeeks),
        ragSummary: calculateRagSummary(projects),
        projects: projects,
        teamMembers: generateTeamMembers(cityId, memberCount),
    };
}

export const mockCityDetails: Record<string, CityData> = {
    'BLR_A': generateCityData('BLR_A', 15, 8, 12),
    'BLR_B': generateCityData('BLR_B', 18, 10, 12),
    'CHN': generateCityData('CHN', 12, 7, 12),
    'NCR': generateCityData('NCR', 20, 12, 12),
    'HYD': generateCityData('HYD', 16, 9, 12),
};


// --- Mock Reward Details ---

export const mockRewardDetails: RewardDetails = {
    awards: {
        employeeOfMonth: {
            title: "Employee of the Month",
            awardeeId: "emp001", // Link to LeaderboardEntry ID (Arjun Sharma)
        },
        cityChampion: {
            title: "City Champion (NCR)",
            awardeeId: "emp002", // Link to LeaderboardEntry ID (Priya Singh)
        },
        innovationAward: {
            title: "Innovation Award",
             awardeeId: "emp004", // Link to LeaderboardEntry ID (Sneha Patel)
        },
    },
    incentives: {
        ops: [
            "Metric 1: On-time project stage completion (>95%)",
            "Metric 2: Customer Satisfaction Score (>4.8/5)",
            "Metric 3: Budget Adherence (<2% variance)",
            "Metric 4: Safety Incident Rate (Zero incidents)",
        ],
        vm: [
            "Metric A: Vendor Onboarding Time (< 3 days)",
            "Metric B: Material Quality Score (>98%)",
            "Metric C: Cost Savings Achieved (>5%)",
            "Metric D: Vendor Performance Rating (>4.5/5)",
        ],
    },
    programs: {
        quarterlyAwards: "Top performers across various categories recognized quarterly with bonuses and company-wide announcement.",
        annualConference: "Highest achievers invited to the annual leadership conference for special recognition and networking.",
    }
};
