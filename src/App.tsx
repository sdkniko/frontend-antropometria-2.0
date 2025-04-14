import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import AddPatientForm from './components/patients/AddPatientForm';
import EditPatientForm from './components/patients/EditPatientForm';
import Patients from './components/patients/Patients';
import AddMeasurementForm from './components/measurements/AddMeasurementForm';
import MeasurementsList from './components/measurements/MeasurementsList';
import AddPerformanceForm from './components/performance/AddPerformanceForm';
import PerformanceList from './components/performance/PerformanceList';
import AddHealthForm from './components/health/AddHealthForm';
import HealthList from './components/health/HealthList';
import ReportsList from './components/reports/ReportsList';
import UserProfile from './components/profile/UserProfile';
import GoogleFitData from './components/googlefit/GoogleFitData';
import { SnackbarProvider } from 'notistack';
// import HealthDataPage from './components/health/HealthDataPage';
import StravaDataPage from './components/strava/StravaDataPage';
// import ReportsPage from './components/reports/ReportsPage';
// import SettingsPage from './components/settings/SettingsPage';
import CalendarPage from './components/calendar/CalendarPage';
import ISAKList from './components/isak/ISAKList';
import ISAKForm from './components/isak/ISAKForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <PrivateRoute>
                    <Patients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients/new"
                element={
                  <PrivateRoute>
                    <AddPatientForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients/:id/edit"
                element={
                  <PrivateRoute>
                    <EditPatientForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/measurements"
                element={
                  <PrivateRoute>
                    <MeasurementsList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/measurements/new"
                element={
                  <PrivateRoute>
                    <AddMeasurementForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <PrivateRoute>
                    <PerformanceList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/performance/new"
                element={
                  <PrivateRoute>
                    <AddPerformanceForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/health"
                element={
                  <PrivateRoute>
                    <HealthList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/health/new"
                element={
                  <PrivateRoute>
                    <AddHealthForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <ReportsList />
                  </PrivateRoute>
                }
              />
              <Route path="/google-fit" element={<PrivateRoute><GoogleFitData /></PrivateRoute>} />
              <Route path="/strava" element={<PrivateRoute><StravaDataPage /></PrivateRoute>} />
              <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
              <Route path="/isak" element={<PrivateRoute><ISAKList /></PrivateRoute>} />
              <Route path="/isak/new" element={<PrivateRoute><ISAKForm /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
