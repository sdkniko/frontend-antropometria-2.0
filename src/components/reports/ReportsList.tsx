import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'; // Icon for download
import ShareIcon from '@mui/icons-material/Share'; // Icon for share
import { useAuth } from '../../contexts/AuthContext';
import { reports, users } from '../../services/api'; // Use reports API
import { Report, User } from '../../types'; // Use Report type
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';

const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [patients, setPatients] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reportsResponse = await reports.getAll(); // Fetch reports data
        setReportsData(reportsResponse.data?.data || []);

        if (user?.role === 'professional') {
          const patientsResponse = await users.getPatients();
          setPatients(patientsResponse.data?.patients || []);
        } else {
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching reports data:', error);
        setReportsData([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getPatientName = (userId: string): string => {
    const patient = patients.find(p => p._id === userId);
    return patient ? patient.name : 'All Patients'; // Handle group reports
  };

  const handleDownload = (reportId: string, format: 'pdf' | 'excel') => {
    // TODO: Implement actual download logic
    console.log(`Downloading report ${reportId} as ${format}`);
    // Example: window.location.href = `${API_URL}/reports/${reportId}/download?format=${format}`;
     alert('Download functionality not implemented yet.');
  };

  const handleShare = (reportId: string) => {
    // TODO: Implement sharing logic (e.g., generate link, show modal)
    console.log(`Sharing report ${reportId}`);
     alert('Share functionality not implemented yet.');
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports</Typography>
        {/* TODO: Add Generate Report Button if needed */}
        {/* <Button variant="contained" color="primary" onClick={() => navigate('/reports/new')}>Generate New Report</Button> */}
      </Box>

      {reportsData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No reports generated yet.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role === 'professional' && <TableCell>Patient / Group</TableCell>}
                <TableCell>Type</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportsData.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                  {user?.role === 'professional' && <TableCell>{getPatientName(report.userId)}</TableCell>}
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.format}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDownload(report._id, report.format)} title="Download">
                      <DownloadIcon />
                    </IconButton>
                     {report.shared && (
                       <IconButton size="small" onClick={() => handleShare(report._id)} title="Share">
                         <ShareIcon />
                       </IconButton>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReportsList; 