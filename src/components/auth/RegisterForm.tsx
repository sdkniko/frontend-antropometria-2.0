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
import { User } from '../../types';

type Role = User['role'];

const RegisterForm: React.FC = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string>('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'athlete' as Role,
      gender: '',
      age: '',
      country: '',
      sport: '',
      position: '',
      professionalId: '',
      specialization: '',
      licenseNumber: '',
      yearsOfExperience: '',
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
      role: Yup.string().oneOf(['athlete', 'professional'] as const).required(),
      gender: Yup.string().when('role', {
        is: 'athlete',
        then: (schema: Yup.StringSchema) => schema.oneOf(['male', 'female', 'other']).required('Gender is required'),
      }),
      age: Yup.number()
        .min(0, 'Age must be positive')
        .integer('Age must be a whole number')
        .when('role', {
          is: 'athlete',
          then: (schema: Yup.NumberSchema) => schema.required('Age is required'),
        }),
      country: Yup.string().when('role', {
        is: 'athlete',
        then: (schema: Yup.StringSchema) => schema.trim().required('Country is required'),
      }),
      sport: Yup.string(),
      position: Yup.string(),
      professionalId: Yup.string().when('role', {
        is: 'athlete',
        then: (schema: Yup.StringSchema) => 
          schema
            .required('Professional ID is required')
            .matches(/^[0-9a-fA-F]{24}$/, 'Professional ID must be a valid MongoDB ObjectId'),
      }),
      specialization: Yup.string().when('role', {
        is: 'professional',
        then: (schema: Yup.StringSchema) => schema.trim().required('Specialization is required'),
      }),
      licenseNumber: Yup.string().when('role', {
        is: 'professional',
        then: (schema: Yup.StringSchema) => schema.trim().required('License number is required'),
      }),
      yearsOfExperience: Yup.number()
        .min(0, 'Years of experience must be positive')
        .integer('Years of experience must be a whole number')
        .when('role', {
          is: 'professional',
          then: (schema: Yup.NumberSchema) => schema.required('Years of experience is required'),
        }),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        setSubmitError('');
        const { confirmPassword, ...registrationData } = values;
        console.log('Submitting registration data:', registrationData);
        
        // Convert numbers and trim strings
        const formattedData = {
          ...registrationData,
          age: Number(registrationData.age) || undefined,
          yearsOfExperience: Number(registrationData.yearsOfExperience) || undefined,
          name: registrationData.name.trim(),
          country: registrationData.country.trim(),
          specialization: registrationData.specialization.trim(),
          licenseNumber: registrationData.licenseNumber.trim(),
          professionalId: registrationData.role === 'athlete' ? registrationData.professionalId : undefined,
          gender: registrationData.role === 'athlete' ? (registrationData.gender as 'male' | 'female' | 'other') : undefined,
          sport: registrationData.sport.trim() || undefined,
          position: registrationData.position.trim() || undefined,
        };
        
        await register(formattedData);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Registration error:', err);
        if (err.response?.data?.error?.details) {
          // Handle validation errors from backend
          const backendErrors = err.response.data.error.details.reduce((acc: any, error: any) => {
            acc[error.field] = error.message;
            return acc;
          }, {});
          setErrors(backendErrors);
          setSubmitError('Please fix the errors in the form');
        } else if (err.response?.data?.error?.message) {
          // Handle other error messages
          setSubmitError(err.response.data.error.message);
        } else {
          setSubmitError('An error occurred during registration. Please try again.');
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
            Sign up
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
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
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="role"
                  name="role"
                  label="Role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role}
                >
                  <MenuItem value="athlete">Athlete</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                </TextField>
              </Grid>
              {formik.values.role === 'athlete' && (
                <>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="professionalId"
                      label="Professional ID"
                      name="professionalId"
                      value={formik.values.professionalId}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.professionalId &&
                        Boolean(formik.errors.professionalId)
                      }
                      helperText={
                        formik.touched.professionalId && formik.errors.professionalId
                      }
                    />
                  </Grid>
                </>
              )}
              {formik.values.role === 'professional' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="specialization"
                      label="Specialization"
                      name="specialization"
                      value={formik.values.specialization}
                      onChange={formik.handleChange}
                      error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                      helperText={formik.touched.specialization && formik.errors.specialization}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="licenseNumber"
                      label="License Number"
                      name="licenseNumber"
                      value={formik.values.licenseNumber}
                      onChange={formik.handleChange}
                      error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                      helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="yearsOfExperience"
                      label="Years of Experience"
                      name="yearsOfExperience"
                      type="number"
                      value={formik.values.yearsOfExperience}
                      onChange={formik.handleChange}
                      error={formik.touched.yearsOfExperience && Boolean(formik.errors.yearsOfExperience)}
                      helperText={formik.touched.yearsOfExperience && formik.errors.yearsOfExperience}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              Sign Up
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign in
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterForm; 