import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { auth } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      setToken(token);
      refreshTokenHandler();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshTokenHandler = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await auth.refreshToken(refreshToken);
      handleAuthResponse(response.data);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    setToken(response.token);
    setUser(response.user);
    setError(null);
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await auth.login(email, password);
      handleAuthResponse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (data: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await auth.register(data);
      handleAuthResponse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        login,
        register,
        logout,
        refreshToken: refreshTokenHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 