import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, AnthropometricMeasurement, PerformanceMetrics, HealthMetrics, Report, AuthResponse, PaginatedResponse, ISAKMeasurement, ISAKMeasurementInput } from '../types';
import * as integrationFuncs from './integrationService'; // Import all functions

// Use environment variable for local API, otherwise default to localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  console.log('Current token:', token);
  console.log('Current user:', user);
  
  if (token) {
    try {
      // Verify token and user match
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userData = user ? JSON.parse(user) : null;
      
      if (userData && tokenPayload.userId !== userData.id) {
        console.warn('Token userId does not match current user id');
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return config;
      }
      
      config.headers.set('Authorization', `Bearer ${token}`);
      console.log('Request headers with auth:', config.headers);
      console.log('Request URL:', config.url);
    } catch (error) {
      console.error('Error processing token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  } else {
    console.warn('No authentication token found');
  }
  return config;
});

// Flag to prevent concurrent refresh attempts
let isRefreshing = false;
// Store requests that failed due to 401
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle token refresh on 401
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  async (error) => {
    console.log('Error response:', error.response);
    if (error.response?.status === 401) {
      console.log('Received 401, attempting to refresh token...');
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await auth.refreshToken(refreshToken);
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        console.warn('No refresh token available');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (data: Partial<User> & { password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
};

interface PatientsResponse {
  patients: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// User endpoints
export const users = {
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/profile', data),
  deleteProfile: () => api.delete('/users/profile'),
  getPatients: (params?: {
    name?: string;
    gender?: string;
    age?: number;
    sport?: string;
    position?: string;
    page?: number;
    limit?: number;
  }) => api.get<PatientsResponse>('/users/patients', { params }),
  getPatientDetails: (id: string) =>
    api.get<User>(`/users/patients/${id}`),
  createPatient: (data: Omit<User, '_id'>) => api.post<User>('/users/patients', data),
  updatePatient: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/patients/${id}`, data),
};

// Anthropometric endpoints
export const measurements = {
  create: (data: Omit<AnthropometricMeasurement, '_id'>) =>
    api.post<AnthropometricMeasurement>('/measurements/anthropometric', data),
  getAll: (params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<AnthropometricMeasurement>>(
      '/measurements/anthropometric',
      { params }
    ),
  getOne: (id: string) =>
    api.get<AnthropometricMeasurement>(`/measurements/anthropometric/${id}`),
  update: (id: string, data: Partial<AnthropometricMeasurement>) =>
    api.put<AnthropometricMeasurement>(`/measurements/anthropometric/${id}`, data),
  delete: (id: string) =>
    api.delete<AnthropometricMeasurement>(`/measurements/anthropometric/${id}`),
};

// Performance endpoints
export const performance = {
  create: (data: Omit<PerformanceMetrics, '_id'>) =>
    api.post<PerformanceMetrics>('/performance', data),
  getAll: (params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    sport?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<PerformanceMetrics>>('/performance', { params }),
  getOne: (id: string) =>
    api.get<PerformanceMetrics>(`/performance/${id}`),
  update: (id: string, data: Partial<PerformanceMetrics>) =>
    api.put<PerformanceMetrics>(`/performance/${id}`, data),
  delete: (id: string) =>
    api.delete<PerformanceMetrics>(`/performance/${id}`),
};

// Health endpoints
export const health = {
  create: (data: Omit<HealthMetrics, '_id'>) =>
    api.post<HealthMetrics>('/health', data),
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    source?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<HealthMetrics>>('/health', { params }),
  getOne: (id: string) =>
    api.get<HealthMetrics>(`/health/${id}`),
  update: (id: string, data: Partial<HealthMetrics>) =>
    api.put<HealthMetrics>(`/health/${id}`, data),
  delete: (id: string) =>
    api.delete<HealthMetrics>(`/health/${id}`),
};

// Report endpoints
export const reports = {
  create: (data: Omit<Report, '_id' | 'date'>) =>
    api.post<Report>('/reports', data),
  getAll: (params?: {
    type?: string;
    format?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<Report>>('/reports', { params }),
  getOne: (id: string) =>
    api.get<Report>(`/reports/${id}`),
  share: (id: string) =>
    api.post<Report>(`/reports/${id}/share`),
  getShared: (accessCode: string) =>
    api.get<Report>(`/reports/shared/${accessCode}`),
  delete: (id: string) =>
    api.delete<Report>(`/reports/${id}`),
};

// Integrations endpoints
export const integrations = {
  disconnectGoogleFit: () => 
    api.post<{ message: string }>('/integrations/googlefit/disconnect'),
  // Add Strava functions
  disconnectStrava: integrationFuncs.disconnectStrava, 
  fetchStravaData: integrationFuncs.fetchStravaData,
  // connectStrava is likely handled by direct redirect, but can add if needed:
  // connectStrava: integrationFuncs.connectStrava,
  
  // Add TrainingPeaks functions (importing from integrationService)
  saveTrainingPeaksCredentials: integrationFuncs.saveTrainingPeaksCredentials, // Assuming exists in integrationService
  disconnectTrainingPeaks: integrationFuncs.disconnectTrainingPeaks,
  // Add TP scrape trigger function
  triggerTrainingPeaksLoginScrape: integrationFuncs.triggerTrainingPeaksLoginScrape, // Assuming exists in integrationService

  // Add other integration functions here (e.g., getStatus, syncGoogleFit)
  // Example: If you have syncGoogleFit in integrationService.ts:
  // syncGoogleFit: integrationFuncs.syncGoogleFitData, 
};

interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

// ISAK endpoints
export const isak = {
    getAll: async () => {
        console.log('Making GET request to /isak');
        const response = await api.get<ApiResponse<ISAKMeasurement[]>>('/isak');
        console.log('ISAK GET response:', response);
        return response;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<ISAKMeasurement>>(`/isak/${id}`);
        return response;
    },
    create: async (data: ISAKMeasurementInput) => {
        console.log('Making POST request to /isak with data:', data);
        const response = await api.post<ApiResponse<ISAKMeasurement>>('/isak', data);
        console.log('ISAK POST response:', response);
        return response;
    },
    update: async (id: string, data: Partial<ISAKMeasurementInput>) => {
        const response = await api.put<ApiResponse<ISAKMeasurement>>(`/isak/${id}`, data);
        return response;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(`/isak/${id}`);
        return response;
    },
    calculate: async (data: Partial<ISAKMeasurementInput>) => {
        const response = await api.post<ApiResponse<ISAKMeasurement['calculated']>>('/isak/calculate', data);
        return response;
    }
};

export default api; 