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
import { measurements, users } from '../../services/api';
import { AnthropometricMeasurement, User } from '../../types';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';

const MeasurementsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurementsData, setMeasurementsData] = useState<AnthropometricMeasurement[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<AnthropometricMeasurement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch measurements first
        const measurementsResponse = await measurements.getAll();
        setMeasurementsData(measurementsResponse.data?.data || []);

        // Fetch patients only if the user is a professional
        if (user?.role === 'professional') {
          const patientsResponse = await users.getPatients(); 
          // Assuming users.getPatients() response structure is { data: { patients: User[] } }
          // Adjust based on actual API response structure if different
          setPatients(patientsResponse.data?.patients || []);
        } else {
          setPatients([]); // Clear patients if not professional
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setMeasurementsData([]);
        setPatients([]);
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchData();
  }, [user]); // Keep user dependency

  const getPatientName = (userId: string): string => {
    const patient = patients.find(p => p._id === userId);
    return patient ? patient.name : 'Unknown';
  };

  const handleOpenModal = (measurement: AnthropometricMeasurement) => {
    setSelectedMeasurement(measurement);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMeasurement(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Measurements</Typography>
        {user?.role === 'professional' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/measurements/new')}
          >
            Add New Measurement
          </Button>
        )}
      </Box>

      {measurementsData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No measurements found. Start by adding your first measurement.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role === 'professional' && <TableCell>Patient</TableCell>}
                <TableCell>Weight (kg)</TableCell>
                <TableCell>Height (cm)</TableCell>
                <TableCell>Body Fat (%)</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurementsData.map((measurement) => (
                <TableRow key={measurement._id}>
                  <TableCell>
                    {format(new Date(measurement.date), 'MMM dd, yyyy')}
                  </TableCell>
                  {user?.role === 'professional' && (
                    <TableCell>{getPatientName(measurement.userId)}</TableCell>
                  )}
                  <TableCell>{measurement.weight}</TableCell>
                  <TableCell>{measurement.height}</TableCell>
                  <TableCell>
                    {measurement.bodyFatPercentage?.toFixed(1) || '-'}
                  </TableCell>
                  <TableCell>{measurement.notes || '-'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenModal(measurement)}
                    >
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
        <DialogTitle>Measurement Details</DialogTitle>
        <DialogContent>
          {selectedMeasurement && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Date: {format(new Date(selectedMeasurement.date), 'PPP')}
              </Typography>
              {user?.role === 'professional' && (
                 <Typography variant="subtitle1" gutterBottom>
                    Patient: {getPatientName(selectedMeasurement.userId)}
                </Typography>
              )}
              <Typography variant="subtitle1" gutterBottom>
                Weight: {selectedMeasurement.weight} kg, Height: {selectedMeasurement.height} cm
              </Typography>
              {selectedMeasurement.bodyFatPercentage && (
                  <Typography variant="subtitle1" gutterBottom>
                    Body Fat: {selectedMeasurement.bodyFatPercentage.toFixed(1)} %
                </Typography>
              )}
              
              <Typography variant="h6" sx={{ mt: 2 }}>Skinfolds (mm)</Typography>
              <Grid container spacing={1} sx={{ pl: 2 }}>
                {Object.entries(selectedMeasurement.skinfolds).map(([key, value]) => (
                    <Grid item xs={6} sm={4} key={key}>
                        <Typography variant="body2">{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</Typography>
                    </Grid>
                ))}
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 2 }}>Perimeters (cm)</Typography>
               <Grid container spacing={1} sx={{ pl: 2 }}>
                 {Object.entries(selectedMeasurement.perimeters).map(([key, value]) => (
                    <Grid item xs={6} sm={4} key={key}>
                       <Typography variant="body2">{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</Typography>
                    </Grid>
                ))}
              </Grid>

              {selectedMeasurement.notes && (
                 <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ pl: 2 }}>{selectedMeasurement.notes}</Typography>
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

export default MeasurementsList; 