import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { users, integrations } from '../../services/api';
import { User, IntegrationStatus } from '../../types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  InputAdornment
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LockIcon from '@mui/icons-material/Lock';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoginIcon from '@mui/icons-material/Login';

const UserProfile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [googleFitStatus, setGoogleFitStatus] = useState<IntegrationStatus>('idle');
  const [stravaStatus, setStravaStatus] = useState<IntegrationStatus>('idle');
  const [trainingPeaksStatus, setTrainingPeaksStatus] = useState<IntegrationStatus>('idle');
  const [tpModalOpen, setTpModalOpen] = useState(false);
  const [tpSubmitError, setTpSubmitError] = useState<string | null>(null);
  const [tpLoading, setTpLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      gender: '',
      age: '',
      country: '',
      sport: '',
      position: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      gender: Yup.string().oneOf(['male', 'female', 'other', '']).optional(),
      age: Yup.number().min(0, 'Age must be positive').optional().nullable(),
      country: Yup.string().optional(),
      sport: Yup.string().optional(),
      position: Yup.string().optional(),
    }),
    onSubmit: async (values) => {
      setError(null);
      try {
        const updatedFields: any = {};
        Object.keys(values).forEach((key) => {
            const formKey = key as keyof typeof values;
            const userKey = key as keyof User;
            if (formKey === 'age') {
                 if (Number(values.age) !== user?.age) {
                    updatedFields.age = values.age ? Number(values.age) : undefined;
                 }
            } else if (values[formKey] !== user?.[userKey]) {
                 updatedFields[userKey] = values[formKey]; 
            }
        });

        if (Object.keys(updatedFields).length === 0) {
            enqueueSnackbar('No changes detected', { variant: 'info' });
            return;
        }

        if (updatedFields.gender === '') updatedFields.gender = undefined;
        if (updatedFields.country === '') updatedFields.country = undefined;
        if (updatedFields.sport === '') updatedFields.sport = undefined;
        if (updatedFields.position === '') updatedFields.position = undefined;

        if (updatedFields.age === '') updatedFields.age = undefined;
        else if (updatedFields.age !== undefined) updatedFields.age = Number(updatedFields.age);

        const response = await users.updateProfile(updatedFields as Partial<User>);
        setUser(response.data);
        enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      } catch (err: any) {
        console.error("Profile update error:", err);
        const errorMsg = err.response?.data?.error?.message || 'Failed to update profile';
        setError(errorMsg);
        enqueueSnackbar(errorMsg, { variant: 'error' });
      }
    },
  });

  const tpFormik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('TrainingPeaks username is required'),
      password: Yup.string().required('TrainingPeaks password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setTpSubmitError(null);
      setTpLoading(true);
      try {
        const result = await integrations.saveTrainingPeaksCredentials(values);
        setTrainingPeaksStatus('connected');
        setUser(prev => prev ? { ...prev, trainingPeaksConnected: true, trainingPeaksUsername: result.trainingPeaksUsername } : null);
        enqueueSnackbar(result.message || 'TrainingPeaks connected!', { variant: 'success' });
        handleCloseTpModal();
      } catch (err: any) {
        console.error("TP Credential Save Error:", err);
        setTpSubmitError(err.message || 'Failed to save credentials. Please check username/password.');
      } finally {
        setTpLoading(false);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      if (user) {
          formik.setValues({
              name: user.name || '',
              email: user.email || '',
              gender: user.gender || '',
              age: user.age?.toString() || '',
              country: user.country || '',
              sport: user.sport || '',
              position: user.position || ''
          });
          setLoading(false);
          setGoogleFitStatus(user.googleFitConnected ? 'connected' : 'disconnected');
          setStravaStatus(user.stravaConnected ? 'connected' : 'disconnected');
          setTrainingPeaksStatus(user.trainingPeaksConnected ? 'connected' : 'disconnected');
      } else {
          try {
              const response = await users.getProfile();
              formik.setValues({
                name: response.data.name || '',
                email: response.data.email || '',
                gender: response.data.gender || '',
                age: response.data.age?.toString() || '',
                country: response.data.country || '',
                sport: response.data.sport || '',
                position: response.data.position || ''
            });
            setGoogleFitStatus(response.data.googleFitConnected ? 'connected' : 'disconnected');
            setStravaStatus(response.data.stravaConnected ? 'connected' : 'disconnected');
            setTrainingPeaksStatus(response.data.trainingPeaksConnected ? 'connected' : 'disconnected');
          } catch (fetchError) {
              console.error("Error fetching profile:", fetchError);
              setError('Could not load profile data.');
          } finally {
              setLoading(false);
          }
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const integration = params.get('integration');
    const status = params.get('status');
    const message = params.get('message');

    if (integration && status) {
        const displayMessage = message ? decodeURIComponent(message) : null;
        if (status === 'success') {
            enqueueSnackbar(`${integration.charAt(0).toUpperCase() + integration.slice(1)} connected successfully! Reloading profile...`, { variant: 'success' });
            setTimeout(() => window.location.reload(), 2000);
        } else if (status === 'error') {
            setError(`Error connecting ${integration}: ${displayMessage || 'Unknown error'}`);
        }
        navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleDeleteAccount = async () => {
    setOpenDeleteConfirm(false);
    try {
      await users.deleteProfile();
      enqueueSnackbar('Account deleted successfully', { variant: 'success' });
      logout();
      navigate('/login');
    } catch (err: any) {
        console.error("Delete account error:", err);
        const errorMsg = err.response?.data?.error?.message || 'Failed to delete account';
        setError(errorMsg);
        enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleGoogleFitConnect = () => {
      if (!user?._id) {
        enqueueSnackbar('User ID not found. Cannot connect.', { variant: 'error' });
        return;
      }
      const connectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/integrations/googlefit/connect?userId=${user._id}`;
      window.location.href = connectUrl;
      setGoogleFitStatus('connecting');
  };

  const handleGoogleFitDisconnect = async () => {
      if (!user?.googleFitConnected) return;

      try {
          const response = await integrations.disconnectGoogleFit();
          enqueueSnackbar(response.data.message || 'Google Fit disconnected', { variant: 'success' });
          const profileResponse = await users.getProfile();
          setUser(profileResponse.data);
      } catch (err: any) {
          console.error("Google Fit disconnect error:", err);
          const errorMsg = err.response?.data?.error?.message || 'Failed to disconnect Google Fit';
          setError(errorMsg);
          enqueueSnackbar(errorMsg, { variant: 'error' });
      }
  };

  const handleStravaConnect = () => {
      if (!user?._id) {
        enqueueSnackbar('User ID not found. Cannot connect Strava.', { variant: 'error' });
        return;
      }
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 
      const connectUrl = `${backendUrl}/integrations/strava/connect?userId=${user._id}`;
      console.log("Redirecting to Strava connect URL:", connectUrl);
      window.location.href = connectUrl;
      setStravaStatus('connecting');
  };

  const handleStravaDisconnect = async () => {
      if (!user?.stravaConnected) return;

      try {
          const response = await integrations.disconnectStrava(); 
          enqueueSnackbar(response.message || 'Strava disconnected', { variant: 'success' });
          const profileResponse = await users.getProfile();
          setUser(profileResponse.data);
      } catch (err: any) {
          console.error("Strava disconnect error:", err);
          const errorMsg = err.response?.data?.error?.message || 'Failed to disconnect Strava';
          setError(errorMsg);
          enqueueSnackbar(errorMsg, { variant: 'error' });
      }
  };

  const handleOpenTpModal = () => setTpModalOpen(true);
  const handleCloseTpModal = () => {
    setTpModalOpen(false);
    setTpSubmitError(null);
    tpFormik.resetForm();
  };

  const handleDisconnectTrainingPeaks = async () => {
    if (window.confirm('Are you sure you want to disconnect TrainingPeaks? This will remove your saved credentials.')) {
      setTrainingPeaksStatus('disconnecting');
      setError(null);
      try {
        await integrations.disconnectTrainingPeaks();
        setTrainingPeaksStatus('disconnected');
        setUser(prev => prev ? { ...prev, trainingPeaksConnected: false, trainingPeaksUsername: undefined } : null);
      } catch (err: any) {
        setError(err.message || 'Failed to disconnect TrainingPeaks.');
        setTrainingPeaksStatus('connected');
      }
    }
  };

  const handleTpScrapeLogin = async () => {
      setTrainingPeaksStatus('syncing');
      setError(null);
      try {
          const result = await integrations.triggerTrainingPeaksLoginScrape();
          enqueueSnackbar(result.message || 'TrainingPeaks login scrape initiated.', { variant: 'success' });
      } catch (err: any) {
          setError(err.message || 'TrainingPeaks login scrape failed.');
          enqueueSnackbar(err.message || 'TrainingPeaks login scrape failed.', { variant: 'error' });
      } finally {
          setTrainingPeaksStatus(user?.trainingPeaksConnected ? 'connected' : 'disconnected');
      }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Your Profile
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        labelId="gender-label"
                        id="gender"
                        name="gender"
                        label="Gender"
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    >
                        <MenuItem value=""><em>Not Specified</em></MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </Select>
                     {formik.touched.gender && formik.errors.gender && (
                        <Alert severity="error" sx={{ mt: 1 }}>{formik.errors.gender}</Alert>
                    )}
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="age"
                name="age"
                label="Age"
                type="number"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.age && Boolean(formik.errors.age)}
                helperText={formik.touched.age && formik.errors.age}
                 inputProps={{ min: 0 }}
              />
            </Grid>
             <Grid item xs={12}>
              <TextField
                fullWidth
                id="country"
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              />
            </Grid>
            {user?.role === 'athlete' && (
                <>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="sport"
                            name="sport"
                            label="Sport"
                            value={formik.values.sport}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.sport && Boolean(formik.errors.sport)}
                            helperText={formik.touched.sport && formik.errors.sport}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="position"
                            name="position"
                            label="Position"
                            value={formik.values.position}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.position && Boolean(formik.errors.position)}
                            helperText={formik.touched.position && formik.errors.position}
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
            disabled={formik.isSubmitting || !formik.dirty}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
            Integrations
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GoogleIcon />
            <Typography sx={{ flexGrow: 1 }}>Google Fit</Typography>
            {googleFitStatus === 'connected' ? (
                <Button 
                    variant="contained" 
                    color="warning"
                    startIcon={<LinkOffIcon />}
                    onClick={handleGoogleFitDisconnect}
                >
                    Disconnect
                </Button>
            ) : (
                <Button 
                    variant="contained" 
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleFitConnect}
                >
                    Connect
                </Button>
            )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DirectionsRunIcon />
            <Typography sx={{ flexGrow: 1 }}>Strava</Typography>
            {stravaStatus === 'connected' ? (
                <Button 
                    variant="contained" 
                    color="warning"
                    startIcon={<LinkOffIcon />}
                    onClick={handleStravaDisconnect}
                >
                    Disconnect
                </Button>
            ) : (
                <Button 
                    variant="contained" 
                    sx={{ backgroundColor: '#fc4c02', ':hover': { backgroundColor: '#e64402' } }}
                    startIcon={<DirectionsRunIcon />}
                    onClick={handleStravaConnect}
                >
                    Connect
                </Button>
            )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountTreeIcon />
            <Typography sx={{ flexGrow: 1 }}>TrainingPeaks</Typography>
            {trainingPeaksStatus === 'connected' ? (
                <Box sx={{ textAlign: 'right', display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Connected as: {user?.trainingPeaksUsername || 'N/A'}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={(trainingPeaksStatus as any) === 'syncing' ? <CircularProgress size={16} /> : <LoginIcon />}
                        onClick={handleTpScrapeLogin}
                        disabled={(trainingPeaksStatus as any) === 'syncing' || (trainingPeaksStatus as any) === 'disconnecting'}
                    >
                       {(trainingPeaksStatus as any) === 'syncing' ? 'Logging in...' : 'Scrape Login'}
                    </Button>
                    <Button 
                        variant="contained" 
                        size="small"
                        color="warning"
                        startIcon={<LinkOffIcon />}
                        onClick={handleDisconnectTrainingPeaks}
                        disabled={(trainingPeaksStatus as any) === 'disconnecting' || (trainingPeaksStatus as any) === 'syncing'}
                    >
                        {(trainingPeaksStatus as any) === 'disconnecting' ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                </Box>
            ) : (
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AccountTreeIcon />}
                    onClick={handleOpenTpModal}
                >
                    Connect
                </Button>
            )}
        </Box>

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" color="error" gutterBottom>
            Danger Zone
        </Typography>
        <Button 
            variant="outlined" 
            color="error" 
            fullWidth
            onClick={() => setOpenDeleteConfirm(true)}
        >
            Delete My Account
        </Button>
      </Paper>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Account Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete your account? This action cannot be undone.
             All your associated data (measurements, performance, health) will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tpModalOpen} onClose={handleCloseTpModal} >
        <DialogTitle>Connect TrainingPeaks</DialogTitle>
        <Box component="form" onSubmit={tpFormik.handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter your TrainingPeaks username and password below. 
            </DialogContentText>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Security Warning:</strong> Your TrainingPeaks credentials will be stored securely but within our system. This is less secure than official integrations using OAuth. Proceed only if you understand and accept the risks. Consider using a unique password for TrainingPeaks.
            </Alert>
            <TextField
              autoFocus
              margin="dense"
              id="tp-username"
              name="username"
              label="TrainingPeaks Username"
              type="text"
              fullWidth
              variant="standard"
              value={tpFormik.values.username}
              onChange={tpFormik.handleChange}
              onBlur={tpFormik.handleBlur}
              error={tpFormik.touched.username && Boolean(tpFormik.errors.username)}
              helperText={tpFormik.touched.username && tpFormik.errors.username}
              disabled={tpLoading}
            />
            <TextField
              margin="dense"
              id="tp-password"
              name="password"
              label="TrainingPeaks Password"
              type="password"
              fullWidth
              variant="standard"
              value={tpFormik.values.password}
              onChange={tpFormik.handleChange}
              onBlur={tpFormik.handleBlur}
              error={tpFormik.touched.password && Boolean(tpFormik.errors.password)}
              helperText={tpFormik.touched.password && tpFormik.errors.password}
              disabled={tpLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            {tpSubmitError && (
              <Alert severity="error" sx={{ mt: 2 }}>{tpSubmitError}</Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseTpModal} disabled={tpLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={tpLoading || !tpFormik.isValid || !tpFormik.dirty}>
              {tpLoading ? <CircularProgress size={24} /> : 'Save & Connect'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default UserProfile; 