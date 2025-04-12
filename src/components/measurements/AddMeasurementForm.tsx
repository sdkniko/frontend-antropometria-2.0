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
import { measurements, users } from '../../services/api';
import { AnthropometricMeasurement, User } from '../../types';

interface SkinfoldValues {
  triceps: string;
  biceps: string;
  subscapular: string;
  suprailiac: string;
  abdominal: string;
  thigh: string;
  calf: string;
}

interface PerimeterValues {
  chest: string;
  waist: string;
  hip: string;
  arm: string;
  thigh: string;
  calf: string;
}

const AddMeasurementForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string>('');
  const [patients, setPatients] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (user?.role === 'professional') {
          console.log('Fetching patients for professional:', user._id);
          const response = await users.getPatients();
          console.log('Raw patients response:', response);
          console.log('Response data:', response.data);
          
          // The backend returns patients directly in the response
          if (response.data?.patients) {
            console.log('Found patients:', response.data.patients);
            setPatients(response.data.patients);
          } else {
            console.error('Unexpected response format:', response.data);
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
      weight: '',
      height: '',
      userId: '',
      skinfolds: {
        triceps: '',
        biceps: '',
        subscapular: '',
        suprailiac: '',
        abdominal: '',
        thigh: '',
        calf: '',
      },
      perimeters: {
        chest: '',
        waist: '',
        hip: '',
        arm: '',
        thigh: '',
        calf: '',
      },
      bodyFatPercentage: '',
      notes: '',
    },
    validationSchema: Yup.object({
      date: Yup.date().required('Date is required'),
      userId: Yup.string().required('Patient is required'),
      weight: Yup.number()
        .min(0, 'Weight must be positive')
        .required('Weight is required'),
      height: Yup.number()
        .min(0, 'Height must be positive')
        .required('Height is required'),
      skinfolds: Yup.object().shape({
        triceps: Yup.number().min(0, 'Value must be positive').required(),
        biceps: Yup.number().min(0, 'Value must be positive').required(),
        subscapular: Yup.number().min(0, 'Value must be positive').required(),
        suprailiac: Yup.number().min(0, 'Value must be positive').required(),
        abdominal: Yup.number().min(0, 'Value must be positive').required(),
        thigh: Yup.number().min(0, 'Value must be positive').required(),
        calf: Yup.number().min(0, 'Value must be positive').required(),
      }),
      perimeters: Yup.object().shape({
        chest: Yup.number().min(0, 'Value must be positive').required(),
        waist: Yup.number().min(0, 'Value must be positive').required(),
        hip: Yup.number().min(0, 'Value must be positive').required(),
        arm: Yup.number().min(0, 'Value must be positive').required(),
        thigh: Yup.number().min(0, 'Value must be positive').required(),
        calf: Yup.number().min(0, 'Value must be positive').required(),
      }),
      bodyFatPercentage: Yup.number()
        .min(0, 'Body fat must be positive')
        .max(100, 'Body fat cannot exceed 100%'),
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
        const formattedData: Omit<AnthropometricMeasurement, '_id'> = {
          ...values,
          weight: Number(values.weight),
          height: Number(values.height),
          date: new Date(values.date),
          skinfolds: {
            triceps: Number(values.skinfolds.triceps),
            biceps: Number(values.skinfolds.biceps),
            subscapular: Number(values.skinfolds.subscapular),
            suprailiac: Number(values.skinfolds.suprailiac),
            abdominal: Number(values.skinfolds.abdominal),
            thigh: Number(values.skinfolds.thigh),
            calf: Number(values.skinfolds.calf),
          },
          perimeters: {
            chest: Number(values.perimeters.chest),
            waist: Number(values.perimeters.waist),
            hip: Number(values.perimeters.hip),
            arm: Number(values.perimeters.arm),
            thigh: Number(values.perimeters.thigh),
            calf: Number(values.perimeters.calf),
          },
          bodyFatPercentage: values.bodyFatPercentage ? Number(values.bodyFatPercentage) : undefined,
          notes: values.notes || undefined,
          userId: values.userId,
          professionalId: user._id,
        };
        
        await measurements.create(formattedData);
        navigate('/measurements');
      } catch (err: any) {
        console.error('Error creating measurement:', err);
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
          setSubmitError('An error occurred while creating the measurement. Please try again.');
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
            Add New Measurement
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
                  required
                  fullWidth
                  id="weight"
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="height"
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  error={formik.touched.height && Boolean(formik.errors.height)}
                  helperText={formik.touched.height && formik.errors.height}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Skinfolds (mm)
                </Typography>
              </Grid>
              {Object.entries(formik.values.skinfolds).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                  <TextField
                    fullWidth
                    id={`skinfolds.${key}`}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={`skinfolds.${key}`}
                    type="number"
                    value={value}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.skinfolds &&
                      Boolean((formik.errors.skinfolds as any)?.[key])
                    }
                    helperText={
                      formik.touched.skinfolds &&
                      (formik.errors.skinfolds as any)?.[key]
                    }
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Perimeters (cm)
                </Typography>
              </Grid>
              {Object.entries(formik.values.perimeters).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                  <TextField
                    fullWidth
                    id={`perimeters.${key}`}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={`perimeters.${key}`}
                    type="number"
                    value={value}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.perimeters &&
                      Boolean((formik.errors.perimeters as any)?.[key])
                    }
                    helperText={
                      formik.touched.perimeters &&
                      (formik.errors.perimeters as any)?.[key]
                    }
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="bodyFatPercentage"
                  label="Body Fat (%)"
                  name="bodyFatPercentage"
                  type="number"
                  value={formik.values.bodyFatPercentage}
                  onChange={formik.handleChange}
                  error={formik.touched.bodyFatPercentage && Boolean(formik.errors.bodyFatPercentage)}
                  helperText={formik.touched.bodyFatPercentage && formik.errors.bodyFatPercentage}
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
              Add Measurement
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddMeasurementForm; 