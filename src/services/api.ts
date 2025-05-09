// src/services/api.ts
import { supabase } from '@/lib/supabaseClient';
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, OMTrendData, Role, LeaderboardPageData, CityViewsPageData, DashboardStatsData, DashboardFilters, RAGCounts, RecentActivityItem, StatCardData } from '@/types';
import { ListChecks, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'; // For StatCard icons

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

// --- Supabase API Calls ---

/**
 * Fetches the complete leaderboard data from Supabase.
 * Assumes a table 'leaderboard_entries' with columns matching LeaderboardEntry.
 * RAG status and rank might need to be calculated/joined if not directly in the table.
 */
export const getFullLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    console.log(`API: Fetching full leaderboard data from Supabase...`);
    const { data, error } = await supabase
        .from('leaderboard_entries') // ADJUST TABLE NAME
        .select('*')
        .order('score', { ascending: false });

    if (error) {
        console.error("Supabase error fetching full leaderboard:", error);
        throw new Error("Failed to fetch full leaderboard data");
    }

    const processedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0), // Assuming project_count column
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined ? Math.floor(Math.random() * 7) - 3 : entry.rank_change, // Mock rankChange if not in DB
    }));
    console.log("API: Full leaderboard data fetched and processed successfully.");
    return processedData;
};


export const getLeaderboardByRole = async (role: Role, limit?: number): Promise<LeaderboardEntry[]> => {
    console.log(`API: Fetching leaderboard data for role: ${role} ${limit ? `(limit: ${limit})` : ''} from Supabase...`);
    let query = supabase
        .from('leaderboard_entries') // ADJUST TABLE NAME
        .select('*')
        .eq('role', role)
        .order('score', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Supabase error fetching leaderboard for role ${role}:`, error);
        throw new Error(`Failed to fetch leaderboard data for role ${role}`);
    }
    
    const processedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1, // Rank within this subset
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined ? Math.floor(Math.random() * 7) - 3 : entry.rank_change,
    }));
    console.log(`API: Leaderboard data for ${role} fetched and processed successfully.`);
    return processedData;
};


export const getOMTrendData = async (): Promise<OMTrendData[]> => {
    console.log(`API: Fetching 8-week trend data for OMs from Supabase...`);
    // Assumes an 'om_trends' table with om_id, om_name, and weekly_scores (JSONB array), subordinate_ranks (JSONB array)
    const { data, error } = await supabase
        .from('om_trends') // ADJUST TABLE NAME
        .select('om_id, om_name, weekly_scores, subordinate_ranks');

    if (error) {
        console.error("Supabase error fetching OM trend data:", error);
        throw new Error("Failed to fetch OM trend data");
    }
    console.log("API: OM trend data fetched successfully.");
    return data.map(item => ({
        omId: item.om_id,
        omName: item.om_name,
        weeklyScores: item.weekly_scores,
        subordinateRanks: item.subordinate_ranks,
    }));
};

export const getHistoricalWinners = async (role?: Role): Promise<HistoricalWinner[]> => {
    console.log(`API: Fetching historical winners ${role ? `for ${role}` : 'overall'} from Supabase...`);
    // Assumes a 'historical_winners' table with role, week, name, city, profile_pic columns
    let query = supabase.from('historical_winners').select('*'); // ADJUST TABLE NAME

    if (role) {
        query = query.eq('role', role);
    }
    query = query.order('week', { ascending: false }).limit(8); // Get last 8 weeks for the role

    const { data, error } = await query;

    if (error) {
        console.error("Supabase error fetching historical winners:", error);
        throw new Error("Failed to fetch historical winners");
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
    console.log("API: Fetching consolidated City Views Page data from Supabase...");
    // This is more complex. It might involve fetching all relevant leaderboard entries
    // and then processing them in code, or using a Supabase Edge Function / View.
    // For simplicity, let's assume we fetch all leaderboard entries and process.

    const { data: allPersonnel, error: personnelError } = await supabase
        .from('leaderboard_entries') // ADJUST TABLE NAME
        .select('*');

    if (personnelError) {
        console.error("Supabase error fetching personnel for city views:", personnelError);
        throw new Error("Failed to fetch personnel for city views");
    }

    const cities = [...new Set(allPersonnel.map(p => p.city))]; // Get unique cities
    const cityViewsData: CityViewsPageData = {};

    for (const cityId of cities) {
        const cityPersonnel = allPersonnel.filter(p => p.city === cityId).map(entry => ({
            ...entry,
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
            name: `City ${cityId.replace('_', ' ')}`, // Or fetch city name from a 'cities' table
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
    console.log("API: Fetching reward details from Supabase...");
    // Assumes a 'reward_configurations' table, possibly with a single row or specific keys.
    // Example: one row with columns like 'awards_config' (JSONB), 'incentives_ops' (array), 'programs_config' (JSONB)
    const { data, error } = await supabase
        .from('reward_configurations') // ADJUST TABLE NAME
        .select('*')
        .limit(1) // Assuming one config row
        .single(); // Expect a single row

    if (error) {
        console.error("Supabase error fetching reward details:", error);
        throw new Error("Failed to fetch reward details");
    }

    if (!data) {
        throw new Error("No reward configuration found in Supabase.");
    }
    
    // Adapt this based on your actual table structure
    const rewardDetails: RewardDetails = {
        awards: data.awards_config || { // Assuming awards_config is a JSONB column
            employeeOfMonth: { title: "Manager of the Month", awardeeId: null },
            cityChampion: { title: "Lead Champion", awardeeId: null },
            innovationAward: { title: "Execution Excellence", awardeeId: null },
        },
        incentives: {
            ops: data.incentives_ops_metrics || [], // Assuming an array column
            vm: data.incentives_vm_metrics || [],   // Assuming an array column
        },
        programs: data.programs_config || { // Assuming programs_config is a JSONB column
            quarterlyAwards: "Details unavailable.",
            annualConference: "Details unavailable.",
        }
    };

    // You might need to fetch top performers separately to populate awardeeId if not stored directly
    // For simplicity, current mock data logic for awardeeId uses local leaderboard data.
    // This part may need adjustment depending on how you store/determine awardees.
    // Example: fetch top OM/TL/SPM if needed for awardeeId
    const [leaderboard] = await Promise.all([getFullLeaderboard()]); // Fetch once if needed across details

    const getTopPerformerId = (role: Role): string | null => {
      const sortedByRole = leaderboard.filter(p => p.role === role).sort((a,b) => b.score - a.score);
      return sortedByRole.length > 0 ? sortedByRole[0].id : null;
    }

    rewardDetails.awards.employeeOfMonth.awardeeId = data.awards_config?.employeeOfMonth?.awardeeId ?? getTopPerformerId('OM');
    rewardDetails.awards.cityChampion.awardeeId = data.awards_config?.cityChampion?.awardeeId ?? getTopPerformerId('TL');
    rewardDetails.awards.innovationAward.awardeeId = data.awards_config?.innovationAward?.awardeeId ?? getTopPerformerId('SPM');


    console.log("API: Reward details fetched successfully.");
    return rewardDetails;
};


export const getLeaderboardPageData = async (): Promise<LeaderboardPageData> => {
    console.log("API: Fetching consolidated Leaderboard Page data from Supabase...");
    try {
        const [topOMs, topTLs, topSPMs, omTrendsData, fullLeaderboardData, histWinnersOM, histWinnersTL, histWinnersSPM, dashboardStatsData] = await Promise.all([
            getLeaderboardByRole('OM', 3),
            getLeaderboardByRole('TL', 3),
            getLeaderboardByRole('SPM', 3),
            getOMTrendData(),
            getFullLeaderboard(),
            getHistoricalWinners('OM'),
            getHistoricalWinners('TL'),
            getHistoricalWinners('SPM'),
            getDashboardStats({ role: 'All Roles', week: 'This Week' }) // Default filters for scoreboard on leaderboard
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
            historicalWinnersOM: histWinnersOM, // Use specific role winners
            historicalWinnersTL: histWinnersTL,
            historicalWinnersSPM: histWinnersSPM,
            dashboardStats: dashboardStatsData,
        };
    } catch (error) {
        console.error("API Error: Failed to fetch consolidated leaderboard data.", error);
        // To provide more specific error, check error type if possible
        if (error instanceof Error) {
             throw new Error(`Failed to fetch leaderboard page data: ${error.message}`);
        }
        throw new Error("Failed to fetch leaderboard page data due to an unknown error.");
    }
};


export const getDashboardStats = async (filters?: DashboardFilters): Promise<DashboardStatsData> => {
    console.log(`API: Fetching dashboard stats with filters: ${JSON.stringify(filters)} from Supabase...`);

    // Fetch leaderboard data (can be filtered by city)
    let leaderboardQuery = supabase
        .from('leaderboard_entries') // ADJUST TABLE NAME
        .select('*')
        .order('score', { ascending: false });

    if (filters?.city && filters.city !== "pan_india") {
        leaderboardQuery = leaderboardQuery.eq('city', filters.city);
    }
    
    const { data: leaderboardData, error: leaderboardError } = await leaderboardQuery;

    if (leaderboardError) {
        console.error("Supabase error fetching leaderboard for dashboard:", leaderboardError);
        throw new Error("Failed to fetch leaderboard data for dashboard");
    }

    const processedLeaderboard = leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        ragStatus: calculateRagCounts(entry.score, entry.project_count || 0),
        profilePic: entry.profile_pic || `https://picsum.photos/100/100?random=${entry.id}`,
        rankChange: entry.rank_change === undefined ? Math.floor(Math.random() * 7) - 3 : entry.rank_change,
    }));


    // Fetch recent activities
    const { data: recentActivitiesData, error: activitiesError } = await supabase
        .from('recent_activities') // ADJUST TABLE NAME
        .select('*')
        .order('created_at', { ascending: false }) // Assuming a 'created_at' timestamp
        .limit(5);

    if (activitiesError) {
        console.error("Supabase error fetching recent activities:", activitiesError);
        throw new Error("Failed to fetch recent activities");
    }
    
    const recentActivities: RecentActivityItem[] = recentActivitiesData.map(act => ({
        id: act.id,
        type: act.type,
        description: act.description,
        time: act.time_description || new Date(act.created_at).toLocaleTimeString(), // Use time_description or format created_at
        details: act.details_json, // Assuming details are stored as JSONB
    }));


    // Calculate StatCardData (this is a simplification, real data might come from aggregated project stats)
    // This part heavily relies on how you store project data and RAG statuses in Supabase.
    // For now, we'll derive some stats from the fetched leaderboard or use placeholders.
    // You'll need a 'projects' table or similar to get accurate counts.
    
    // Placeholder counts if 'projects' table isn't queried
    let totalActiveProjects = 0;
    let totalGreenProjects = 0;
    let totalAmberProjects = 0;
    let totalRedProjects = 0;

    // If you have a 'projects' table:
    // const { data: projectsData, error: projectsError } = await supabase.from('projects').select('status, city, role_managed_by');
    // Then aggregate counts based on projectsData and filters.
    
    // For now, let's derive from leaderboard project counts as a rough estimate:
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
    
    // Adjust if counts go negative or don't sum up, though calculateRagCounts should handle this for individuals
    totalActiveProjects = Math.max(0, totalActiveProjects);
    totalGreenProjects = Math.max(0, totalGreenProjects);
    totalAmberProjects = Math.max(0, totalAmberProjects);
    totalRedProjects = Math.max(0, totalRedProjects);

    // Ensure breakdown doesn't exceed total if derived this way
    if ((totalGreenProjects + totalAmberProjects + totalRedProjects) > totalActiveProjects && totalActiveProjects > 0) {
        const sumRag = totalGreenProjects + totalAmberProjects + totalRedProjects;
        totalGreenProjects = Math.floor(totalGreenProjects * totalActiveProjects / sumRag);
        totalAmberProjects = Math.floor(totalAmberProjects * totalActiveProjects / sumRag);
        totalRedProjects = totalActiveProjects - totalGreenProjects - totalAmberProjects;
    } else if (totalActiveProjects === 0) {
        totalGreenProjects = 0;
        totalAmberProjects = 0;
        totalRedProjects = 0;
    }


    const dashboardStats: DashboardStatsData = {
        activeProjects: {
            title: "Active Projects",
            value: totalActiveProjects,
            trend: `+${Math.floor(totalActiveProjects * 0.02)} from last month`, // Example trend
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
            trend: `-${Math.floor(totalRedProjects * 0.01)} from last month`, // Example trend
            trendDirection: 'down',
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
