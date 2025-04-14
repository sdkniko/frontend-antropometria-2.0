/**
 * Formats distance in meters to a readable string (e.g., "1.23 km" or "500 m").
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Formats duration in seconds to a readable string (e.g., "1h 30m 15s").
 */
export const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return '0s';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60); // Use Math.floor to avoid decimals
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${secs}s`;
    return result.trim() || '0s'; // Return '0s' if result is empty
}; 