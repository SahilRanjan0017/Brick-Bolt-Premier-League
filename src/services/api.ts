// src/services/api.ts
import { supabase, getSupabaseInitializationError } from '@/lib/supabaseClient';
import type { 
    LeaderboardEntry, 
    HistoricalWinner, 
    CityData, 
    RewardDetails, 
    OMTrendData, 
    Role, 
    LeaderboardPageData, 
    CityViewsPageData, 
    DashboardStatsData, 
    DashboardFilters, 
    RAGCounts, 
    RecentActivityItem, 
    StatCardData,
    PerformanceDataEntry // New type
} from '@/types';
import { ListChecks, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'; // For StatCard icons & default AwardCard icons

// --- Helper Functions (moved or adapted from mockData) ---
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
        green = Math.max(1, baseGreen - Math.floor(remaining * 0.5)); // Ensure at least some green if possible
        red = Math.floor(remaining * 0.6);
        amber = projectCount - green - red;
    }
     green = Math.max(0, green);
     amber = Math.max(0, amber);
     red = Math.max(0, red);
     const total = green + amber + red;
     if (total !== projectCount) { // Adjust if sum doesn't match projectCount
        green += (projectCount - total); // Try to adjust green first
        if (green < 0) { // If green becomes negative, adjust amber
            amber += green;
            green = 0;
        }
        if(amber < 0) { // If amber becomes negative, adjust red
             red += amber;
             amber = 0;
        }
        red = Math.max(0, red); // Ensure red is not negative
     }
    return { green, amber, red };
};

const getDefaultStatCard = (title: string, icon: React.ElementType): StatCardData => ({
    title,
    value: 0,
    trend: "N/A",
    trendDirection: "neutral",
    percentage: "0%",
    icon,
    iconBgColor: 'bg-muted',
    iconTextColor: 'text-muted-foreground',
});


// --- Supabase API Calls ---

export const getFullLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getFullLeaderboard.`);
        return [];
    }
    console.log(`API: Fetching full leaderboard data from Supabase...`);
    const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('score', { ascending: false });

    if (error) {
        console.error("Supabase error fetching full leaderboard:", error);
        throw new Error(`Failed to fetch full leaderboard data: ${error.message}`);
    }

    const processedData = data.map((entry, index) => ({
        ...entry,
        id: String(entry.id), // Ensure id is string
        rank: index + 1,
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined || entry.rank_change === null ? Math.floor(Math.random() * 7) - 3 : entry.rank_change,
    }));
    console.log("API: Full leaderboard data fetched and processed successfully.");
    return processedData;
};


export const getLeaderboardByRole = async (role: Role, limit?: number): Promise<LeaderboardEntry[]> => {
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getLeaderboardByRole (${role}).`);
        return [];
    }
    console.log(`API: Fetching leaderboard data for role: ${role} ${limit ? `(limit: ${limit})` : ''} from Supabase...`);
    let query = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('role', role)
        .order('score', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Supabase error fetching leaderboard for role ${role}:`, error);
        throw new Error(`Failed to fetch leaderboard data for role ${role}: ${error.message}`);
    }
    
    const processedData = data.map((entry, index) => ({
        ...entry,
        id: String(entry.id),
        rank: index + 1,
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined || entry.rank_change === null ? Math.floor(Math.random() * 7) - 3 : entry.rank_change,
    }));
    console.log(`API: Leaderboard data for ${role} fetched and processed successfully.`);
    return processedData;
};


export const getOMTrendData = async (): Promise<OMTrendData[]> => {
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getOMTrendData.`);
        return [];
    }
    console.log(`API: Fetching 8-week trend data for OMs from Supabase...`);
    const { data, error } = await supabase
        .from('om_trends')
        .select('om_id, om_name, weekly_scores, subordinate_ranks');

    if (error) {
        console.error("Supabase error fetching OM trend data:", error);
        throw new Error(`Failed to fetch OM trend data: ${error.message}`);
    }
    console.log("API: OM trend data fetched successfully.");
    return data.map(item => ({
        omId: String(item.om_id),
        omName: item.om_name,
        weeklyScores: Array.isArray(item.weekly_scores) ? item.weekly_scores : [], 
        subordinateRanks: Array.isArray(item.subordinate_ranks) ? item.subordinate_ranks : [], 
    }));
};

export const getHistoricalWinners = async (role?: Role): Promise<HistoricalWinner[]> => {
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getHistoricalWinners.`);
        return [];
    }
    console.log(`API: Fetching historical winners ${role ? `for ${role}` : 'overall'} from Supabase...`);
    let query = supabase.from('historical_winners').select('*'); 

    if (role) {
        query = query.eq('role', role);
    }
    query = query.order('week', { ascending: false }).limit(8);

    const { data, error } = await query;

    if (error) {
        console.error("Supabase error fetching historical winners:", error);
        throw new Error(`Failed to fetch historical winners: ${error.message}`);
    }
     console.log("API: Historical winners fetched successfully.");
    return data.map(winner => ({
        week: winner.week,
        name: winner.name,
        city: winner.city,
        profilePic: winner.profile_pic || `https://picsum.photos/100/100?random=hist${winner.id}`
    }));
};


export const getCityViewsPageData = async (): Promise<CityViewsPageData> => {
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getCityViewsPageData.`);
        return {};
    }
    console.log("API: Fetching consolidated City Views Page data from Supabase...");
    const { data: allPersonnel, error: personnelError } = await supabase
        .from('leaderboard_entries')
        .select('*');

    if (personnelError) {
        console.error("Supabase error fetching personnel for city views:", personnelError);
        throw new Error(`Failed to fetch personnel for city views: ${personnelError.message}`);
    }

    const cities = [...new Set(allPersonnel.map(p => p.city))];
    const cityViewsData: CityViewsPageData = {};

    for (const cityId of cities) {
        if (!cityId) continue; 
        const cityPersonnel = allPersonnel.filter(p => p.city === cityId).map(entry => ({
            ...entry,
            id: String(entry.id),
            ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
            profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        }));

        const tlRag = cityPersonnel
            .filter(p => p.role === 'TL')
            .reduce((acc, p) => {
                const rag = p.ragStatus || calculateRagCounts(p.score, p.project_count || 0);
                acc.green += rag.green;
                acc.amber += rag.amber;
                acc.red += rag.red;
                return acc;
            }, { green: 0, amber: 0, red: 0 });

        const spmRag = cityPersonnel
            .filter(p => p.role === 'SPM')
            .reduce((acc, p) => {
                const rag = p.ragStatus || calculateRagCounts(p.score, p.project_count || 0);
                acc.green += rag.green;
                acc.amber += rag.amber;
                acc.red += rag.red;
                return acc;
            }, { green: 0, amber: 0, red: 0 });

        const tlProjects = cityPersonnel
            .filter(p => p.role === 'TL')
            .reduce((sum, p) => sum + (p.project_count || 0), 0);
        const spmProjects = cityPersonnel
            .filter(p => p.role === 'SPM')
            .reduce((sum, p) => sum + (p.project_count || 0), 0);

        cityViewsData[cityId] = {
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
    }
    console.log("API: Consolidated City Views Page data fetched and processed successfully.");
    return cityViewsData;
};


export const getRewardDetails = async (): Promise<RewardDetails> => {
    const defaultRewardDetails: RewardDetails = {
        awards: {
            employeeOfMonth: { title: "Manager of the Month", awardeeId: null },
            cityChampion: { title: "Lead Champion", awardeeId: null },
            innovationAward: { title: "Execution Excellence", awardeeId: null },
        },
        incentives: {
            ops: ["Ops incentive details unavailable due to configuration issue."],
            vm: ["VM incentive details unavailable due to configuration issue."],
        },
        programs: {
            quarterlyAwards: "Quarterly awards details unavailable.",
            annualConference: "Annual conference details unavailable.",
        }
    };
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning default data for getRewardDetails.`);
        return defaultRewardDetails;
    }
    console.log("API: Fetching reward details from Supabase...");
    
    const { data, error } = await supabase
        .from('reward_configurations')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error("Supabase error fetching reward details:", error);
        return { ...defaultRewardDetails, programs: {...defaultRewardDetails.programs, quarterlyAwards: `Error fetching: ${error.message}` }};
    }

    if (!data) {
        console.warn("API: No reward configuration found in Supabase. Returning default data.");
        return defaultRewardDetails;
    }
    
    const rewardDetails: RewardDetails = {
      awards: {
          employeeOfMonth: { title: data.awards_config?.employeeOfMonth?.title || "Manager of the Month", awardeeId: data.awards_config?.employeeOfMonth?.awardeeId || null },
          cityChampion: { title: data.awards_config?.cityChampion?.title || "Lead Champion", awardeeId: data.awards_config?.cityChampion?.awardeeId || null },
          innovationAward: { title: data.awards_config?.innovationAward?.title || "Execution Excellence", awardeeId: data.awards_config?.innovationAward?.awardeeId || null },
      },
      incentives: {
          ops: Array.isArray(data.incentives_ops_metrics) ? data.incentives_ops_metrics : defaultRewardDetails.incentives.ops,
          vm: Array.isArray(data.incentives_vm_metrics) ? data.incentives_vm_metrics : defaultRewardDetails.incentives.vm,
      },
      programs: {
          quarterlyAwards: data.programs_config?.quarterlyAwards || defaultRewardDetails.programs.quarterlyAwards,
          annualConference: data.programs_config?.annualConference || defaultRewardDetails.programs.annualConference,
      }
    };
    
    if (rewardDetails.awards.employeeOfMonth.awardeeId === null || rewardDetails.awards.cityChampion.awardeeId === null || rewardDetails.awards.innovationAward.awardeeId === null) {
        try {
            const leaderboard = await getFullLeaderboard(); 
            const getTopPerformerId = (roleToFilter: Role): string | null => {
              const sortedByRole = leaderboard.filter(p => p.role === roleToFilter).sort((a,b) => b.score - a.score);
              return sortedByRole.length > 0 ? sortedByRole[0].id : null;
            };
            if(rewardDetails.awards.employeeOfMonth.awardeeId === null) rewardDetails.awards.employeeOfMonth.awardeeId = getTopPerformerId('OM');
            if(rewardDetails.awards.cityChampion.awardeeId === null) rewardDetails.awards.cityChampion.awardeeId = getTopPerformerId('TL');
            if(rewardDetails.awards.innovationAward.awardeeId === null) rewardDetails.awards.innovationAward.awardeeId = getTopPerformerId('SPM');
        } catch (e) {
            console.warn("API: Could not fetch leaderboard to populate awardee IDs for rewards.", e);
        }
    }

    console.log("API: Reward details fetched successfully.");
    return rewardDetails;
};


export const getLeaderboardPageData = async (): Promise<LeaderboardPageData> => {
    const defaultData: LeaderboardPageData = {
        topPerformers: { om: [], tl: [], spm: [] },
        omTrends: [],
        fullLeaderboard: [],
        historicalWinnersOM: [],
        historicalWinnersTL: [],
        historicalWinnersSPM: [],
        historicalWinners: [], // Keep this for backward compatibility if used elsewhere
        dashboardStats: {
            activeProjects: getDefaultStatCard("Active Projects", ListChecks),
            greenProjects: getDefaultStatCard("Green Projects", CheckCircle2),
            amberProjects: getDefaultStatCard("Amber Projects", AlertTriangle),
            redProjects: getDefaultStatCard("Red Projects", XCircle),
            leaderboard: [],
            recentActivities: [],
        },
    };
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning default data for getLeaderboardPageData.`);
        return defaultData;
    }

    console.log("API: Fetching consolidated Leaderboard Page data from Supabase...");
    try {
        const [topOMs, topTLs, topSPMs, omTrendsData, fullLeaderboardData, histWinnersOM, histWinnersTL, histWinnersSPM, dashboardStatsResult] = await Promise.all([
            getLeaderboardByRole('OM', 3),
            getLeaderboardByRole('TL', 3),
            getLeaderboardByRole('SPM', 3),
            getOMTrendData(),
            getFullLeaderboard(),
            getHistoricalWinners('OM'),
            getHistoricalWinners('TL'),
            getHistoricalWinners('SPM'),
            getDashboardStats({ role: 'All Roles', week: 'This Week' })
        ]);

        console.log("API: Consolidated Leaderboard Page data fetched successfully.");
        return {
            topPerformers: {
                om: topOMs,
                tl: topTLs,
                spm: topSPMs,
            },
            omTrends: omTrendsData,
            fullLeaderboard: fullLeaderboardData,
            historicalWinnersOM: histWinnersOM,
            historicalWinnersTL: histWinnersTL,
            historicalWinnersSPM: histWinnersSPM,
            historicalWinners: [...histWinnersOM, ...histWinnersTL, ...histWinnersSPM].sort((a,b) => b.week - a.week).slice(0,8), // Aggregate for general historical
            dashboardStats: dashboardStatsResult,
        };
    } catch (error) {
        console.error("API Error: Failed to fetch consolidated leaderboard data.", error);
        if (error instanceof Error) {
             throw new Error(`Failed to fetch leaderboard page data: ${error.message}`);
        }
        throw new Error("Failed to fetch leaderboard page data due to an unknown error.");
    }
};


export const getDashboardStats = async (filters?: DashboardFilters): Promise<DashboardStatsData> => {
    const defaultStats: DashboardStatsData = {
        activeProjects: getDefaultStatCard("Active Projects", ListChecks),
        greenProjects: getDefaultStatCard("Green Projects", CheckCircle2),
        amberProjects: getDefaultStatCard("Amber Projects", AlertTriangle),
        redProjects: getDefaultStatCard("Red Projects", XCircle),
        leaderboard: [],
        recentActivities: [],
    };
    const initializationError = getSupabaseInitializationError();
    if (!supabase || initializationError) {
        console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning default data for getDashboardStats.`);
        return defaultStats;
    }

    console.log(`API: Fetching dashboard stats with filters: ${JSON.stringify(filters)} from Supabase...`);

    let leaderboardQuery = supabase
        .from('leaderboard_entries')
        .select('*')
        .order('score', { ascending: false });

    if (filters?.city && filters.city !== "pan_india") {
        leaderboardQuery = leaderboardQuery.eq('city', filters.city);
    }
    
    const { data: leaderboardData, error: leaderboardError } = await leaderboardQuery;

    if (leaderboardError) {
        console.error("Supabase error fetching leaderboard for dashboard:", leaderboardError);
        return { ...defaultStats, leaderboard: [], recentActivities: defaultStats.recentActivities }; 
    }

    const processedLeaderboard = leaderboardData.map((entry, index) => ({
        ...entry,
        id: String(entry.id),
        rank: index + 1,
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined || entry.rank_change === null ? Math.floor(Math.random() * 7) - 3 : entry.rank_change,
    }));

    const { data: recentActivitiesData, error: activitiesError } = await supabase
        .from('recent_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (activitiesError) {
        console.error("Supabase error fetching recent activities:", activitiesError);
         return { ...defaultStats, leaderboard: processedLeaderboard, recentActivities: [] };
    }
    
    const recentActivities: RecentActivityItem[] = recentActivitiesData.map(act => ({
        id: String(act.id),
        type: act.type,
        description: act.description,
        time: act.time_description || new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: act.details_json as any, // Cast as any if JSON structure is complex
    }));

    let totalActiveProjects = 0;
    let totalGreenProjects = 0;
    let totalAmberProjects = 0;
    let totalRedProjects = 0;
    
    let relevantPersonnel = processedLeaderboard;
    if (filters?.role && filters.role !== 'All Roles') {
        relevantPersonnel = processedLeaderboard.filter(p => p.role === filters.role);
    }

    relevantPersonnel.forEach(p => {
        totalActiveProjects += p.project_count || 0;
        const rag = p.ragStatus || calculateRagCounts(p.score, p.project_count || 0);
        totalGreenProjects += rag.green;
        totalAmberProjects += rag.amber;
        totalRedProjects += rag.red;
    });
    
    totalActiveProjects = Math.max(0, totalActiveProjects);
    totalGreenProjects = Math.max(0, totalGreenProjects);
    totalAmberProjects = Math.max(0, totalAmberProjects);
    totalRedProjects = Math.max(0, totalRedProjects);

    if ((totalGreenProjects + totalAmberProjects + totalRedProjects) > totalActiveProjects && totalActiveProjects > 0) {
        const sumRag = totalGreenProjects + totalAmberProjects + totalRedProjects;
        totalGreenProjects = Math.floor(totalGreenProjects * totalActiveProjects / sumRag);
        totalAmberProjects = Math.floor(totalAmberProjects * totalActiveProjects / sumRag);
        totalRedProjects = totalActiveProjects - totalGreenProjects - totalAmberProjects;
         totalRedProjects = Math.max(0, totalRedProjects); 
    } else if (totalActiveProjects === 0) {
        totalGreenProjects = 0;
        totalAmberProjects = 0;
        totalRedProjects = 0;
    }

    const dashboardStats: DashboardStatsData = {
        activeProjects: {
            title: "Active Projects",
            value: totalActiveProjects,
            trend: `+${Math.floor(totalActiveProjects * 0.02)} from last month`,
            trendDirection: 'up',
            icon: ListChecks,
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
            iconTextColor: 'text-blue-600 dark:text-blue-400',
        },
        greenProjects: {
            title: "Green Projects",
            value: totalGreenProjects,
            percentage: totalActiveProjects > 0 ? `${Math.round((totalGreenProjects / totalActiveProjects) * 100)}%` : '0%',
            trendDirection: 'neutral',
            icon: CheckCircle2,
            iconBgColor: 'bg-green-100 dark:bg-green-900/50',
            iconTextColor: 'text-green-600 dark:text-green-400',
        },
        amberProjects: {
            title: "Amber Projects",
            value: totalAmberProjects,
            percentage: totalActiveProjects > 0 ? `${Math.round((totalAmberProjects / totalActiveProjects) * 100)}%` : '0%',
            trendDirection: 'neutral',
            icon: AlertTriangle,
            iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
            iconTextColor: 'text-yellow-600 dark:text-yellow-400',
        },
        redProjects: {
            title: "Red Projects",
            value: totalRedProjects,
            trend: totalRedProjects > 0 ? `-${Math.floor(totalRedProjects * 0.01)} from last month` : undefined,
            trendDirection: totalRedProjects > 0 && Math.floor(totalRedProjects * 0.01) > 0 ? 'down' : 'neutral',
            percentage: totalActiveProjects > 0 ? `${Math.round((totalRedProjects / totalActiveProjects) * 100)}%` : '0%',
            icon: XCircle,
            iconBgColor: 'bg-red-100 dark:bg-red-900/50',
            iconTextColor: 'text-red-600 dark:text-red-400',
        },
        leaderboard: processedLeaderboard,
        recentActivities: recentActivities,
    };

    console.log("API: Dashboard stats fetched and processed successfully.");
    return dashboardStats;
};

// New function to fetch performance_data
export interface PerformanceDataFilters {
  record_date?: string; // YYYY-MM-DD
  city?: string;
  rag_profile?: string;
}

export const getPerformanceData = async (filters: PerformanceDataFilters): Promise<PerformanceDataEntry[]> => {
  const initializationError = getSupabaseInitializationError();
  if (!supabase || initializationError) {
    console.warn(`API: Supabase client not initialized. ${initializationError || ''} Returning empty data for getPerformanceData.`);
    return [];
  }
  
  console.log(`API: Fetching performance data with filters: ${JSON.stringify(filters)} from Supabase...`);
  let query = supabase.from('performance_data').select('*');

  if (filters.record_date) {
    query = query.eq('record_date', filters.record_date);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.rag_profile) {
    query = query.eq('rag_profile', filters.rag_profile);
  }

  query = query.order('record_date', { ascending: false })
               .order('city', { ascending: true })
               .order('tl_name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error fetching performance data:", error);
    throw new Error(`Failed to fetch performance data: ${error.message}`);
  }
  
  console.log(`API: Performance data fetched successfully. Count: ${data?.length}`);
  return data as PerformanceDataEntry[];
};