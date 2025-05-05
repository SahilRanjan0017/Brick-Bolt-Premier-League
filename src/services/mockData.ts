// src/services/mockData.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, Project, OMTrendData, RAGCounts, Role } from '@/types';

// --- Helper Functions ---

const calculateRagCounts = (score: number, projectCount: number = 10): RAGCounts => {
    // Simple mock logic: higher score = more green, fewer red/amber
    let green = 0, amber = 0, red = 0;
    const baseGreen = Math.floor(projectCount * (score / 100));
    const remaining = projectCount - baseGreen;

    if (score > 85) {
        green = baseGreen + Math.floor(remaining * 0.7);
        amber = projectCount - green;
        red = 0;
    } else if (score > 65) {
        green = baseGreen;
        amber = Math.floor(remaining * 0.6);
        red = projectCount - green - amber;
    } else {
        green = Math.max(1, baseGreen - Math.floor(remaining * 0.5)); // Ensure at least 1 green if score > 0
        red = Math.floor(remaining * 0.6);
        amber = projectCount - green - red;
    }
     // Ensure non-negative counts and total matches projectCount
     green = Math.max(0, green);
     amber = Math.max(0, amber);
     red = Math.max(0, red);
     const total = green + amber + red;
     if (total !== projectCount) {
        // Adjust green first if possible
        green += (projectCount - total);
        if (green < 0) { // If adjustment made green negative, take from amber
            amber += green;
            green = 0;
        }
        if(amber < 0) { // If amber adjustment went negative, take from red
             red += amber;
             amber = 0;
        }
        red = Math.max(0, red); // Ensure red isn't negative
     }


    return { green, amber, red };
};

const getRandomRole = (index: number): Role => {
    const mod = index % 10;
    if (mod < 1) return 'OM'; // ~10% OM
    if (mod < 4) return 'TL'; // ~30% TL
    return 'SPM'; // ~60% SPM
};

const assignManager = (role: Role, omList: string[], tlList: string[]): string | undefined => {
    if (role === 'TL' && omList.length > 0) return omList[Math.floor(Math.random() * omList.length)];
    if (role === 'SPM' && tlList.length > 0) return tlList[Math.floor(Math.random() * tlList.length)];
    return undefined;
}

// --- Mock Leaderboard Data ---
// Generate more entries for better role distribution
const numEntries = 30;
const cities = ['BLR_A', 'BLR_B', 'CHN', 'NCR', 'HYD'];
const rawLeaderboard: Omit<LeaderboardEntry, 'rank' | 'ragStatus' | 'manages' | 'reportsTo' | 'projectCount' | 'rankChange'>[] = Array.from({ length: numEntries }, (_, i) => {
    const score = Math.floor(50 + Math.random() * 49); // Score 50-98
    return {
        id: `emp${String(i + 1).padStart(3, '0')}`,
        name: `Employee ${String(i + 1).padStart(3, '0')}`,
        city: cities[i % cities.length],
        score: score,
        // projectCount: Math.floor(5 + Math.random() * 15), // Assign later based on role
        role: getRandomRole(i), // Assign role
        profilePic: `https://picsum.photos/100/100?random=${i + 1}`
    };
});

// Assign hierarchy and project counts based on roles
const oms = rawLeaderboard.filter(e => e.role === 'OM');
const tls = rawLeaderboard.filter(e => e.role === 'TL');
const spms = rawLeaderboard.filter(e => e.role === 'SPM');

const omIds = oms.map(om => om.id);
const tlIds = tls.map(tl => tl.id);

export const mockLeaderboard: LeaderboardEntry[] = rawLeaderboard.map((entry) => {
    let reportsTo: string | undefined = undefined;
    let manages: LeaderboardEntry['manages'] | undefined = undefined;
    let projectCount: number | undefined = undefined;

    if (entry.role === 'OM') {
        // OM manages TLs and SPMs (mock assignment)
        manages = {
            tls: tls.filter(tl => tl.city === entry.city && Math.random() > 0.3).map(tl => tl.id), // Assign some TLs in the same city
            spms: spms.filter(spm => spm.city === entry.city && Math.random() > 0.4).map(spm => spm.id) // Assign some SPMs in the same city
        };
        // OMs don't directly manage projects in this model
    } else if (entry.role === 'TL') {
        reportsTo = assignManager(entry.role, omIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city), []); // Report to OM in same city
        projectCount = Math.floor(8 + Math.random() * 8); // TLs manage more projects
    } else if (entry.role === 'SPM') {
        const cityTLs = tlIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city);
        reportsTo = assignManager(entry.role, [], cityTLs); // Report to TL in same city
        projectCount = Math.floor(3 + Math.random() * 5); // SPMs manage fewer projects
    }

    return {
        ...entry,
        rank: 0, // Will be calculated later
        ragStatus: calculateRagCounts(entry.score, projectCount ?? 0),
        projectCount: projectCount,
        manages: manages,
        reportsTo: reportsTo,
    };
}).sort((a, b) => b.score - a.score) // Sort by score
  .map((entry, index) => ({ ...entry, rank: index + 1 })); // Assign ranks


// --- Mock Historical Winners (Keep simple for now) ---
export const mockHistoricalWinners: HistoricalWinner[] = Array.from({ length: 8 }, (_, i) => {
    const week = 30 - i;
    const winnerIndex = Math.floor(Math.random() * mockLeaderboard.length);
    const winner = mockLeaderboard[winnerIndex];
    return {
        week: week,
        name: winner.name,
        city: winner.city,
        profilePic: winner.profilePic,
    }
});


// --- Mock City Details ---
const generateProjectsForCity = (cityId: string, personnel: LeaderboardEntry[]): Project[] => {
    const projects: Project[] = [];
    const managers = personnel.filter(p => p.role === 'TL' || p.role === 'SPM');
    managers.forEach(manager => {
        for (let i = 0; i < (manager.projectCount ?? 0); i++) {
             const runRate = Math.floor(50 + Math.random() * 50);
             projects.push({
                id: `${manager.id}_proj_${i + 1}`,
                name: `${cityId} ${manager.role} Project #${i + 1}`,
                runRate: runRate,
                lastUpdated: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
                ragStatus: runRate > 85 ? 'Green' : runRate > 65 ? 'Amber' : 'Red',
                managedBy: manager.id,
                managerRole: manager.role as 'TL' | 'SPM',
            });
        }
    });
    return projects;
}

const calculateRoleRagSummary = (personnel: LeaderboardEntry[], role: Role): RAGCounts => {
     return personnel
         .filter(p => p.role === role)
         .reduce(
             (acc, p) => {
                 acc.green += p.ragStatus.green;
                 acc.amber += p.ragStatus.amber;
                 acc.red += p.ragStatus.red;
                 return acc;
             },
             { green: 0, amber: 0, red: 0 }
         );
}

const calculateRoleProjectCount = (personnel: LeaderboardEntry[], role: Role): number => {
     return personnel
         .filter(p => p.role === role)
         .reduce((sum, p) => sum + (p.projectCount ?? 0), 0);
}


export const mockCityDetails: Record<string, CityData> = cities.reduce((acc, cityId) => {
    const cityPersonnel = mockLeaderboard.filter(p => p.city === cityId);
    const cityProjects = generateProjectsForCity(cityId, cityPersonnel); // Generate projects based on city personnel

    const tlRag = calculateRoleRagSummary(cityPersonnel, 'TL');
    const spmRag = calculateRoleRagSummary(cityPersonnel, 'SPM');

    const tlProjects = calculateRoleProjectCount(cityPersonnel, 'TL');
    const spmProjects = calculateRoleProjectCount(cityPersonnel, 'SPM');

    acc[cityId] = {
        id: cityId,
        name: `City ${cityId}`, // Placeholder name
        ragBreakdown: {
            tl: tlRag,
            spm: spmRag,
        },
        projectCounts: {
            tl: tlProjects,
            spm: spmProjects,
            total: tlProjects + spmProjects,
        },
        personnel: cityPersonnel, // Include personnel list for potential display
        // performanceHistory can be added similarly if needed
    };
    return acc;
}, {} as Record<string, CityData>);


// --- Mock OM Trend Data ---
const generateWeeklyScore = (baseScore: number): number => {
    // Simulate score fluctuation around the base score
    return Math.max(40, Math.min(99, baseScore + Math.floor(Math.random() * 21) - 10));
}

export const mockOMTrends: OMTrendData[] = oms.map(om => {
    const weeklyScores = Array.from({ length: 8 }, (_, i) => ({
        week: 30 - 7 + i, // Last 8 weeks ending week 30
        // Mock aggregated score based on OM's own score + some noise
        score: generateWeeklyScore(om.score),
    }));

    // Mock subordinate ranks (optional, basic example)
    const subordinateRanks = Array.from({ length: 8 }, (_, i) => ({
        week: 30 - 7 + i,
        tlRank: Math.floor(Math.random() * 10) + 1, // Placeholder rank
        spmRank: Math.floor(Math.random() * 20) + 1, // Placeholder rank
    }));

    return {
        omId: om.id,
        omName: om.name,
        weeklyScores: weeklyScores,
        subordinateRanks: subordinateRanks, // Include placeholder ranks
    };
});

// --- Mock Reward Details (Assign based on top ranks in roles) ---
const getTopPerformerId = (role: Role): string | null => {
    const sortedByRole = mockLeaderboard.filter(p => p.role === role).sort((a,b) => b.score - a.score);
    return sortedByRole.length > 0 ? sortedByRole[0].id : null;
}

export const mockRewardDetails: RewardDetails = {
    awards: {
        // Assign Employee of the Month to top OM for now
        employeeOfMonth: {
            title: "Manager of the Month (OM)",
            awardeeId: getTopPerformerId('OM'),
        },
        // Assign City Champion to top TL
        cityChampion: {
            title: "Lead Champion (TL)",
             awardeeId: getTopPerformerId('TL'),
        },
         // Assign Innovation Award to top SPM
        innovationAward: {
            title: "Execution Excellence (SPM)",
             awardeeId: getTopPerformerId('SPM'),
        },
    },
     // Keep incentives generic for now
    incentives: {
        ops: [ // Could represent OM/TL/SPM combined or needs splitting
            "Metric: Overall Team RAG Score Improvement",
            "Metric: Client Escalation Reduction",
            "Metric: Cross-functional Collaboration",
        ],
        vm: [
            "Metric A: Vendor Onboarding Time (< 3 days)",
            "Metric B: Material Quality Score (>98%)",
            "Metric C: Cost Savings Achieved (>5%)",
        ],
    },
    programs: {
        quarterlyAwards: "Top performers in OM, TL, and SPM categories recognized quarterly.",
        annualConference: "Highest achievers across all roles invited to the annual leadership conference.",
    }
};