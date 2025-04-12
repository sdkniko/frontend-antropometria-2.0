export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'professional' | 'athlete';
  gender?: 'male' | 'female' | 'other';
  age?: number;
  country?: string;
  sport?: string;
  position?: string;
  professionalId?: string;
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  settings?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnthropometricMeasurement {
  _id: string;
  userId: string;
  professionalId: string;
  date: Date;
  weight: number;
  height: number;
  skinfolds: {
    triceps: number;
    biceps: number;
    subscapular: number;
    suprailiac: number;
    abdominal: number;
    thigh: number;
    calf: number;
  };
  perimeters: {
    arm: number;
    chest: number;
    waist: number;
    hip: number;
    thigh: number;
    calf: number;
  };
  bodyFatPercentage?: number;
  notes?: string;
}

export interface PerformanceMetrics {
  _id: string;
  userId: string;
  professionalId: string;
  date: Date;
  vo2max?: number;
  power?: number;
  speed?: number;
  trainingLoad?: number;
  sport?: string;
  position?: string;
  notes?: string;
}

export interface HealthMetrics {
  _id: string;
  userId: string;
  date: Date;
  sleep?: {
    duration: number;
    quality: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
  };
  stress?: number;
  restingHeartRate?: number;
  heartRateVariability?: number;
  steps?: number;
  source: 'garmin' | 'google_fit' | 'apple_health';
  notes?: string;
}

export interface Report {
  _id: string;
  userId: string;
  professionalId: string;
  type: 'individual' | 'group';
  date: Date;
  content: any;
  format: 'pdf' | 'excel';
  shared: boolean;
  accessCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
} 