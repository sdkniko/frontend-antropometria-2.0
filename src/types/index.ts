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
  // Google Fit Integration Fields (Optional)
  googleFitConnected?: boolean;
  googleFitScopes?: string[];
  googleFitLastSync?: Date;
  // Strava Integration Fields (Optional)
  stravaConnected?: boolean;
  stravaAthleteId?: string;
  stravaScopes?: string[];
  // TrainingPeaks Integration Fields (Optional)
  trainingPeaksConnected?: boolean;
  trainingPeaksUsername?: string; // Changed from email
  // Tokens are typically not sent to frontend, but include connection status
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
    quality?: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
    awakeDuration?: number;
  };
  stress?: number;
  restingHeartRate?: number;
  heartRateVariability?: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartRateAvg?: number;
  steps?: number;
  distance?: number; // in meters
  calories?: number; // in kcal
  activeMinutes?: number;
  weight?: number;
  height?: number;
  source: 'garmin' | 'googlefit' | 'apple_health' | 'manual';
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

// Represents the profile data fetched for the logged-in user
export interface UserProfileData {
    _id: string;
    name: string;
    email: string;
    role: 'athlete' | 'professional';
    // Add other common fields
    createdAt: string;
    updatedAt: string;
    // Google Fit related fields
    googleFitConnected: boolean;
    googleFitScopes?: string[];
    googleFitLastSync?: string; // Or Date?
    // Strava related fields
    stravaConnected: boolean;
    stravaAthleteId?: string;
    stravaScopes?: string[];
    // TrainingPeaks related fields
    trainingPeaksConnected?: boolean;
    trainingPeaksUsername?: string;
    // Add fields specific to 'athlete' or 'professional' if needed
    // For example, for athletes:
    gender?: 'male' | 'female' | 'other';
    age?: number;
    country?: string;
    sport?: string;
    position?: string;
    professionalId?: string; // ID of the linked professional
    // For example, for professionals:
    specialization?: string;
    licenseNumber?: string;
    yearsOfExperience?: number;
}

// For the user object within the Auth context
export interface AuthUser extends UserProfileData { // Can extend or be similar
    // May include additional fields needed specifically for auth context
}


// Status for integration connection/syncing processes
export type IntegrationStatus = 'idle' | 'connecting' | 'connected' | 'syncing' | 'disconnecting' | 'disconnected';

// --- Strava Specific Types ---

// Structure of the Strava Athlete Stats object (example)
// See: https://developers.strava.com/docs/reference/#api-models-ActivityStats
export interface StravaAthleteStats {
    biggest_ride_distance: number;
    biggest_climb_elevation_gain: number;
    recent_ride_totals: StravaActivityTotal;
    recent_run_totals: StravaActivityTotal;
    recent_swim_totals: StravaActivityTotal;
    ytd_ride_totals: StravaActivityTotal;
    ytd_run_totals: StravaActivityTotal;
    ytd_swim_totals: StravaActivityTotal;
    all_ride_totals: StravaActivityTotal;
    all_run_totals: StravaActivityTotal;
    all_swim_totals: StravaActivityTotal;
}

// Structure for Strava activity totals
// See: https://developers.strava.com/docs/reference/#api-models-ActivityTotal
export interface StravaActivityTotal {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
    achievement_count?: number; // Optional
}

// Structure of a Strava Activity Summary
// See: https://developers.strava.com/docs/reference/#api-models-SummaryActivity
export interface StravaActivitySummary {
    id: number;
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string; // e.g., "Run", "Ride"
    sport_type: string;
    start_date: string; // ISO 8601
    start_date_local: string; // ISO 8601
    timezone: string;
    utc_offset: number;
    location_city: string | null;
    location_state: string | null;
    location_country: string | null;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    map: {
        id: string;
        summary_polyline: string | null;
        resource_state: number;
    };
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    visibility: string;
    flagged: boolean;
    gear_id: string | null;
    start_latlng: [number, number] | null;
    end_latlng: [number, number] | null;
    average_speed: number;
    max_speed: number;
    average_cadence?: number;
    average_temp?: number;
    has_heartrate: boolean;
    average_heartrate?: number;
    max_heartrate?: number;
    heartrate_opt_out: boolean;
    display_hide_heartrate_option: boolean;
    elev_high?: number;
    elev_low?: number;
    upload_id: number | null;
    upload_id_str?: string;
    external_id: string | null;
    from_accepted_tag: boolean;
    pr_count: number;
    total_photo_count: number;
    has_kudoed: boolean;
    // Add other relevant fields as needed
}

// Response type for the Strava sync/fetch endpoint
export interface StravaSyncResponse {
    message: string;
    stats: StravaAthleteStats;
    recentActivities: StravaActivitySummary[];
}

// Optional: Define a more specific type for data fetched from Strava if needed
export interface StravaDataResponse {
    athleteStats?: StravaAthleteStats;
    activities?: StravaActivitySummary[];
}

export interface ScrapedWorkout {
    _id: string;
    userId: string;
    date: string;
    title?: string | null;
    description?: string | null; 
    statsText?: string | null; 
    // Add specific extracted fields (make them optional)
    duration?: string | null;
    distance?: string | null;
    avgPace?: string | null;
    calories?: string | null;
    elevationGain?: string | null;
    tss?: string | null;
    ifFactor?: string | null;
    elevationLoss?: string | null;
    work?: string | null;
    // End specific fields
    scrapedAt: string;
    scrapeError?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ISAKMeasurement {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    professionalId: string;
    date: string;
    basicData: {
        mass: number;
        height: number;
        sittingHeight: number;
        armSpan: number;
        birthDate: string;
        sex: string;
        sport: string;
        position: string;
        ethnicity: string;
    };
    skinfolds: {
        [key: string]: [number, number];
    };
    circumferences: {
        [key: string]: [number, number];
    };
    diameters: {
        [key: string]: [number, number];
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

export interface ReferenceValue {
    type: 'Pliegue' | 'Perímetro' | 'Diámetro';
    sex: 'Masculino' | 'Femenino';
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    percentiles: {
        p5: number;
        p15: number;
        p25: number;
        p50: number;
        p75: number;
        p85: number;
        p95: number;
    };
}

export interface ISAKReferenceValues {
    triceps: ReferenceValue;
    subscapular: ReferenceValue;
    biceps: ReferenceValue;
    iliacCrest: ReferenceValue;
    suprailiac: ReferenceValue;
    abdominal: ReferenceValue;
    thigh: ReferenceValue;
    calf: ReferenceValue;
    relaxedArm: ReferenceValue;
    flexedArm: ReferenceValue;
    waist: ReferenceValue;
    hip: ReferenceValue;
    midThigh: ReferenceValue;
    calfCircumference: ReferenceValue;
    humerus: ReferenceValue;
    femur: ReferenceValue;
    biestyloid: ReferenceValue;
}

// Define the type for creating a new ISAK measurement
export interface ISAKMeasurementInput extends Omit<ISAKMeasurement, '_id' | 'userId'> {
    userId: string; // Override userId to be a string for input
} 