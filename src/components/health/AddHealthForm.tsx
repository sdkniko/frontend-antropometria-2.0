import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  Typography,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import { users, health } from '../../services/api';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';

interface HealthData {
  userId?: string;
  date: string;
  sleep: {
    duration: number;
    quality: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
  };
  heart: {
    stressLevel: number;
    restingHeartRate: number;
    heartRateVariability: number;
  };
  steps: number;
  notes?: string;
  source: 'garmin' | 'google_fit' | 'apple_health';
}

const AddHealthForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [patients, setPatients] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitError, setSubmitError] = React.useState('');

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

  const formik = useFormik<HealthData>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      sleep: {
        duration: 0,
        quality: 0,
        deepSleep: 0,
        lightSleep: 0,
        remSleep: 0,
      },
      heart: {
        stressLevel: 0,
        restingHeartRate: 0,
        heartRateVariability: 0,
      },
      steps: 0,
      source: 'garmin',
    },
    validationSchema: Yup.object({
      userId: Yup.string().required('Patient is required'),
      date: Yup.date().required('Date is required'),
      sleep: Yup.object({
        duration: Yup.number()
          .min(0, 'Duration must be positive')
          .max(24, 'Duration cannot exceed 24 hours')
          .required('Sleep duration is required'),
        quality: Yup.number()
          .min(0, 'Quality must be between 0 and 100')
          .max(100, 'Quality must be between 0 and 100')
          .required('Sleep quality is required'),
        deepSleep: Yup.number()
          .min(0, 'Deep sleep must be between 0 and 100')
          .max(100, 'Deep sleep must be between 0 and 100')
          .required('Deep sleep percentage is required'),
        lightSleep: Yup.number()
          .min(0, 'Light sleep must be between 0 and 100')
          .max(100, 'Light sleep must be between 0 and 100')
          .required('Light sleep percentage is required'),
        remSleep: Yup.number()
          .min(0, 'REM sleep must be between 0 and 100')
          .max(100, 'REM sleep must be between 0 and 100')
          .required('REM sleep percentage is required'),
      }),
      heart: Yup.object({
        stressLevel: Yup.number()
          .min(0, 'Stress level must be between 0 and 100')
          .max(100, 'Stress level must be between 0 and 100')
          .required('Stress level is required'),
        restingHeartRate: Yup.number()
          .min(0, 'Resting heart rate must be positive')
          .required('Resting heart rate is required'),
        heartRateVariability: Yup.number()
          .min(0, 'Heart rate variability must be positive')
          .required('Heart rate variability is required'),
      }),
      steps: Yup.number()
        .min(0, 'Steps must be positive')
        .required('Steps count is required'),
      source: Yup.string().oneOf(['garmin', 'google_fit', 'apple_health']).required('Data source is required'),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        setSubmitError('');
        
        if (!user?._id) {
          setSubmitError('User not authenticated');
          return;
        }

        // Format the data for submission
        const formattedData = {
          ...values,
          date: new Date(values.date),
          userId: user.role === 'professional' ? values.userId! : user._id,
          professionalId: user.role === 'professional' ? user._id : undefined,
        };

        await health.create(formattedData);
        setSnackbarMessage('Health data added successfully');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error creating health data:', error);
        if (error.response?.data?.error?.details) {
          const backendErrors = error.response.data.error.details.reduce((acc: any, error: any) => {
            acc[error.field] = error.message;
            return acc;
          }, {});
          setErrors(backendErrors);
          setSubmitError('Please fix the errors in the form');
        } else if (error.response?.data?.error?.message) {
          setSubmitError(error.response.data.error.message);
        } else {
          setSubmitError('An error occurred while creating the health data. Please try again.');
        }
        setSnackbarMessage('Failed to add health data');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
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
            Add Health Data
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
              {user?.role === 'professional' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    select
                    id="userId"
                    name="userId"
                    label="Patient"
                    value={formik.values.userId || ''}
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
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Sleep Data
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sleep Duration (hours)"
                  name="sleep.duration"
                  value={formik.values.sleep.duration}
                  onChange={formik.handleChange}
                  error={formik.touched.sleep?.duration && Boolean(formik.errors.sleep?.duration)}
                  helperText={formik.touched.sleep?.duration && formik.errors.sleep?.duration}
                  inputProps={{ min: 0, max: 24, step: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sleep Quality (%)"
                  name="sleep.quality"
                  value={formik.values.sleep.quality}
                  onChange={formik.handleChange}
                  error={formik.touched.sleep?.quality && Boolean(formik.errors.sleep?.quality)}
                  helperText={formik.touched.sleep?.quality && formik.errors.sleep?.quality}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Deep Sleep (%)"
                  name="sleep.deepSleep"
                  value={formik.values.sleep.deepSleep}
                  onChange={formik.handleChange}
                  error={formik.touched.sleep?.deepSleep && Boolean(formik.errors.sleep?.deepSleep)}
                  helperText={formik.touched.sleep?.deepSleep && formik.errors.sleep?.deepSleep}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Light Sleep (%)"
                  name="sleep.lightSleep"
                  value={formik.values.sleep.lightSleep}
                  onChange={formik.handleChange}
                  error={formik.touched.sleep?.lightSleep && Boolean(formik.errors.sleep?.lightSleep)}
                  helperText={formik.touched.sleep?.lightSleep && formik.errors.sleep?.lightSleep}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="REM Sleep (%)"
                  name="sleep.remSleep"
                  value={formik.values.sleep.remSleep}
                  onChange={formik.handleChange}
                  error={formik.touched.sleep?.remSleep && Boolean(formik.errors.sleep?.remSleep)}
                  helperText={formik.touched.sleep?.remSleep && formik.errors.sleep?.remSleep}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Heart Data
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stress Level (%)"
                  name="heart.stressLevel"
                  value={formik.values.heart.stressLevel}
                  onChange={formik.handleChange}
                  error={formik.touched.heart?.stressLevel && Boolean(formik.errors.heart?.stressLevel)}
                  helperText={formik.touched.heart?.stressLevel && formik.errors.heart?.stressLevel}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Resting Heart Rate (bpm)"
                  name="heart.restingHeartRate"
                  value={formik.values.heart.restingHeartRate}
                  onChange={formik.handleChange}
                  error={formik.touched.heart?.restingHeartRate && Boolean(formik.errors.heart?.restingHeartRate)}
                  helperText={formik.touched.heart?.restingHeartRate && formik.errors.heart?.restingHeartRate}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Heart Rate Variability (ms)"
                  name="heart.heartRateVariability"
                  value={formik.values.heart.heartRateVariability}
                  onChange={formik.handleChange}
                  error={formik.touched.heart?.heartRateVariability && Boolean(formik.errors.heart?.heartRateVariability)}
                  helperText={formik.touched.heart?.heartRateVariability && formik.errors.heart?.heartRateVariability}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Steps"
                  name="steps"
                  value={formik.values.steps}
                  onChange={formik.handleChange}
                  error={formik.touched.steps && Boolean(formik.errors.steps)}
                  helperText={formik.touched.steps && formik.errors.steps}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.source && Boolean(formik.errors.source)}>
                  <FormLabel>Data Source</FormLabel>
                  <Select
                    value={formik.values.source}
                    onChange={formik.handleChange}
                    name="source"
                  >
                    <MenuItem value="garmin">Garmin</MenuItem>
                    <MenuItem value="google_fit">Google Fit</MenuItem>
                    <MenuItem value="apple_health">Apple Health</MenuItem>
                  </Select>
                  <FormHelperText>{formik.errors.source}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!formik.isValid || formik.isSubmitting || (user?.role === 'professional' && patients.length === 0)}
            >
              Add Health Data
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddHealthForm; 