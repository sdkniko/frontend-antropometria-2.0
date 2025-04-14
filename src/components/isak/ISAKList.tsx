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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../../contexts/AuthContext';
import { isak } from '../../services/api';
import { ISAKMeasurement } from '../../types';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { isakReferenceValues } from '../../data/isakReferenceValues';
import { ReferenceValue } from '../../types';

const ISAKList: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [measurements, setMeasurements] = useState<ISAKMeasurement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<ISAKMeasurement | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const fetchMeasurements = async () => {
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        if (user?.role !== 'professional') {
            setError('Access denied. Only professionals can view ISAK measurements.');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching ISAK measurements...');
            const response = await isak.getAll();
            console.log('API Response:', response);
            
            if (response.data && Array.isArray(response.data)) {
                console.log('Setting measurements:', response.data);
                setMeasurements(response.data);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                console.log('Setting measurements from data.data:', response.data.data);
                setMeasurements(response.data.data);
            } else {
                console.log('No valid measurements data found in response');
                setMeasurements([]);
            }
            setError(null);
        } catch (error: any) {
            console.error('Error fetching ISAK measurements:', error);
            const errorMessage = error.response?.data?.error?.message || 'Error fetching ISAK measurements';
            setError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Component mounted, fetching measurements...');
        console.log('Current user:', user);
        console.log('Current token:', token);
        console.log('User role:', user?.role);
        fetchMeasurements();
    }, [user, token, enqueueSnackbar]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this measurement?')) {
            return;
        }

        try {
            await isak.delete(id);
            enqueueSnackbar('Measurement deleted successfully', { variant: 'success' });
            fetchMeasurements();
        } catch (error: any) {
            console.error('Error deleting measurement:', error);
            const errorMessage = error.response?.data?.error?.message || 'Error deleting measurement';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    const handleViewDetails = (measurement: ISAKMeasurement) => {
        setSelectedMeasurement(measurement);
        setOpenDialog(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    console.log('Current measurements state:', measurements);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">ISAK Measurements</Typography>
                {user?.role === 'professional' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/isak/new')}
                    >
                        New Measurement
                    </Button>
                )}
            </Box>

            {measurements.length === 0 ? (
                <Alert severity="info">No ISAK measurements found.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>BMI</TableCell>
                                <TableCell>Body Fat %</TableCell>
                                <TableCell>Somatotype</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {measurements.map((measurement) => (
                                <TableRow key={measurement._id}>
                                    <TableCell>{formatDate(measurement.date)}</TableCell>
                                    <TableCell>{measurement.userId.name}</TableCell>
                                    <TableCell>{measurement.calculated.bmi.toFixed(2)}</TableCell>
                                    <TableCell>{measurement.calculated.bodyFatPercentage.toFixed(2)}%</TableCell>
                                    <TableCell>
                                        {measurement.calculated.somatotype.endomorphy.toFixed(1)}-
                                        {measurement.calculated.somatotype.mesomorphy.toFixed(1)}-
                                        {measurement.calculated.somatotype.ectomorphy.toFixed(1)}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewDetails(measurement)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        {user?.role === 'professional' && (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(measurement._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                {selectedMeasurement && (
                    <>
                        <DialogTitle>Measurement Details</DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Basic Data</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography><strong>Mass:</strong> {selectedMeasurement.basicData.mass} kg</Typography>
                                        <Typography><strong>Height:</strong> {selectedMeasurement.basicData.height} cm</Typography>
                                        <Typography><strong>Sitting Height:</strong> {selectedMeasurement.basicData.sittingHeight} cm</Typography>
                                        <Typography><strong>Arm Span:</strong> {selectedMeasurement.basicData.armSpan} cm</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Sex:</strong> {selectedMeasurement.basicData.sex}</Typography>
                                        <Typography><strong>Sport:</strong> {selectedMeasurement.basicData.sport}</Typography>
                                        <Typography><strong>Position:</strong> {selectedMeasurement.basicData.position}</Typography>
                                        <Typography><strong>Ethnicity:</strong> {selectedMeasurement.basicData.ethnicity}</Typography>
                                    </Grid>
                                </Grid>

                                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Calculated Values</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography><strong>BMI:</strong> {selectedMeasurement.calculated.bmi.toFixed(2)}</Typography>
                                        <Typography><strong>Body Fat %:</strong> {selectedMeasurement.calculated.bodyFatPercentage.toFixed(2)}%</Typography>
                                        <Typography><strong>Somatotype:</strong> {selectedMeasurement.calculated.somatotype.endomorphy.toFixed(1)}-{selectedMeasurement.calculated.somatotype.mesomorphy.toFixed(1)}-{selectedMeasurement.calculated.somatotype.ectomorphy.toFixed(1)}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography><strong>Fat Mass:</strong> {selectedMeasurement.calculated.bodyComposition.fatMass.toFixed(2)} kg</Typography>
                                        <Typography><strong>Lean Mass:</strong> {selectedMeasurement.calculated.bodyComposition.leanMass.toFixed(2)} kg</Typography>
                                        <Typography><strong>Bone Mass:</strong> {selectedMeasurement.calculated.bodyComposition.boneMass.toFixed(2)} kg</Typography>
                                        <Typography><strong>Residual Mass:</strong> {selectedMeasurement.calculated.bodyComposition.residualMass.toFixed(2)} kg</Typography>
                                    </Grid>
                                </Grid>

                                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Measurements & Reference Data</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Skinfolds (mm)</Typography>
                                        {selectedMeasurement.skinfolds && Object.entries(selectedMeasurement.skinfolds).map(([key, value]) => {
                                            const reference = isakReferenceValues[key as keyof typeof isakReferenceValues];
                                            return (
                                                <Paper key={key} sx={{ p: 1.5, mb: 1.5, border: '1px solid #eee' }} elevation={0}>
                                                    <Typography variant="body1"><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value?.[0] !== undefined ? `${value[0]} mm` : 'N/A'}</Typography>
                                                    {reference ? (
                                                        <Box sx={{ fontSize: '0.8rem', pl: 1, mt: 0.5, color: 'text.secondary' }}>
                                                            <em>Ref ({reference.sex}):</em>
                                                            <Typography variant="caption" display="block">Mean: {reference.mean.toFixed(1)} (SD: {reference.stdDev.toFixed(1)})</Typography>
                                                            <Typography variant="caption" display="block">Min: {reference.min.toFixed(1)} | Max: {reference.max.toFixed(1)}</Typography>
                                                            <Typography variant="caption" display="block">
                                                                P5: {reference.percentiles.p5.toFixed(1)} | P15: {reference.percentiles.p15.toFixed(1)} | P25: {reference.percentiles.p25.toFixed(1)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block">
                                                                P50: {reference.percentiles.p50.toFixed(1)} | P75: {reference.percentiles.p75.toFixed(1)} | P85: {reference.percentiles.p85.toFixed(1)} | P95: {reference.percentiles.p95.toFixed(1)}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ pl: 1, color: 'text.disabled' }}><em>No reference data available</em></Typography>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Circumferences (cm)</Typography>
                                        {selectedMeasurement.circumferences && Object.entries(selectedMeasurement.circumferences).map(([key, value]) => {
                                            const refKey = key === 'calf' ? 'calfCircumference' : key;
                                            const reference = isakReferenceValues[refKey as keyof typeof isakReferenceValues];
                                            return (
                                                <Paper key={key} sx={{ p: 1.5, mb: 1.5, border: '1px solid #eee' }} elevation={0}>
                                                    <Typography variant="body1"><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value?.[0] !== undefined ? `${value[0]} cm` : 'N/A'}</Typography>
                                                    {reference ? (
                                                        <Box sx={{ fontSize: '0.8rem', pl: 1, mt: 0.5, color: 'text.secondary' }}>
                                                            <em>Ref ({reference.sex}):</em>
                                                            <Typography variant="caption" display="block">Mean: {reference.mean.toFixed(1)} (SD: {reference.stdDev.toFixed(1)})</Typography>
                                                            <Typography variant="caption" display="block">Min: {reference.min.toFixed(1)} | Max: {reference.max.toFixed(1)}</Typography>
                                                            <Typography variant="caption" display="block">
                                                                P5: {reference.percentiles.p5.toFixed(1)} | P15: {reference.percentiles.p15.toFixed(1)} | P25: {reference.percentiles.p25.toFixed(1)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block">
                                                                P50: {reference.percentiles.p50.toFixed(1)} | P75: {reference.percentiles.p75.toFixed(1)} | P85: {reference.percentiles.p85.toFixed(1)} | P95: {reference.percentiles.p95.toFixed(1)}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ pl: 1, color: 'text.disabled' }}><em>No reference data available</em></Typography>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Diameters (cm)</Typography>
                                        {selectedMeasurement.diameters && Object.entries(selectedMeasurement.diameters).map(([key, value]) => {
                                            const reference = isakReferenceValues[key as keyof typeof isakReferenceValues];
                                            return (
                                                <Paper key={key} sx={{ p: 1.5, mb: 1.5, border: '1px solid #eee' }} elevation={0}>
                                                    <Typography variant="body1"><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value?.[0] !== undefined ? `${value[0]} cm` : 'N/A'}</Typography>
                                                     {reference ? (
                                                        <Box sx={{ fontSize: '0.8rem', pl: 1, mt: 0.5, color: 'text.secondary' }}>
                                                            <em>Ref ({reference.sex}):</em>
                                                            <Typography variant="caption" display="block">Mean: {reference.mean.toFixed(1)} (SD: {reference.stdDev.toFixed(1)})</Typography>
                                                            <Typography variant="caption" display="block">Min: {reference.min.toFixed(1)} | Max: {reference.max.toFixed(1)}</Typography>
                                                            <Typography variant="caption" display="block">
                                                                P5: {reference.percentiles.p5.toFixed(1)} | P15: {reference.percentiles.p15.toFixed(1)} | P25: {reference.percentiles.p25.toFixed(1)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block">
                                                                P50: {reference.percentiles.p50.toFixed(1)} | P75: {reference.percentiles.p75.toFixed(1)} | P85: {reference.percentiles.p85.toFixed(1)} | P95: {reference.percentiles.p95.toFixed(1)}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ pl: 1, color: 'text.disabled' }}><em>No reference data available</em></Typography>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Grid>
                                </Grid>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default ISAKList; 