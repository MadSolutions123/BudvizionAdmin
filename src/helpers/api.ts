import axios from 'axios';
import { localStorageEncryptionService } from './localStorageEncryption';
import { ApiEndpoints } from './constants';
// Get API base URL with fallback for development
const API_BASE_URL = (import.meta as any).env.VITE_APP_API_BASE_URL || 'http://localhost:3000';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from encrypted storage
    const tokenData = localStorageEncryptionService.getTokenData();
    const token = tokenData?.tokens?.access?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorageEncryptionService.removeTokenData();
      localStorageEncryptionService.removeUserData();
      // You can add redirect logic here
      // window.location.href = '/login';
    }
    
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Auth functions
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post(ApiEndpoints.LOGIN, credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Get users with pagination
  getUserList: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`${ApiEndpoints.GET_USERS}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get single user by ID
  getUserById: async (id: string | number) => {
    try {
      const response = await api.get(`${ApiEndpoints.GET_USERS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user by ID
  updateUser: async (id: string | number, userData: any) => {
    try {
      const response = await api.patch(`${ApiEndpoints.GET_USERS}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: any) => {
    try {
      const response = await api.post(`${ApiEndpoints.GET_USERS}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Delete user by ID
  deleteUser: async (id: string | number) => {
    try {
      const response = await api.delete(`${ApiEndpoints.GET_USERS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get streams with pagination
  getStreamList: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`${ApiEndpoints.GET_STREAMS}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streams:', error);
      throw error;
    }
  },

  // Get single stream by ID
  getStreamById: async (id: string | number) => {
    try {
      const response = await api.get(`${ApiEndpoints.GET_STREAMS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream:', error);
      throw error;
    }
  },

  // Delete stream by ID
  deleteStream: async (id: string | number) => {
    try {
      const response = await api.delete(`${ApiEndpoints.GET_STREAMS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting stream:', error);
      throw error;
    }
  },
};

export default api;