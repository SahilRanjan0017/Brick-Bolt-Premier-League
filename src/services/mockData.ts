// src/services/mockData.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, Project, OMTrendData, RAGCounts, Role, DashboardStatsData, DashboardFilters, RecentActivityItem, StatCardData } from '@/types';
import { ListChecks, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

// --- Helper Functions ---

const calculateRagCounts = (score: number, projectCount: number = 10): RAGCounts => {
    let green = 0, amber = 0, red = 0;
    if (projectCount === 0) return { green: 0, amber: 0, red: 0 };

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
        green = Math.max(1, baseGreen - Math.floor(remaining * 0.5));
        red = Math.floor(remaining * 0.6);
        amber = projectCount - green - red;
    }
     green = Math.max(0, green);
     amber = Math.max(0, amber);
     red = Math.max(0, red);
     const total = green + amber + red;
     if (total !== projectCount) {
        green += (projectCount - total);
        if (green < 0) {
            amber += green;
            green = 0;
        }
        if(amber < 0) {
             red += amber;
             amber = 0;
        }
        red = Math.max(0, red);
     }


    return { green, amber, red };
};

const getRandomRole = (index: number): Role => {
    const mod = index % 10;
    if (mod < 1) return 'OM';
    if (mod < 4) return 'TL';
    return 'SPM';
};

const assignManager = (role: Role, omList: string[], tlList: string[]): string | undefined => {
    if (role === 'TL' && omList.length > 0) return omList[Math.floor(Math.random() * omList.length)];
    if (role === 'SPM' && tlList.length > 0) return tlList[Math.floor(Math.random() * tlList.length)];
    return undefined;
}

// --- Mock Leaderboard Data ---
const numEntries = 30;
const cities = ['BLR_A', 'BLR_B', 'CHN', 'NCR', 'HYD'];
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan", "Priya", "Ananya", "Diya", "Saanvi", "Myra"];
const lastNames = ["Sharma", "Verma", "Gupta", "Patel", "Kumar", "Singh", "Das", "Reddy", "Nair", "Menon", "Joshi", "Shah", "Mehta"];


const rawLeaderboard: Omit<LeaderboardEntry, 'rank' | 'ragStatus' | 'manages' | 'reportsTo' | 'projectCount' | 'rankChange'>[] = Array.from({ length: numEntries }, (_, i) => {
    const score = Math.floor(70 + Math.random() * 29); // Higher scores 70-99
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
        id: `emp${String(i + 1).padStart(3, '0')}`,
        name: `${firstName} ${lastName}`,
        city: cities[i % cities.length],
        score: score,
        role: getRandomRole(i),
        profilePic: `https://picsum.photos/100/100?random=${i + 1}`
    };
});

const oms = rawLeaderboard.filter(e => e.role === 'OM');
const tls = rawLeaderboard.filter(e => e.role === 'TL');
const spms = rawLeaderboard.filter(e => e.role === 'SPM');

const omIds = oms.map(om => om.id);
const tlIds = tls.map(tl => tl.id);

export const mockLeaderboard: LeaderboardEntry[] = rawLeaderboard.map((entry) => {
    let reportsTo: string | undefined = undefined;
    let manages: LeaderboardEntry['manages'] | undefined = undefined;
    let projectCount: number | undefined = undefined;
    const rankChange = Math.floor(Math.random() * 7) - 3; // -3 to +3

    if (entry.role === 'OM') {
        manages = {
            tls: tls.filter(tl => tl.city === entry.city && Math.random() > 0.3).map(tl => tl.id),
            spms: spms.filter(spm => spm.city === entry.city && Math.random() > 0.4).map(spm => spm.id)
        };
        projectCount = (manages.tls?.length ?? 0) * 5 + (manages.spms?.length ?? 0) * 2; // OM project count derived
    } else if (entry.role === 'TL') {
        reportsTo = assignManager(entry.role, omIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city), []);
        projectCount = Math.floor(5 + Math.random() * 6); // TLs manage 5-10 projects
    } else if (entry.role === 'SPM') {
        const cityTLs = tlIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city);
        reportsTo = assignManager(entry.role, [], cityTLs);
        projectCount = Math.floor(2 + Math.random() * 4); // SPMs manage 2-5 projects
    }

    return {
        ...entry,
        rank: 0,
        ragStatus: calculateRagCounts(entry.score, projectCount ?? 0),
        projectCount: projectCount,
        manages: manages,
        reportsTo: reportsTo,
        rankChange: rankChange,
    };
}).sort((a, b) => b.score - a.score)
  .map((entry, index) => ({ ...entry, rank: index + 1 }));


// --- Mock Historical Winners ---
const generateHistoricalWinnersForRole = (role: Role): HistoricalWinner[] => {
    const roleSpecificLeaderboard = mockLeaderboard.filter(p => p.role === role);
    if (roleSpecificLeaderboard.length === 0) return [];
    return Array.from({ length: 8 }, (_, i) => {
        const week = 30 - i; // Example week numbers
        const winnerIndex = Math.floor(Math.random() * roleSpecificLeaderboard.length);
        const winner = roleSpecificLeaderboard[winnerIndex];
        return {
            week: week,
            name: winner.name,
            city: winner.city,
            profilePic: winner.profilePic,
        };
    });
};

export const mockHistoricalWinners: HistoricalWinner[] = generateHistoricalWinnersForRole('SPM'); // Default for overall or specific role
export const mockHistoricalWinnersOM: HistoricalWinner[] = generateHistoricalWinnersForRole('OM');
export const mockHistoricalWinnersTL: HistoricalWinner[] = generateHistoricalWinnersForRole('TL');
export const mockHistoricalWinnersSPM: HistoricalWinner[] = generateHistoricalWinnersForRole('SPM');


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
    // const cityProjects = generateProjectsForCity(cityId, cityPersonnel); // Projects not directly used in CityViews page current structure

    const tlRag = calculateRoleRagSummary(cityPersonnel, 'TL');
    const spmRag = calculateRoleRagSummary(cityPersonnel, 'SPM');

    const tlProjects = calculateRoleProjectCount(cityPersonnel, 'TL');
    const spmProjects = calculateRoleProjectCount(cityPersonnel, 'SPM');

    acc[cityId] = {
        id: cityId,
        name: `City ${cityId.replace('_', ' ')}`,
        ragBreakdown: {
            tl: tlRag,
            spm: spmRag,
        },
        projectCounts: {
            tl: tlProjects,
            spm: spmProjects,
            total: tlProjects + spmProjects,
        },
        personnel: cityPersonnel,
    };
    return acc;
}, {} as Record<string, CityData>);


// --- Mock OM Trend Data ---
const generateWeeklyScore = (baseScore: number): number => {
    return Math.max(40, Math.min(99, baseScore + Math.floor(Math.random() * 21) - 10));
}

export const mockOMTrends: OMTrendData[] = oms.map(om => {
    const weeklyScores = Array.from({ length: 8 }, (_, i) => ({
        week: 30 - 7 + i,
        score: generateWeeklyScore(om.score),
    }));

    const subordinateRanks = Array.from({ length: 8 }, (_, i) => ({
        week: 30 - 7 + i,
        tlRank: Math.floor(Math.random() * 10) + 1,
        spmRank: Math.floor(Math.random() * 20) + 1,
    }));

    return {
        omId: om.id,
        omName: om.name,
        weeklyScores: weeklyScores,
        subordinateRanks: subordinateRanks,
    };
});

// --- Mock Reward Details ---
const getTopPerformerId = (role: Role): string | null => {
    const sortedByRole = mockLeaderboard.filter(p => p.role === role).sort((a,b) => b.score - a.score);
    return sortedByRole.length > 0 ? sortedByRole[0].id : null;
}

export const mockRewardDetails: RewardDetails = {
    awards: {
        employeeOfMonth: { // OM
            title: "Manager of the Month",
            awardeeId: getTopPerformerId('OM'),
        },
        cityChampion: { // TL
            title: "Lead Champion",
             awardeeId: getTopPerformerId('TL'),
        },
        innovationAward: { // SPM
            title: "Execution Excellence",
             awardeeId: getTopPerformerId('SPM'),
        },
    },
    incentives: {
        ops: [
            "Metric: Overall Team RAG Score Improvement",
            "Metric: Client Escalation Reduction",
            "Metric: Cross-functional Collaboration",
        ],
        vm: [
            "Metric A: Vendor Onboarding Time (&lt; 3 days)",
            "Metric B: Material Quality Score (&gt;98%)",
            "Metric C: Cost Savings Achieved (&gt;5%)",
        ],
    },
    programs: {
        quarterlyAwards: "Top performers in OM, TL, and SPM categories recognized quarterly.",
        annualConference: "Highest achievers across all roles invited to the annual leadership conference.",
    }
};

// --- Mock Recent Activity Data ---
const mockRecentActivities: RecentActivityItem[] = [
    {
        id: 'act1',
        type: 'milestone',
        description: '&lt;strong&gt;Manikandan&lt;/strong&gt; achieved Milestone 3 on CRN00123.',
        time: '2 hours ago',
        details: { text: '+6 Runs', type: 'positive' }
    },
    {
        id: 'act2',
        type: 'status_change',
        description: 'CRN00789 status changed to &lt;strong&gt;Red&lt;/strong&gt;.',
        time: '5 hours ago',
        details: { text: 'Runs', type: 'negative' }
    },
    {
        id: 'act3',
        type: 'assignment',
        description: '&lt;strong&gt;Sameer&lt;/strong&gt; assigned to new project CRN00567.',
        time: '1 day ago',
    },
    {
        id: 'act4',
        type: 'completion',
        description: '&lt;strong&gt;Sai Ram D&lt;/strong&gt; completed project CRN00098 ahead of schedule.',
        time: '2 days ago',
        details: { text: '+5 Runs', type: 'positive' }
    },
     {
        id: 'act5',
        type: 'general',
        description: 'New training module "Advanced Concrete Techniques" uploaded.',
        time: '3 days ago',
    },
];


// --- Mock Dashboard Stats Data (Updated for new Dashboard structure) ---
export const mockDashboardStats = (filters?: DashboardFilters): DashboardStatsData => {
  // Filters can be used here to modify the returned mockLeaderboard if any.
  let filteredLeaderboard = mockLeaderboard;
  if (filters?.city && filters.city !== "pan_india") {
    filteredLeaderboard = mockLeaderboard.filter(p => p.city === filters.city)
                             .sort((a,b) => b.score - a.score)
                             .map((e, i) => ({...e, rank: i + 1}));
  }

  // Logic for stat cards based on filters (role, week) can be added here.
  // For now, returning static values that match the image.
  const activeProjectsValue = filters?.role === 'OM' ? 300 : filters?.role === 'TL' ? 200 : 625;
  const greenProjectsValue = filters?.role === 'OM' ? 120 : filters?.role === 'TL' ? 80 : 248;
  const amberProjectsValue = filters?.role === 'OM' ? 70 : filters?.role === 'TL' ? 50 : 150;
  const redProjectsValue = filters?.role === 'OM' ? 110 : filters?.role === 'TL' ? 70 : 227;


  return {
    activeProjects: {
        title: "Active Projects",
        value: activeProjectsValue,
        trend: `+${Math.floor(activeProjectsValue * 0.02)} from last month`,
        trendDirection: 'up',
        icon: ListChecks,
        iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
        iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    greenProjects: {
        title: "Green Projects",
        value: greenProjectsValue,
        percentage: `${Math.round((greenProjectsValue / activeProjectsValue) * 100)}% of total`,
        trendDirection: 'neutral', // Or 'up' if there's a trend
        icon: CheckCircle2,
        iconBgColor: 'bg-green-100 dark:bg-green-900/50',
        iconTextColor: 'text-green-600 dark:text-green-400',
    },
    amberProjects: {
        title: "Amber Projects",
        value: amberProjectsValue,
        percentage: `${Math.round((amberProjectsValue / activeProjectsValue) * 100)}% of total`,
        trendDirection: 'neutral',
        icon: AlertTriangle,
        iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
        iconTextColor: 'text-yellow-600 dark:text-yellow-400',
    },
    redProjects: {
        title: "Red Projects",
        value: redProjectsValue,
        trend: `-${Math.floor(redProjectsValue * 0.01)} from last month`,
        trendDirection: 'down',
        percentage: `${Math.round((redProjectsValue / activeProjectsValue) * 100)}% of total`,
        icon: XCircle,
        iconBgColor: 'bg-red-100 dark:bg-red-900/50',
        iconTextColor: 'text-red-600 dark:text-red-400',
    },
    leaderboard: filteredLeaderboard,
    recentActivities: mockRecentActivities,
  };
};
