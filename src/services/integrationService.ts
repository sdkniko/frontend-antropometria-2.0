import { StravaDataResponse, StravaSyncResponse } from '../types'; // Assuming Strava types exist
import api from './api'; // Import the configured Axios instance

// --- Strava Integration ---

/**
 * Initiates the Strava connection process by redirecting the user.
 * Note: This might not be needed if the redirect is handled directly via window.location.href in the component.
 */
export const connectStrava = () => {
    // Typically, you redirect directly from the component:
    // window.location.href = '/api/integrations/strava/connect';
    // This function could be used if there was intermediary frontend logic needed.
    console.log('Redirecting to Strava connection endpoint...');
    window.location.href = '/api/integrations/strava/connect';
};

/**
 * Calls the backend endpoint to disconnect Strava for the logged-in user.
 */
export const disconnectStrava = async (): Promise<{ message: string }> => {
    try {
        // Use the imported 'api' instance
        const response = await api.post<{ message: string }>('/integrations/strava/disconnect');
        return response.data;
    } catch (error: any) {
        console.error('Error disconnecting Strava:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to disconnect Strava account.');
    }
};

/**
 * Calls the backend endpoint to sync/fetch Strava data (e.g., athlete stats, activities).
 */
export const fetchStravaData = async (): Promise<StravaSyncResponse> => {
    try {
        // Use GET request for the sync/fetch endpoint using the imported 'api' instance
        const response = await api.get<StravaSyncResponse>('/integrations/strava/sync');
        console.log("Strava sync response:", response.data);
        return response.data; // Includes message, stats, recentActivities
    } catch (error: any) {
        console.error('Error fetching Strava data:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch Strava data.');
    }
};

// --- TrainingPeaks Integration ---

/**
 * Sends TrainingPeaks credentials to the backend.
 */
export const saveTrainingPeaksCredentials = async (credentials: { username: string, password: string }): Promise<{ message: string, trainingPeaksConnected: boolean, trainingPeaksUsername?: string }> => {
    try {
        const response = await api.post<{ message: string, trainingPeaksConnected: boolean, trainingPeaksUsername?: string }>('/integrations/trainingpeaks/credentials', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Error saving TrainingPeaks credentials:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to save TrainingPeaks credentials.');
    }
};

/**
 * Calls the backend endpoint to disconnect/clear TrainingPeaks credentials.
 */
export const disconnectTrainingPeaks = async (): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/integrations/trainingpeaks/disconnect');
        return response.data;
    } catch (error: any) {
        console.error('Error disconnecting TrainingPeaks:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to disconnect TrainingPeaks.');
    }
};

/**
 * Calls the backend endpoint to initiate the TrainingPeaks login scrape.
 */
export const triggerTrainingPeaksLoginScrape = async (): Promise<{ message: string, scrapedData?: any }> => {
    try {
        // Expecting success message and potentially some scraped data placeholder
        const response = await api.post<{ message: string, scrapedData?: any }>('/integrations/trainingpeaks/login-scrape');
        return response.data;
    } catch (error: any) {
        console.error('Error triggering TrainingPeaks login scrape:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to start TrainingPeaks login scrape.');
    }
}; 