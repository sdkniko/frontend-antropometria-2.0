import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    Alert,
    Divider
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { getScrapedWorkouts } from '../../services/calendarService';
import { ScrapedWorkout } from '../../types';

const CalendarPage: React.FC = () => {
    const [workouts, setWorkouts] = useState<ScrapedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkouts = async () => {
            // Calculate the date range for the upcoming week
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + 1); // Start from tomorrow
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7); // End 7 days from today

            const startDateString = startDate.toISOString().split('T')[0];
            const endDateString = endDate.toISOString().split('T')[0];

            console.log(`[CalendarPage] Fetching workouts for range: ${startDateString} to ${endDateString}`);
            setLoading(true);
            setError(null); // Reset error before fetching
            try {
                // Use the calculated date strings
                const response = await getScrapedWorkouts(startDateString, endDateString);
                console.log('[CalendarPage] API Response Received:', JSON.stringify(response, null, 2)); // Log raw response
                
                // Input validation: Ensure response.data is an array
                if (!Array.isArray(response?.data)) {
                     console.error('[CalendarPage] Invalid API response: Expected response.data to be an array, received:', response);
                     setWorkouts([]); // Clear workouts on invalid response
                     setError('Failed to load workout data: Invalid format.');
                     return; // Stop processing
                }
                
                // Log the data before setting state
                console.log('[CalendarPage] Data received from API (response.data):', JSON.stringify(response.data, null, 2));
                setWorkouts(response.data);
                console.log('[CalendarPage] workouts state UPDATED.');
                // setError(null); // Already reset above
            } catch (err) {
                console.error('[CalendarPage] Error fetching workouts:', err);
                // Type check for error message
                let errorMessage = 'Failed to load workouts';
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === 'string') {
                     errorMessage = err;
                }
                setError(errorMessage);
                setWorkouts([]); // Clear workouts on error
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, []); // Run once on component mount

    // Log the state right before rendering
    console.log('Workouts state before render:', workouts);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Upcoming Week (Scraped from TrainingPeaks)
            </Typography>

            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}

            {!loading && !error && workouts.length === 0 && (
                <Typography sx={{ mt: 2 }}>No scraped workouts found for the upcoming week.</Typography>
            )}

            {!loading && !error && workouts.length > 0 && (
                <Paper sx={{ mt: 2 }}>
                    <List disablePadding>
                        {workouts.map((workout, index) => {
                            const rawDateString = workout.date;
                            let formattedDateString = 'Invalid Date';
                            try {
                                const parsedDateObject = parseISO(rawDateString);
                                
                                // Check if parsing was successful (returns a valid Date object)
                                if (!isNaN(parsedDateObject.getTime())) {
                                    // Extract components in UTC
                                    const utcYear = parsedDateObject.getUTCFullYear();
                                    const utcMonth = parsedDateObject.getUTCMonth(); // 0-indexed (0=Jan, 1=Feb, ...)
                                    const utcDate = parsedDateObject.getUTCDate();
                                    const utcDay = parsedDateObject.getUTCDay(); // 0-indexed (0=Sun, 1=Mon, ...)

                                    // Manual formatting using UTC components
                                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    
                                    formattedDateString = `${dayNames[utcDay]}, ${monthNames[utcMonth]} ${utcDate}`;
                                    
                                    // Log comparison for debugging (REMOVED)
                                    // const localFormatted = format(parsedDateObject, 'EEEE, MMM dd'); 
                                    // console.log(`Item ${index}: Raw='${rawDateString}', UTC Date='${utcYear}-${String(utcMonth+1).padStart(2,'0')}-${String(utcDate).padStart(2,'0')}', Formatted (UTC)='${formattedDateString}', Formatted (Local)='${localFormatted}'`);
                                } else {
                                     console.error('[CalendarPage] Error parsing date:', rawDateString, 'Resulted in Invalid Date');
                                }
                            } catch(e) { 
                                console.error('[CalendarPage] Error during date processing:', rawDateString, e); 
                            }
                            
                            return (
                                <React.Fragment key={workout._id}>
                                    <ListItem 
                                        alignItems="flex-start"
                                        sx={{ 
                                           backgroundColor: index % 2 === 0 ? 'rgba(245, 245, 255, 0.5)' : 'rgba(255, 245, 245, 0.5)', 
                                           borderLeft: '4px solid',
                                           borderColor: index % 2 === 0 ? 'primary.main' : 'secondary.main'
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1">
                                                    {formattedDateString} - {workout.title || 'No Title'} 
                                                    <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                                                        (ID: {workout._id.substring(workout._id.length - 4)})
                                                    </Typography>
                                                </Typography>
                                            }
                                            secondaryTypographyProps={{ component: 'div' }}
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    {workout.duration && <Typography variant="body2">Duration: {workout.duration}</Typography>}
                                                    {workout.distance && <Typography variant="body2">Distance: {workout.distance}</Typography>}
                                                    {workout.avgPace && <Typography variant="body2">Avg Pace: {workout.avgPace}</Typography>}
                                                    {workout.calories && <Typography variant="body2">Calories: {workout.calories}</Typography>}
                                                    {workout.elevationGain && <Typography variant="body2">Elev Gain: {workout.elevationGain}</Typography>}
                                                    {workout.elevationLoss && <Typography variant="body2">Elev Loss: {workout.elevationLoss}</Typography>}
                                                    {workout.tss && <Typography variant="body2">TSS: {workout.tss}</Typography>}
                                                    {workout.ifFactor && <Typography variant="body2">IF: {workout.ifFactor}</Typography>}
                                                    {workout.work && <Typography variant="body2">Work: {workout.work}</Typography>}
                                                    
                                                    {workout.scrapeError && (
                                                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                            Scraping Error: {workout.scrapeError}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < workouts.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default CalendarPage; 