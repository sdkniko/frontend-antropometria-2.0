import React, { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { users } from '../../services/api';
import { User } from '../../types';

type Gender = 'male' | 'female' | 'other';

const EditPatientForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      try {
        const response = await users.getPatientDetails(id);
        setPatient(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: patient?.name || '',
      email: patient?.email || '',
      gender: (patient?.gender as Gender) || '',
      age: patient?.age?.toString() || '',
      country: patient?.country || '',
      sport: patient?.sport || '',
      position: patient?.position || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      gender: Yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
      age: Yup.number()
        .min(0, 'Age must be positive')
        .integer('Age must be a whole number')
        .required('Age is required'),
      country: Yup.string().trim().required('Country is required'),
      sport: Yup.string(),
      position: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!id) return;
      try {
        const response = await users.updatePatient(id, {
          name: values.name.trim(),
          email: values.email.trim(),
          gender: values.gender,
          age: parseInt(values.age),
          country: values.country.trim(),
          sport: values.sport.trim() || undefined,
          position: values.position.trim() || undefined,
        });
        if (response.data) {
          navigate('/patients');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to update patient');
      }
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box p={3}>
        <Alert severity="error">Patient not found</Alert>
      </Box>
    );
  }

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
            Edit Patient
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
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
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/patients')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditPatientForm; 