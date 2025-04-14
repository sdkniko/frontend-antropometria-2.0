import React, { useEffect, useState } from 'react';
import { fetchStravaData } from '../../services/integrationService';
import { useAuth } from '../../contexts/AuthContext';
import { StravaSyncResponse, StravaAthleteStats, StravaActivitySummary } from '../../types';
import { Link } from 'react-router-dom';
import { formatDistance, formatDuration } from '../../utils/formatters';

const StravaDataPage: React.FC = () => {
    const { user } = useAuth();
    const [stravaData, setStravaData] = useState<StravaSyncResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStravaData = async () => {
            if (user?.stravaConnected) {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await fetchStravaData();
                    setStravaData(data);
                } catch (err: any) {
                    setError(err.message || 'Failed to load Strava data. Please ensure your account is connected.');
                    console.error("Strava load error: ", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Not connected or user not loaded yet
                setIsLoading(false);
            }
        };

        loadStravaData();
    }, [user]); // Re-run if user object changes (e.g., after connecting)

    if (isLoading) {
        return <div className="text-center p-4">Loading Strava data...</div>;
    }

    if (!user?.stravaConnected) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Strava Data</h1>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                    Strava account not connected.
                    <Link to="/profile" className="font-bold underline ml-2">Connect on Profile Page</Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Strava Data</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    Error: {error}
                     {error.includes('connected') && 
                         <Link to="/profile" className="font-bold underline ml-2">Check Connection</Link>
                     }
                </div>
            </div>
        );
    }

    if (!stravaData) {
        return <div className="text-center p-4">No Strava data available. Try syncing again later.</div>;
    }

    const renderStats = (stats: StravaAthleteStats) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard title="Total Runs (All Time)" value={stats.all_run_totals.count.toLocaleString()} />
            <StatCard title="Total Distance (Run)" value={formatDistance(stats.all_run_totals.distance)} />
            <StatCard title="Total Time (Run)" value={formatDuration(stats.all_run_totals.moving_time)} />
            
            <StatCard title="Total Rides (All Time)" value={stats.all_ride_totals.count.toLocaleString()} />
            <StatCard title="Total Distance (Ride)" value={formatDistance(stats.all_ride_totals.distance)} />
            <StatCard title="Total Time (Ride)" value={formatDuration(stats.all_ride_totals.moving_time)} />

            {/* Add more stats as needed (YTD, recent, swim, etc.) */}
        </div>
    );

    const renderActivities = (activities: StravaActivitySummary[]) => (
        <div>
            <h2 className="text-xl font-semibold mb-3">Recent Activities</h2>
            {activities.length === 0 ? (
                <p>No recent activities found.</p>
            ) : (
                <ul className="space-y-3">
                    {activities.map((activity) => (
                        <li key={activity.id} className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
                            <h3 className="font-medium text-lg">{activity.name} ({activity.type})</h3>
                            <p className="text-sm text-gray-600">{new Date(activity.start_date_local).toLocaleString()}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                <span>Distance: {formatDistance(activity.distance)}</span>
                                <span>Time: {formatDuration(activity.moving_time)}</span>
                                <span>Elevation: {activity.total_elevation_gain?.toFixed(0)}m</span>
                                {activity.average_speed && <span>Avg Speed: {(activity.average_speed * 3.6).toFixed(1)} km/h</span>} 
                                {activity.average_heartrate && <span>Avg HR: {activity.average_heartrate.toFixed(0)} bpm</span>}
                            </div>
                            {/* Add link to Strava activity if desired: target="_blank" rel="noopener noreferrer" href={`https://www.strava.com/activities/${activity.id}`} */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Strava Data</h1>
            
            {stravaData.stats && renderStats(stravaData.stats)}
            {stravaData.recentActivities && renderActivities(stravaData.recentActivities)}
            
        </div>
    );
};

// Helper component for displaying stats
interface StatCardProps {
    title: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-xl font-semibold">{value}</p>
    </div>
);

// --- Utility Formatters (Example - move to utils file) ---
// You should place these in a dedicated utility file like `src/utils/formatters.ts`

// export const formatDistance = (meters: number): string => {
//     if (meters < 1000) {
//         return `${meters.toFixed(0)} m`;
//     }
//     return `${(meters / 1000).toFixed(2)} km`;
// };

// export const formatDuration = (seconds: number): string => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     let result = '';
//     if (hours > 0) result += `${hours}h `;
//     if (minutes > 0 || hours > 0) result += `${minutes}m `;
//     result += `${secs}s`;
//     return result.trim();
// };

export default StravaDataPage; 