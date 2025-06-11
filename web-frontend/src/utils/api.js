import axios from 'axios';
import { logDev } from './loggingUtils';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Log API errors but don't expose sensitive data
      logDev('error', `API Error: ${error.response.status}`, {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status
      });
    }
    return Promise.reject(error);
  }
);

export default api;
