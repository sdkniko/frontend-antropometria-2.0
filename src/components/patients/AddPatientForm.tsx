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
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { users } from '../../services/api';
import { User } from '../../types';

type Gender = 'male' | 'female' | 'other';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender;
  age: string;
  country: string;
  sport: string;
  position: string;
}

const AddPatientForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string>('');

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'male',
      age: '',
      country: '',
      sport: '',
      position: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
      gender: Yup.string()
        .oneOf(['male', 'female', 'other'] as const)
        .required('Gender is required'),
      age: Yup.number()
        .min(0, 'Age must be positive')
        .integer('Age must be a whole number')
        .required('Age is required'),
      country: Yup.string().trim().required('Country is required'),
      sport: Yup.string(),
      position: Yup.string(),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        setSubmitError('');
        const { confirmPassword, ...patientData } = values;
        
        // Convert numbers and trim strings
        const formattedData: Omit<User, '_id'> = {
          ...patientData,
          age: Number(patientData.age),
          name: patientData.name.trim(),
          country: patientData.country.trim(),
          sport: patientData.sport.trim() || undefined,
          position: patientData.position.trim() || undefined,
          professionalId: user?._id,
          role: 'athlete',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await users.createPatient(formattedData);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Error creating patient:', err);
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
          setSubmitError('An error occurred while creating the patient. Please try again.');
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
            Add New Patient
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
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="gender"
                  name="gender"
                  label="Gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  helperText={formik.touched.gender && formik.errors.gender}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="age"
                  label="Age"
                  name="age"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="country"
                  label="Country"
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  error={formik.touched.country && Boolean(formik.errors.country)}
                  helperText={formik.touched.country && formik.errors.country}
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
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Add Patient
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddPatientForm; 