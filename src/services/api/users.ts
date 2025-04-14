import axios, { AxiosResponse } from 'axios';
import { User } from '../../types';

class UsersAPI {
  private baseUrl: string;
  private getHeaders: () => Record<string, string>;

  constructor(baseUrl: string, getHeaders: () => Record<string, string>) {
    this.baseUrl = baseUrl;
    this.getHeaders = getHeaders;
  }

  async getProfile(): Promise<AxiosResponse<User>> {
    return axios.get(`${this.baseUrl}/users/profile`, {
      headers: this.getHeaders()
    });
  }

  async updateProfile(data: Partial<User>): Promise<AxiosResponse<User>> {
    return axios.put(`${this.baseUrl}/users/profile`, data, {
      headers: this.getHeaders()
    });
  }

  async getPatients(params?: { limit?: number }): Promise<AxiosResponse<{ patients: User[] }>> {
    return axios.get(`${this.baseUrl}/users/patients`, {
      headers: this.getHeaders(),
      params
    });
  }

  async getPatientDetails(id: string): Promise<AxiosResponse<User>> {
    return axios.get(`${this.baseUrl}/users/patients/${id}`, {
      headers: this.getHeaders()
    });
  }

  async createPatient(data: Omit<User, '_id' | 'role' | 'professionalId'>): Promise<AxiosResponse<User>> {
    return axios.post(`${this.baseUrl}/users/patients`, data, {
      headers: this.getHeaders()
    });
  }

  async updatePatient(id: string, data: Partial<User>): Promise<AxiosResponse<User>> {
    return axios.put(`${this.baseUrl}/users/patients/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  async deletePatient(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/users/patients/${id}`, {
      headers: this.getHeaders()
    });
  }
}

export const users = new UsersAPI(
  process.env.REACT_APP_API_URL || 'https://backend-antropometria-2-0.vercel.app/api',
  () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })
); 