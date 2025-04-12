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
import { performance, users } from '../../services/api';
import { PerformanceMetrics, User } from '../../types';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';

const PerformanceList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const performanceResponse = await performance.getAll();
        setPerformanceData(performanceResponse.data?.data || []);

        if (user?.role === 'professional') {
          const patientsResponse = await users.getPatients();
          setPatients(patientsResponse.data?.patients || []);
        } else {
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setPerformanceData([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getPatientName = (userId: string): string => {
    const patient = patients.find(p => p._id === userId);
    return patient ? patient.name : 'Unknown';
  };

  const handleOpenModal = (perf: PerformanceMetrics) => {
    setSelectedPerformance(perf);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPerformance(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Performance Metrics</Typography>
        {user?.role === 'professional' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/performance/new')}
          >
            Add New Performance Data
          </Button>
        )}
      </Box>

      {performanceData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No performance data found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role === 'professional' && <TableCell>Patient</TableCell>}
                <TableCell>Sport</TableCell>
                <TableCell>VO2 Max</TableCell>
                <TableCell>Power (W)</TableCell>
                <TableCell>Speed (km/h)</TableCell>
                <TableCell>Training Load</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((perf) => (
                <TableRow key={perf._id}>
                  <TableCell>{format(new Date(perf.date), 'MMM dd, yyyy')}</TableCell>
                  {user?.role === 'professional' && <TableCell>{getPatientName(perf.userId)}</TableCell>}
                  <TableCell>{perf.sport || '-'}</TableCell>
                  <TableCell>{perf.vo2max || '-'}</TableCell>
                  <TableCell>{perf.power || '-'}</TableCell>
                  <TableCell>{perf.speed || '-'}</TableCell>
                  <TableCell>{perf.trainingLoad || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenModal(perf)}>
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
        <DialogTitle>Performance Details</DialogTitle>
        <DialogContent>
          {selectedPerformance && (
            <Box>
               <Typography variant="subtitle1" gutterBottom>Date: {format(new Date(selectedPerformance.date), 'PPP')}</Typography>
               {user?.role === 'professional' && <Typography variant="subtitle1" gutterBottom>Patient: {getPatientName(selectedPerformance.userId)}</Typography>}
               <Typography variant="subtitle1" gutterBottom>Sport: {selectedPerformance.sport || 'N/A'}</Typography>
               <Typography variant="subtitle1" gutterBottom>Position: {selectedPerformance.position || 'N/A'}</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}><Typography>VO2 Max: {selectedPerformance.vo2max ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Power (W): {selectedPerformance.power ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Speed (km/h): {selectedPerformance.speed ?? '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography>Training Load: {selectedPerformance.trainingLoad ?? '-'}</Typography></Grid>
              </Grid>
               {selectedPerformance.notes && (
                 <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>{selectedPerformance.notes}</Typography>
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

export default PerformanceList; 