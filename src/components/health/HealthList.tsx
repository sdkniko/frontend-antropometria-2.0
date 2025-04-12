import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../../contexts/AuthContext';
import { health, users } from '../../services/api'; // Use health API
import { HealthMetrics, User } from '../../types'; // Use HealthMetrics type
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';

const HealthList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthMetrics[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHealth, setSelectedHealth] = useState<HealthMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const healthResponse = await health.getAll(); // Fetch health data
        setHealthData(healthResponse.data?.data || []);

        if (user?.role === 'professional') {
          const patientsResponse = await users.getPatients();
          setPatients(patientsResponse.data?.patients || []);
        } else {
           // If athlete, maybe fetch own data or filter? For now, fetch patients for consistency
           // This part might need adjustment based on athlete view requirements
           setPatients([]); 
        }
      } catch (error) {
        console.error('Error fetching health data:', error);
        setHealthData([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getPatientName = (userId: string): string => {
     // If athlete, their data won't have a patient name to look up typically
    if (user?.role === 'athlete') return user.name; 
    const patient = patients.find(p => p._id === userId);
    return patient ? patient.name : 'Unknown';
  };

  const handleOpenModal = (item: HealthMetrics) => {
    setSelectedHealth(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHealth(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Health Metrics</Typography>
         {/* Add Health Button - Check if athletes should add their own */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/health/new')} 
        >
          Add New Health Data
        </Button>
      </Box>

      {healthData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No health data found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {/* Show patient only for professionals */}
                {user?.role === 'professional' && <TableCell>Patient</TableCell>}
                <TableCell>Source</TableCell>
                <TableCell>Stress</TableCell>
                <TableCell>Resting HR</TableCell>
                <TableCell>HRV</TableCell>
                <TableCell>Sleep (h)</TableCell>
                <TableCell>Sleep Quality</TableCell>
                <TableCell>Steps</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {healthData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                  {user?.role === 'professional' && <TableCell>{getPatientName(item.userId)}</TableCell>}
                  <TableCell>{item.source || '-'}</TableCell>
                  <TableCell>{item.stress ?? '-'}</TableCell>
                  <TableCell>{item.restingHeartRate ?? '-'}</TableCell>
                  <TableCell>{item.heartRateVariability ?? '-'}</TableCell>
                  <TableCell>{item.sleep?.duration ?? '-'}</TableCell>
                  <TableCell>{item.sleep?.quality ?? '-'}</TableCell>
                  <TableCell>{item.steps ?? '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenModal(item)}>
                      <InfoIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Health Details</DialogTitle>
        <DialogContent>
          {selectedHealth && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Date: {format(new Date(selectedHealth.date), 'PPP')}</Typography>
              {user?.role === 'professional' && <Typography variant="subtitle1" gutterBottom>Patient: {getPatientName(selectedHealth.userId)}</Typography>}
              <Typography variant="subtitle1" gutterBottom>Source: {selectedHealth.source || 'N/A'}</Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}><Typography>Stress: {selectedHealth.stress ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Resting HR: {selectedHealth.restingHeartRate ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>HRV: {selectedHealth.heartRateVariability ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Steps: {selectedHealth.steps ?? '-'}</Typography></Grid>
              </Grid>
              {selectedHealth.sleep && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Sleep</Typography>
                  <Grid container spacing={1} sx={{ pl: 2 }}>
                     <Grid item xs={6} sm={4}><Typography>Duration: {selectedHealth.sleep.duration ?? '-'} h</Typography></Grid>
                     <Grid item xs={6} sm={4}><Typography>Quality: {selectedHealth.sleep.quality ?? '-'} %</Typography></Grid>
                     <Grid item xs={6} sm={4}><Typography>Deep: {selectedHealth.sleep.deepSleep ?? '-'} h</Typography></Grid>
                     <Grid item xs={6} sm={4}><Typography>Light: {selectedHealth.sleep.lightSleep ?? '-'} h</Typography></Grid>
                     <Grid item xs={6} sm={4}><Typography>REM: {selectedHealth.sleep.remSleep ?? '-'} h</Typography></Grid>
                   </Grid>
                </>
              )}
              {selectedHealth.notes && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Notes</Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>{selectedHealth.notes}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthList; 