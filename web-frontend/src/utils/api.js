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

// Consistent token key used across the app (matches AuthContext and axiosConfig)
const TOKEN_KEY = 'jamdung_auth_token';

// Request interceptor – inject JWT token and migrate legacy key if found
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem(TOKEN_KEY);

    // Fallback to legacy 'token' key if new key not present
    if (!token) {
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        token = legacyToken;
        // Migrate to new key for consistency
        localStorage.setItem(TOKEN_KEY, legacyToken);
      }
    }

    if (token) {
      token = token.trim();
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
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
