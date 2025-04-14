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
  DialogContentText,
  Snackbar,
  Alert,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { health, users } from '../../services/api'; // Use health API
import { HealthMetrics, User } from '../../types'; // Use HealthMetrics type
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import { formatDistance } from '../../utils/formatters';

const HealthList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthMetrics[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedHealth, setSelectedHealth] = useState<HealthMetrics | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HealthMetrics | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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

  const handleOpenDetailsModal = (item: HealthMetrics) => {
    setSelectedHealth(item);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedHealth(null);
  };

  const handleOpenDeleteConfirm = (item: HealthMetrics) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await health.delete(itemToDelete._id);
      setHealthData(prevData => prevData.filter(item => item._id !== itemToDelete._id));
      setSnackbarMessage('Health record deleted successfully');
      setSnackbarSeverity('success');
    } catch (error: any) {
      console.error('Error deleting health record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete health record');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      handleCloseDeleteConfirm();
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
                <TableCell>Distance</TableCell>
                <TableCell>Calories (kcal)</TableCell>
                <TableCell>Active Mins</TableCell>
                <TableCell>Actions</TableCell>
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
                  <TableCell>{item.distance ? formatDistance(item.distance) : '-'}</TableCell>
                  <TableCell>{item.calories?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '-'}</TableCell>
                  <TableCell>{item.activeMinutes?.toLocaleString() ?? '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDetailsModal(item)} title="View Details">
                      <InfoIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteConfirm(item)} color="error" title="Delete Record">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailsModalOpen} onClose={handleCloseDetailsModal} maxWidth="sm" fullWidth>
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
                  <Grid item xs={6}><Typography>Steps: {selectedHealth.steps?.toLocaleString() ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Distance: {selectedHealth.distance ? formatDistance(selectedHealth.distance) : '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Calories: {selectedHealth.calories?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '-'} kcal</Typography></Grid>
                  <Grid item xs={6}><Typography>Active Minutes: {selectedHealth.activeMinutes?.toLocaleString() ?? '-'} min</Typography></Grid>
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
          <Button onClick={handleCloseDetailsModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <DialogTitle id="delete-confirmation-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirmation-description">
            Are you sure you want to delete this health record dated {itemToDelete ? format(new Date(itemToDelete.date), 'PPP') : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthList; 