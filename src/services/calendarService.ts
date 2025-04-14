import api from './api'; // Assuming api is configured axios instance
import { ScrapedWorkout } from '../types'; // Assuming this type will be defined

/**
 * Fetches scraped workout data for a given date range.
 */
export const getScrapedWorkouts = async (startDate: string, endDate: string): Promise<{ data: ScrapedWorkout[] }> => {
    try {
        const response = await api.get<{ data: ScrapedWorkout[] }>('/calendar', {
            params: {
                startDate, // Should be YYYY-MM-DD
                endDate    // Should be YYYY-MM-DD
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching scraped calendar data:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch calendar data.');
    }
}; 