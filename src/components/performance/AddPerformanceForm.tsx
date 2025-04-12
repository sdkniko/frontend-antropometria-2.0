import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Grid,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { performance, users } from '../../services/api';
import { PerformanceMetrics, User } from '../../types';

const AddPerformanceForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string>('');
  const [patients, setPatients] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (user?.role === 'professional') {
          const response = await users.getPatients();
          if (response.data?.patients) {
            setPatients(response.data.patients);
          } else {
            setPatients([]);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  const formik = useFormik({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      userId: '',
      vo2max: '',
      power: '',
      speed: '',
      trainingLoad: '',
      sport: '',
      position: '',
      notes: '',
    },
    validationSchema: Yup.object({
      date: Yup.date().required('Date is required'),
      userId: Yup.string().required('Patient is required'),
      vo2max: Yup.number().min(0, 'VO2 max must be positive'),
      power: Yup.number().min(0, 'Power must be positive'),
      speed: Yup.number().min(0, 'Speed must be positive'),
      trainingLoad: Yup.number().min(0, 'Training load must be positive'),
      sport: Yup.string(),
      position: Yup.string(),
      notes: Yup.string(),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        setSubmitError('');
        
        if (!user?._id) {
          setSubmitError('User not authenticated');
          return;
        }

        // Convert numbers and format data
        const formattedData: Omit<PerformanceMetrics, '_id'> = {
          ...values,
          date: new Date(values.date),
          vo2max: values.vo2max ? Number(values.vo2max) : undefined,
          power: values.power ? Number(values.power) : undefined,
          speed: values.speed ? Number(values.speed) : undefined,
          trainingLoad: values.trainingLoad ? Number(values.trainingLoad) : undefined,
          professionalId: user._id,
        };
        
        await performance.create(formattedData);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Error creating performance record:', err);
        if (err.response?.data?.error?.details) {
          const backendErrors = err.response.data.error.details.reduce((acc: any, error: any) => {
            acc[error.field] = error.message;
            return acc;
          }, {});
          setErrors(backendErrors);
          setSubmitError('Please fix the errors in the form');
        } else if (err.response?.data?.error?.message) {
          setSubmitError(err.response.data.error.message);
        } else {
          setSubmitError('An error occurred while creating the performance record. Please try again.');
        }
      }
    },
  });

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Add Performance Metrics
          </Typography>
          {submitError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {submitError}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 3, width: '100%' }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  select
                  id="userId"
                  name="userId"
                  label="Patient"
                  value={formik.values.userId}
                  onChange={formik.handleChange}
                  error={formik.touched.userId && Boolean(formik.errors.userId)}
                  helperText={formik.touched.userId && formik.errors.userId}
                  disabled={loading}
                >
                  {loading ? (
                    <MenuItem value="" disabled>
                      Loading patients...
                    </MenuItem>
                  ) : patients.length === 0 ? (
                    <MenuItem value="" disabled>
                      No patients found
                    </MenuItem>
                  ) : (
                    patients.map((patient) => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {patient.name} ({patient.email})
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="date"
                  label="Date"
                  name="date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="vo2max"
                  label="VO2 Max"
                  name="vo2max"
                  type="number"
                  value={formik.values.vo2max}
                  onChange={formik.handleChange}
                  error={formik.touched.vo2max && Boolean(formik.errors.vo2max)}
                  helperText={formik.touched.vo2max && formik.errors.vo2max}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="power"
                  label="Power (watts)"
                  name="power"
                  type="number"
                  value={formik.values.power}
                  onChange={formik.handleChange}
                  error={formik.touched.power && Boolean(formik.errors.power)}
                  helperText={formik.touched.power && formik.errors.power}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="speed"
                  label="Speed (km/h)"
                  name="speed"
                  type="number"
                  value={formik.values.speed}
                  onChange={formik.handleChange}
                  error={formik.touched.speed && Boolean(formik.errors.speed)}
                  helperText={formik.touched.speed && formik.errors.speed}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="trainingLoad"
                  label="Training Load"
                  name="trainingLoad"
                  type="number"
                  value={formik.values.trainingLoad}
                  onChange={formik.handleChange}
                  error={formik.touched.trainingLoad && Boolean(formik.errors.trainingLoad)}
                  helperText={formik.touched.trainingLoad && formik.errors.trainingLoad}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="sport"
                  label="Sport"
                  name="sport"
                  value={formik.values.sport}
                  onChange={formik.handleChange}
                  error={formik.touched.sport && Boolean(formik.errors.sport)}
                  helperText={formik.touched.sport && formik.errors.sport}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="position"
                  label="Position"
                  name="position"
                  value={formik.values.position}
                  onChange={formik.handleChange}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || patients.length === 0}
            >
              Add Performance Record
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddPerformanceForm; 