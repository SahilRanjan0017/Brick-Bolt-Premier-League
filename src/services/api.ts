// src/services/api.ts
import type { LeaderboardEntry, HistoricalWinner, CityData, RewardDetails } from '@/types';
import { mockLeaderboard, mockHistoricalWinners, mockCityDetails, mockRewardDetails } from './mockData';

/**
 * Simulates network delay.
 * @param ms - Milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches leaderboard data.
 * @param limit - Optional limit for the number of entries to return.
 * @returns A promise resolving to an array of LeaderboardEntry.
 */
export const getLeaderboardData = async (limit?: number): Promise<LeaderboardEntry[]> => {
  console.log(`API: Fetching leaderboard data ${limit ? `(limit: ${limit})` : ''}...`);
  await delay(800); // Simulate network latency

  // Simulate potential API error randomly
  // if (Math.random() < 0.1) {
  //   console.error("API Error: Failed to fetch leaderboard data.");
  //   throw new Error("Failed to fetch leaderboard data");
  // }

  const sortedData = [...mockLeaderboard].sort((a, b) => b.score - a.score);
  const rankedData = sortedData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      // Mock RAG status based on rank/score for demo purposes
      ragStatus: {
        green: Math.max(0, entry.projectCount - Math.floor(entry.rank / 3) - (entry.score < 60 ? 2 : 0)),
        amber: Math.floor(entry.rank / 3) + (entry.score < 75 && entry.score >= 60 ? 1 : 0),
        red: (entry.score < 60 ? 1 : 0),
        status: entry.score >= 80 ? 'Green' : entry.score >= 60 ? 'Amber' : 'Red'
      }
  }));

  console.log("API: Leaderboard data fetched successfully.");
  return limit ? rankedData.slice(0, limit) : rankedData;
};

/**
 * Fetches historical weekly winners data.
 * @returns A promise resolving to an array of HistoricalWinner.
 */
export const getHistoricalWinners = async (): Promise<HistoricalWinner[]> => {
  console.log("API: Fetching historical winners...");
  await delay(600);
   console.log("API: Historical winners fetched successfully.");
  return mockHistoricalWinners;
};

/**
 * Fetches detailed data for a specific city.
 * @param cityId - The ID of the city (e.g., 'BLR_A').
 * @returns A promise resolving to CityData for the specified city.
 */
export const getCityData = async (cityId: string): Promise<CityData> => {
  console.log(`API: Fetching data for city: ${cityId}...`);
  await delay(1000); // Simulate potentially longer fetch for detailed data

  const cityData = mockCityDetails[cityId];

  if (!cityData) {
     console.error(`API Error: No data found for city: ${cityId}`);
     throw new Error(`No data found for city: ${cityId}`);
  }

   console.log(`API: Data for city ${cityId} fetched successfully.`);
  return cityData;
};

/**
 * Fetches details about rewards and recognition programs.
 * @returns A promise resolving to RewardDetails.
 */
export const getRewardDetails = async (): Promise<RewardDetails> => {
  console.log("API: Fetching reward details...");
  await delay(700);
   console.log("API: Reward details fetched successfully.");
  return mockRewardDetails;
};
