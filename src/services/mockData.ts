// src/services/mockData.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, Project, OMTrendData, RAGCounts, Role, DashboardStatsData, DashboardFilters, StatCardData } from '@/types';

// --- Helper Functions ---

const calculateRagCounts = (score: number, projectCount: number = 10): RAGCounts => {
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
const rawLeaderboard: Omit<LeaderboardEntry, 'rank' | 'ragStatus' | 'manages' | 'reportsTo' | 'projectCount' | 'rankChange'>[] = Array.from({ length: numEntries }, (_, i) => {
    const score = Math.floor(50 + Math.random() * 49); 
    return {
        id: `emp${String(i + 1).padStart(3, '0')}`,
        name: `Employee ${String(i + 1).padStart(3, '0')}`,
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
    const rankChange = Math.floor(Math.random() * 5) - 2; // -2 to +2

    if (entry.role === 'OM') {
        manages = {
            tls: tls.filter(tl => tl.city === entry.city && Math.random() > 0.3).map(tl => tl.id), 
            spms: spms.filter(spm => spm.city === entry.city && Math.random() > 0.4).map(spm => spm.id) 
        };
    } else if (entry.role === 'TL') {
        reportsTo = assignManager(entry.role, omIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city), []); 
        projectCount = Math.floor(8 + Math.random() * 8); 
    } else if (entry.role === 'SPM') {
        const cityTLs = tlIds.filter(id => rawLeaderboard.find(e=>e.id === id)?.city === entry.city);
        reportsTo = assignManager(entry.role, [], cityTLs); 
        projectCount = Math.floor(3 + Math.random() * 5); 
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
    const cityProjects = generateProjectsForCity(cityId, cityPersonnel); 

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
        employeeOfMonth: {
            title: "Manager of the Month (OM)",
            awardeeId: getTopPerformerId('OM'),
        },
        cityChampion: {
            title: "Lead Champion (TL)",
             awardeeId: getTopPerformerId('TL'),
        },
        innovationAward: {
            title: "Execution Excellence (SPM)",
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

// --- Mock Dashboard Stats Data ---
export const mockDashboardStats = (filters?: DashboardFilters): DashboardStatsData => {
  // Simple mock data generation, can be made more complex based on filters
  const active = 600 + Math.floor(Math.random() * 51) - 25; // e.g. 625
  const green = Math.floor(active * (0.35 + Math.random() * 0.1)); // e.g. 248
  const amber = Math.floor(active * (0.20 + Math.random() * 0.1)); // e.g. 150
  const red = active - green - amber; // e.g. 227

  const trendActive = Math.floor(Math.random() * 21) - 10;
  const trendRed = Math.floor(Math.random() * 9) - 4;


  return {
    activeProjects: {
      value: active,
      trend: `${trendActive >= 0 ? '+' : ''}${trendActive} from last month`,
      trendDirection: trendActive >=0 ? (trendActive === 0 ? 'neutral' : 'up') : 'down',
    },
    greenProjects: {
      value: green,
      percentage: `${Math.round((green/active)*100)}% of total`,
    },
    amberProjects: {
      value: amber,
      percentage: `${Math.round((amber/active)*100)}% of total`,
    },
    redProjects: {
      value: red,
      trend: `${trendRed >= 0 ? '+' : ''}${trendRed} from last month`,
      trendDirection: trendRed >=0 ? (trendRed === 0 ? 'neutral' : 'up') : 'down',
    },
  };
};