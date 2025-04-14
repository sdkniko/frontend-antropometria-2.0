import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    FormHelperText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { isak, users } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ISAKMeasurement, User, ReferenceValue } from '../../types';
import { isakReferenceValues } from '../../data/isakReferenceValues';

type MeasurementPair = [number, number];
type Ethnicity = 'Asian' | 'African' | 'Caucasian';

interface FormValues {
    selectedPatientId: string;
    basicData: {
        mass: number;
        height: number;
        sittingHeight: number;
        armSpan: number;
        birthDate: Date;
        sex: 'M' | 'F';
        sport: string;
        position: string;
        ethnicity: Ethnicity;
    };
    skinfolds: {
        triceps: MeasurementPair;
        subscapular: MeasurementPair;
        biceps: MeasurementPair;
        iliacCrest: MeasurementPair;
        suprailiac: MeasurementPair;
        abdominal: MeasurementPair;
        thigh: MeasurementPair;
        calf: MeasurementPair;
    };
    circumferences: {
        relaxedArm: MeasurementPair;
        flexedArm: MeasurementPair;
        waist: MeasurementPair;
        hip: MeasurementPair;
        midThigh: MeasurementPair;
        calf: MeasurementPair;
    };
    diameters: {
        humerus: MeasurementPair;
        femur: MeasurementPair;
        biestyloid: MeasurementPair;
    };
    calculated: {
        bmi: number;
        bodyFatPercentage: number;
        somatotype: {
            endomorphy: number;
            mesomorphy: number;
            ectomorphy: number;
        };
        bodyComposition: {
            fatMass: number;
            leanMass: number;
            boneMass: number;
            residualMass: number;
        };
        percentiles: {
            [key: string]: number;
        };
    };
}

const validationSchema = Yup.object({
    selectedPatientId: Yup.string().required('Please select a patient'),
    basicData: Yup.object({
        mass: Yup.number().required('Mass is required').min(0, 'Mass must be positive'),
        height: Yup.number().required('Height is required').min(0, 'Height must be positive'),
        sittingHeight: Yup.number().required('Sitting height is required').min(0, 'Sitting height must be positive'),
        armSpan: Yup.number().required('Arm span is required').min(0, 'Arm span must be positive'),
        birthDate: Yup.date().required('Birth date is required'),
        sex: Yup.string().oneOf(['M', 'F']).required('Sex is required'),
        sport: Yup.string().required('Sport is required'),
        position: Yup.string().required('Position is required'),
        ethnicity: Yup.string().oneOf(['Asian', 'African', 'Caucasian']).required('Ethnicity is required'),
    }),
    skinfolds: Yup.object({
        triceps: Yup.array().of(Yup.number().min(0)).length(2).required(),
        subscapular: Yup.array().of(Yup.number().min(0)).length(2).required(),
        biceps: Yup.array().of(Yup.number().min(0)).length(2).required(),
        iliacCrest: Yup.array().of(Yup.number().min(0)).length(2).required(),
        suprailiac: Yup.array().of(Yup.number().min(0)).length(2).required(),
        abdominal: Yup.array().of(Yup.number().min(0)).length(2).required(),
        thigh: Yup.array().of(Yup.number().min(0)).length(2).required(),
        calf: Yup.array().of(Yup.number().min(0)).length(2).required(),
    }),
    circumferences: Yup.object({
        relaxedArm: Yup.array().of(Yup.number().min(0)).length(2).required(),
        flexedArm: Yup.array().of(Yup.number().min(0)).length(2).required(),
        waist: Yup.array().of(Yup.number().min(0)).length(2).required(),
        hip: Yup.array().of(Yup.number().min(0)).length(2).required(),
        midThigh: Yup.array().of(Yup.number().min(0)).length(2).required(),
        calf: Yup.array().of(Yup.number().min(0)).length(2).required(),
    }),
    diameters: Yup.object({
        humerus: Yup.array().of(Yup.number().min(0)).length(2).required(),
        femur: Yup.array().of(Yup.number().min(0)).length(2).required(),
        biestyloid: Yup.array().of(Yup.number().min(0)).length(2).required(),
    }),
});

const ISAKForm: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<User[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await users.getPatients();
                setPatients(response.data.patients);
            } catch (error) {
                console.error('Error fetching patients:', error);
                enqueueSnackbar('Error fetching patients', { variant: 'error' });
            } finally {
                setPatientsLoading(false);
            }
        };

        if (user?.role === 'professional') {
            fetchPatients();
        }
    }, [user, enqueueSnackbar]);

    const calculatePercentile = (value: number, reference: ReferenceValue) => {
        const zScore = (value - reference.mean) / reference.stdDev;
        const percentile = (0.5 * (1 + erf(zScore / Math.sqrt(2)))) * 100;
        return Math.round(percentile * 10) / 10;
    };

    const calculateAllPercentiles = (values: FormValues) => {
        const percentiles: { [key: string]: number } = {};
        
        // Calculate percentiles for skinfolds
        Object.entries(values.skinfolds).forEach(([key, value]) => {
            const reference = isakReferenceValues[key as keyof typeof isakReferenceValues];
            if (reference && value[0] > 0) {
                percentiles[`skinfolds.${key}`] = calculatePercentile(value[0], reference);
            }
        });

        // Calculate percentiles for circumferences
        Object.entries(values.circumferences).forEach(([key, value]) => {
            const reference = isakReferenceValues[key as keyof typeof isakReferenceValues];
            if (reference && value[0] > 0) {
                percentiles[`circumferences.${key}`] = calculatePercentile(value[0], reference);
            }
        });

        // Calculate percentiles for diameters
        Object.entries(values.diameters).forEach(([key, value]) => {
            const reference = isakReferenceValues[key as keyof typeof isakReferenceValues];
            if (reference && value[0] > 0) {
                percentiles[`diameters.${key}`] = calculatePercentile(value[0], reference);
            }
        });

        return percentiles;
    };

    const formik = useFormik<FormValues>({
        initialValues: {
            selectedPatientId: '',
            basicData: {
                mass: 0,
                height: 0,
                sittingHeight: 0,
                armSpan: 0,
                birthDate: new Date(),
                sex: 'M',
                sport: '',
                position: '',
                ethnicity: 'Caucasian' as Ethnicity,
            },
            skinfolds: {
                triceps: [0, 0],
                subscapular: [0, 0],
                biceps: [0, 0],
                iliacCrest: [0, 0],
                suprailiac: [0, 0],
                abdominal: [0, 0],
                thigh: [0, 0],
                calf: [0, 0],
            },
            circumferences: {
                relaxedArm: [0, 0],
                flexedArm: [0, 0],
                waist: [0, 0],
                hip: [0, 0],
                midThigh: [0, 0],
                calf: [0, 0],
            },
            diameters: {
                humerus: [0, 0],
                femur: [0, 0],
                biestyloid: [0, 0],
            },
            calculated: {
                bmi: 0,
                bodyFatPercentage: 0,
                somatotype: {
                    endomorphy: 0,
                    mesomorphy: 0,
                    ectomorphy: 0,
                },
                bodyComposition: {
                    fatMass: 0,
                    leanMass: 0,
                    boneMass: 0,
                    residualMass: 0,
                },
                percentiles: {},
            },
        },
        validationSchema,
        onSubmit: async (values) => {
            if (user?.role !== 'professional') {
                enqueueSnackbar('Only professionals can create ISAK measurements', { variant: 'error' });
                return;
            }

            setLoading(true);
            try {
                // Calculate all percentiles before submission
                const percentiles = calculateAllPercentiles(values);
                const updatedValues = {
                    ...values,
                    calculated: {
                        ...values.calculated,
                        percentiles,
                    },
                };

                // Create the measurement data without the selectedPatientId
                const { selectedPatientId, ...measurementData } = updatedValues;

                // Get the current user from localStorage
                const currentUser = localStorage.getItem('user');
                if (!currentUser) {
                    enqueueSnackbar('User not found. Please log in again.', { variant: 'error' });
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(currentUser);
                console.log('Current user data:', userData);
                console.log('Selected patient ID:', selectedPatientId);

                // Convert dates to ISO strings and format the data according to the schema
                const formattedData = {
                    userId: selectedPatientId,
                    professionalId: user?._id,
                    date: new Date().toISOString(),
                    basicData: {
                        ...measurementData.basicData,
                        birthDate: new Date(measurementData.basicData.birthDate).toISOString().split('T')[0],
                    },
                    skinfolds: measurementData.skinfolds,
                    circumferences: measurementData.circumferences,
                    diameters: measurementData.diameters,
                    calculated: {
                        bmi: measurementData.calculated.bmi,
                        bodyFatPercentage: measurementData.calculated.bodyFatPercentage,
                        somatotype: measurementData.calculated.somatotype,
                        bodyComposition: measurementData.calculated.bodyComposition,
                        percentiles: measurementData.calculated.percentiles
                    }
                };

                // Check if professionalId is available
                if (!formattedData.professionalId) {
                    enqueueSnackbar('Professional ID not found. Please log in again.', { variant: 'error' });
                    setLoading(false);
                    return;
                }

                console.log('Formatted data for submission:', formattedData);

                const response = await isak.create(formattedData);
                console.log('Server response:', response);

                enqueueSnackbar('ISAK measurement created successfully', { variant: 'success' });
                navigate('/isak');
            } catch (error: any) {
                console.error('Error creating ISAK measurement:', error);
                const errorMessage = error.response?.data?.error?.message || 'Error creating ISAK measurement';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            } finally {
                setLoading(false);
            }
        },
    });

    const renderMeasurementInputs = (
        measurements: Record<string, MeasurementPair>,
        formik: any,
        referenceValues: any,
        category: 'skinfolds' | 'circumferences' | 'diameters'
    ) => {
        return Object.entries(measurements).map(([key, value]) => {
            const reference = referenceValues[key];
            const currentValue = value[0];
            const percentile = calculatePercentile(currentValue, reference);
            
            return (
                <Grid item xs={12} sm={6} key={key}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            name={`${category}.${key}[0]`}
                            value={value[0]}
                            onChange={(e) => {
                                const newValue: MeasurementPair = [parseFloat(e.target.value), value[1]];
                                formik.setFieldValue(`${category}.${key}`, newValue);
                            }}
                            error={formik.touched[category]?.[key]?.[0] && Boolean(formik.errors[category]?.[key]?.[0])}
                            helperText={formik.touched[category]?.[key]?.[0] && formik.errors[category]?.[key]?.[0]}
                            label="Measurement"
                            sx={{ mb: 2 }}
                        />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Statistic</TableCell>
                                        <TableCell align="right">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Reference Mean</TableCell>
                                        <TableCell align="right">{reference.mean}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Standard Deviation</TableCell>
                                        <TableCell align="right">{reference.stdDev}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Current Percentile</TableCell>
                                        <TableCell align="right">{percentile}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            );
        });
    };

    // Error function approximation
    const erf = (x: number) => {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                New ISAK Measurement
            </Typography>

            {user?.role !== 'professional' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Only professionals can create ISAK measurements
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Select Patient
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={formik.touched.selectedPatientId && Boolean(formik.errors.selectedPatientId)}>
                                <InputLabel>Patient</InputLabel>
                                <Select
                                    value={formik.values.selectedPatientId}
                                    onChange={(e) => formik.setFieldValue('selectedPatientId', e.target.value)}
                                    label="Patient"
                                >
                                    {patientsLoading ? (
                                        <MenuItem disabled>Loading patients...</MenuItem>
                                    ) : patients.length === 0 ? (
                                        <MenuItem disabled>No patients found</MenuItem>
                                    ) : (
                                        patients.map((patient) => (
                                            <MenuItem key={patient._id} value={patient._id}>
                                                {patient.name} ({patient.email})
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {formik.touched.selectedPatientId && formik.errors.selectedPatientId && (
                                    <Typography color="error" variant="caption">
                                        {formik.errors.selectedPatientId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Basic Data
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Mass (kg)"
                                {...formik.getFieldProps('basicData.mass')}
                                error={formik.touched.basicData?.mass && Boolean(formik.errors.basicData?.mass)}
                                helperText={formik.touched.basicData?.mass && formik.errors.basicData?.mass}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Height (cm)"
                                {...formik.getFieldProps('basicData.height')}
                                error={formik.touched.basicData?.height && Boolean(formik.errors.basicData?.height)}
                                helperText={formik.touched.basicData?.height && formik.errors.basicData?.height}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Sitting Height (cm)"
                                {...formik.getFieldProps('basicData.sittingHeight')}
                                error={formik.touched.basicData?.sittingHeight && Boolean(formik.errors.basicData?.sittingHeight)}
                                helperText={formik.touched.basicData?.sittingHeight && formik.errors.basicData?.sittingHeight}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Arm Span (cm)"
                                {...formik.getFieldProps('basicData.armSpan')}
                                error={formik.touched.basicData?.armSpan && Boolean(formik.errors.basicData?.armSpan)}
                                helperText={formik.touched.basicData?.armSpan && formik.errors.basicData?.armSpan}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Birth Date"
                                InputLabelProps={{ shrink: true }}
                                {...formik.getFieldProps('basicData.birthDate')}
                                error={formik.touched.basicData?.birthDate && Boolean(formik.errors.basicData?.birthDate)}
                                helperText={formik.touched.basicData?.birthDate && formik.errors.basicData?.birthDate ? String(formik.errors.basicData.birthDate) : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Sex</InputLabel>
                                <Select
                                    label="Sex"
                                    {...formik.getFieldProps('basicData.sex')}
                                    error={formik.touched.basicData?.sex && Boolean(formik.errors.basicData?.sex)}
                                >
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Sport"
                                {...formik.getFieldProps('basicData.sport')}
                                error={formik.touched.basicData?.sport && Boolean(formik.errors.basicData?.sport)}
                                helperText={formik.touched.basicData?.sport && formik.errors.basicData?.sport}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Position"
                                {...formik.getFieldProps('basicData.position')}
                                error={formik.touched.basicData?.position && Boolean(formik.errors.basicData?.position)}
                                helperText={formik.touched.basicData?.position && formik.errors.basicData?.position}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Ethnicity</InputLabel>
                                <Select
                                    label="Ethnicity"
                                    {...formik.getFieldProps('basicData.ethnicity')}
                                    error={formik.touched.basicData?.ethnicity && Boolean(formik.errors.basicData?.ethnicity)}
                                >
                                    <MenuItem value="Asian">Asian</MenuItem>
                                    <MenuItem value="African">African</MenuItem>
                                    <MenuItem value="Caucasian">Caucasian</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Skinfolds (mm)
                    </Typography>
                    <Grid container spacing={2}>
                        {renderMeasurementInputs(formik.values.skinfolds, formik, isakReferenceValues, 'skinfolds')}
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Circumferences (cm)
                    </Typography>
                    <Grid container spacing={2}>
                        {renderMeasurementInputs(formik.values.circumferences, formik, isakReferenceValues, 'circumferences')}
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Diameters (cm)
                    </Typography>
                    <Grid container spacing={2}>
                        {renderMeasurementInputs(formik.values.diameters, formik, isakReferenceValues, 'diameters')}
                    </Grid>
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/isak')}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || user?.role !== 'professional'}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default ISAKForm; 