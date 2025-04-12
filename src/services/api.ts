import axios from 'axios';
import { User, AnthropometricMeasurement, PerformanceMetrics, HealthMetrics, Report, AuthResponse, PaginatedResponse } from '../types';

// Use environment variable for deployed API, otherwise use the provided Vercel URL as default
const API_URL = process.env.REACT_APP_API_URL || 'https://backend-antropometria-8u8r.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export default api; 