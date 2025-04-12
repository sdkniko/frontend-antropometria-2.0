import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { measurements, performance, health, users } from '../../services/api';
import { AnthropometricMeasurement, PerformanceMetrics, HealthMetrics, User } from '../../types';
import format from 'date-fns/format';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [measurementsData, setMeasurementsData] = useState<AnthropometricMeasurement[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [healthData, setHealthData] = useState<HealthMetrics[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'professional') {
          const [patientsResponse] = await Promise.all([
            users.getPatients({ limit: 5 }),
          ]);
          setPatients(patientsResponse.data?.patients || []);
        }

        const [measurementsResponse, performanceResponse, healthResponse] = await Promise.all([
          measurements.getAll({ limit: 7 }),
          performance.getAll({ limit: 7 }),
          health.getAll({ limit: 7 }),
        ]);

        setMeasurementsData(measurementsResponse.data?.data || []);
        setPerformanceData(performanceResponse.data?.data || []);
        setHealthData(healthResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays on error
        setMeasurementsData([]);
        setPerformanceData([]);
        setHealthData([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const weightData = (measurementsData || []).map((m) => ({
    date: format(new Date(m.date), 'MMM dd'),
    weight: m.weight,
  }));

  const performanceDataChart = (performanceData || []).map((p) => ({
    date: format(new Date(p.date), 'MMM dd'),
    vo2max: p.vo2max,
    power: p.power,
    speed: p.speed,
  }));

  const healthDataChart = (healthData || []).map((h) => ({
    date: format(new Date(h.date), 'MMM dd'),
    stress: h.stress,
    restingHeartRate: h.restingHeartRate,
    heartRateVariability: h.heartRateVariability,
    sleepDuration: h.sleep?.duration,
    sleepQuality: h.sleep?.quality,
    steps: h.steps
  }));

  if (!measurementsData.length && !performanceData.length && !healthData.length) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          No data available yet. Start by adding your first measurements.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Welcome, {user?.name}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {user?.role === 'professional' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Patients" />
              <CardContent>
                <List>
                  {patients.map((patient) => (
                    <React.Fragment key={patient._id}>
                      <ListItem>
                        <ListItemText
                          primary={patient.name}
                          secondary={`${patient.sport || 'No sport'} - ${patient.position || 'No position'}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} md={user?.role === 'professional' ? 6 : 12}>
          <Card>
            <CardHeader title="Weight Trend" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Performance Metrics" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceDataChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vo2max" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="power" stroke="#ffc658" />
                  <Line type="monotone" dataKey="speed" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Health Metrics" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={healthDataChart}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  
                  {/* Left Y-axis for smaller values (0-200 range) */}
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 'auto']} 
                  />
                  
                  {/* Right Y-axis for step count (larger values) */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[0, 'auto']}
                  />
                  
                  <Tooltip />
                  <Legend />
                  
                  {/* Metrics on left axis (smaller values) */}
                  <Line yAxisId="left" type="monotone" dataKey="stress" stroke="#ff0000" name="Stress Level (%)" />
                  <Line yAxisId="left" type="monotone" dataKey="restingHeartRate" stroke="#0000ff" name="Resting Heart Rate (bpm)" />
                  <Line yAxisId="left" type="monotone" dataKey="heartRateVariability" stroke="#00ff00" name="HRV (ms)" />
                  <Line yAxisId="left" type="monotone" dataKey="sleepDuration" stroke="#ff00ff" name="Sleep Duration (h)" />
                  <Line yAxisId="left" type="monotone" dataKey="sleepQuality" stroke="#ffff00" name="Sleep Quality (%)" />
                  
                  {/* Steps on right axis (larger values) */}
                  <Line yAxisId="right" type="monotone" dataKey="steps" stroke="#00ffff" name="Steps" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 