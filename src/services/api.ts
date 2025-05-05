// src/services/api.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails, OMTrendData, Role, LeaderboardPageData, CityViewsPageData } from '@/types';
import { mockLeaderboard, mockHistoricalWinners, mockCityDetails, mockRewardDetails, mockOMTrends } from './mockData';

/**
 * Simulates network delay.
 * @param ms - Milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches the complete leaderboard data, already ranked in mockData.
 * @returns A promise resolving to an array of LeaderboardEntry.
 */
export const getFullLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    console.log(`API: Fetching full leaderboard data...`);
    await delay(500);
    console.log("API: Full leaderboard data fetched successfully.");
    return mockLeaderboard; // Already sorted and ranked in mockData
};


/**
 * Fetches leaderboard data filtered by role and optionally limited.
 * @param role - The role to filter by ('OM', 'TL', 'SPM').
 * @param limit - Optional limit for the number of entries.
 * @returns A promise resolving to an array of LeaderboardEntry for that role.
 */
export const getLeaderboardByRole = async (role: Role, limit?: number): Promise<LeaderboardEntry[]> => {
    console.log(`API: Fetching leaderboard data for role: ${role} ${limit ? `(limit: ${limit})` : ''}...`);
    await delay(600);

    const filteredData = mockLeaderboard.filter(entry => entry.role === role);

    // Re-rank within the role
    const rankedData = filteredData
        .sort((a, b) => b.score - a.score) // Sort by score within the role
        .map((entry, index) => ({
            ...entry,
            rank: index + 1, // Rank specific to this role list
            // Keep original overall rank if needed, or remove if confusing
        }));

     console.log(`API: Leaderboard data for ${role} fetched successfully.`);
    return limit ? rankedData.slice(0, limit) : rankedData;
};


/**
 * Fetches 8-week trend data for all Operations Managers (OMs).
 * @returns A promise resolving to an array of OMTrendData.
 */
export const getOMTrendData = async (): Promise<OMTrendData[]> => {
    console.log(`API: Fetching 8-week trend data for OMs...`);
    await delay(900); // Simulate a potentially more complex query
    console.log("API: OM trend data fetched successfully.");
    return mockOMTrends;
}


/**
 * Fetches historical weekly winners data.
 * @returns A promise resolving to an array of HistoricalWinner.
 */
export const getHistoricalWinners = async (): Promise<HistoricalWinner[]> => {
  console.log("API: Fetching historical winners...");
  await delay(400);
   console.log("API: Historical winners fetched successfully.");
  return mockHistoricalWinners;
};

/**
 * Fetches detailed data for all cities.
 * @returns A promise resolving to CityViewsPageData.
 */
export const getAllCityData = async (): Promise<CityViewsPageData> => {
  console.log(`API: Fetching data for all cities...`);
  await delay(1000); // Simulate fetching multiple city details
  console.log(`API: Data for all cities fetched successfully.`);
  return mockCityDetails;
};

/**
 * Fetches details about rewards and recognition programs.
 * @returns A promise resolving to RewardDetails.
 */
export const getRewardDetails = async (): Promise<RewardDetails> => {
  console.log("API: Fetching reward details...");
  await delay(500);
   console.log("API: Reward details fetched successfully.");
  return mockRewardDetails;
};


// --- Consolidated Fetch Functions ---

/**
 * Fetches all necessary data for the Leaderboard page.
 */
export const getLeaderboardPageData = async (): Promise<LeaderboardPageData> => {
    console.log("API: Fetching consolidated Leaderboard Page data...");
    await delay(1200); // Simulate longer delay for multiple fetches

    try {
        const [topOMs, topTLs, topSPMs, omTrends, fullLeaderboard, historicalWinners] = await Promise.all([
            getLeaderboardByRole('OM', 3),
            getLeaderboardByRole('TL', 3),
            getLeaderboardByRole('SPM', 3),
            getOMTrendData(),
            getFullLeaderboard(),
            getHistoricalWinners(), // Fetch historical winners
        ]);

        console.log("API: Consolidated Leaderboard Page data fetched successfully.");
        return {
            topPerformers: {
                om: topOMs,
                tl: topTLs,
                spm: topSPMs,
            },
            omTrends: omTrends,
            fullLeaderboard: fullLeaderboard,
            historicalWinners: historicalWinners, // Include historical winners
        };
    } catch (error) {
        console.error("API Error: Failed to fetch consolidated leaderboard data.", error);
        throw new Error("Failed to fetch leaderboard page data");
    }
}

/**
 * Fetches all necessary data for the City Views page.
 */
export const getCityViewsPageData = async (): Promise<CityViewsPageData> => {
     console.log("API: Fetching consolidated City Views Page data...");
     await delay(1000); // Simulate fetching all city data

     try {
         const allCityData = await getAllCityData();
         console.log("API: Consolidated City Views Page data fetched successfully.");
         return allCityData;
     } catch (error) {
         console.error("API Error: Failed to fetch consolidated city views data.", error);
         throw new Error("Failed to fetch city views page data");
     }
}

    