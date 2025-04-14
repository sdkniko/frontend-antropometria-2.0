import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Container,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import SyncIcon from '@mui/icons-material/Sync';
import api from '../../services/api'; 
import { HealthMetrics } from '../../types';
import format from 'date-fns/format';

const GoogleFitData: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [googleFitHealthData, setGoogleFitHealthData] = useState<HealthMetrics[]>([]);

  const fetchGoogleFitData = async () => {
      setLoadingData(true);
      try {
          const response = await api.get<any>('/health', { 
              params: { 
                  source: 'googlefit', 
                  limit: 30
              } 
          });
          setGoogleFitHealthData(response.data?.data || []);
      } catch (err) {
          console.error("Error fetching Google Fit health data:", err);
          enqueueSnackbar('Could not load Google Fit health data', { variant: 'error' });
      } finally {
          setLoadingData(false);
      }
  };

   useEffect(() => {
      if (user?.googleFitConnected) {
          if (user.googleFitLastSync) {
              setLastSyncTime(new Date(user.googleFitLastSync).toLocaleString());
          }
          fetchGoogleFitData();
      } else {
          setLoadingData(false);
      }
       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSyncData = async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const response = await api.post('/integrations/googlefit/sync'); 
      const message = response.data.message || 'Google Fit data synced successfully';
      const newSyncTime = new Date();
      setLastSyncTime(newSyncTime.toLocaleString()); 
      enqueueSnackbar(message, { variant: 'success' });
      
      await fetchGoogleFitData(); 
      
    } catch (err: any) {
      console.error('Error syncing Google Fit data:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to sync Google Fit data';
      setSyncError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.googleFitConnected) {
    return (
        <Container maxWidth="sm">
             <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Google Fit Not Connected
                </Typography>
                <Typography variant="body1">
                    Please connect your Google Fit account via your Profile page first.
                </Typography>
            </Paper>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4">
                Google Fit Data
            </Typography>
            <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                onClick={handleSyncData}
                disabled={loading}
            >
                Sync Data Now
            </Button>
        </Box>
         {lastSyncTime && (
            <Typography variant="caption" color="textSecondary" sx={{ mb: 3, display: 'block' }}>
                Last synced: {lastSyncTime}
            </Typography>
        )}
        
        {syncError && (
             <Alert severity="error" sx={{ mb: 2 }}>{syncError}</Alert>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          Syncing fetches the last 7 days of step data. Displaying recent records synced from Google Fit below.
        </Typography>
        
        {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
            </Box>
        ) : googleFitHealthData.length === 0 ? (
            <Typography color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
                No Google Fit data found. Try syncing first.
            </Typography>
        ) : (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Steps</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {googleFitHealthData.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell component="th" scope="row">
                                    {format(new Date(item.date), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell align="right">{item.steps ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default GoogleFitData; 