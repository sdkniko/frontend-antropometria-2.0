import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  CircularProgress,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { users } from '../../services/api/users';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const Patients: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await users.getPatients();
        if (response.data?.patients) {
          setPatients(response.data.patients);
        } else {
          setPatients([]);
        }
      } catch (error: any) {
        console.error('Error fetching patients:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load patients. Please try again later.');
        }
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'professional') {
      fetchPatients();
    }
  }, [user, token]);

  const handleDelete = async (id: string) => {
    try {
      await users.deletePatient(id);
      setPatients(patients.filter(patient => patient._id !== id));
      enqueueSnackbar('Patient deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      enqueueSnackbar(error instanceof Error ? error.message : 'Failed to delete patient', { 
        variant: 'error' 
      });
    }
  };

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">Please log in to view patients.</Alert>
      </Box>
    );
  }

  if (user.role !== 'professional') {
    return (
      <Box p={3}>
        <Alert severity="error">Only professionals can view patients.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!patients.length) {
    return (
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          No patients found
        </Typography>
        <Typography color="textSecondary">
          You haven't added any patients yet. Click the "Add Patient" button to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        My Patients
      </Typography>
      <Grid container spacing={3}>
        {patients.map((patient) => (
          <Grid item xs={12} md={6} lg={4} key={patient._id}>
            <Card>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={patient.name}
                      secondary={patient.email}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Sport"
                      secondary={patient.sport || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Position"
                      secondary={patient.position || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Age"
                      secondary={patient.age ? `${patient.age} years` : 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Gender"
                      secondary={patient.gender || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Country"
                      secondary={patient.country || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => navigate(`/patients/${patient._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(patient._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Patients; 