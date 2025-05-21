import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

// Constants for localStorage keys (must match the ones in AuthContext.js)
const TOKEN_KEY = 'jamdung_auth_token';

// Add a request interceptor to automatically add the JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from the correct localStorage key
    const token = localStorage.getItem(TOKEN_KEY);
    
    console.log(`API Request to ${config.url}:`, {
      method: config.method,
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
    
    if (token) {
      // Make sure token is properly formatted
      if (token.includes(' ')) {
        // If token already has 'Bearer ' prefix, use as is
        config.headers.Authorization = token;
        console.log('Using token with existing prefix');
      } else {
        // Otherwise add the Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding Bearer prefix to token');
      }
      
      // Also set token in the regular 'token' key for backward compatibility
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', token);
      }
    } else {
      // Try fallback to the old token key as a temporary measure
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        console.log('Using legacy token key as fallback');
        config.headers.Authorization = `Bearer ${legacyToken}`;
        // Migrate the token to the correct key
        localStorage.setItem(TOKEN_KEY, legacyToken);
      } else {
        console.warn('No token found for request to:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error but don't automatically log out the user
    // This allows components to handle auth errors themselves
    console.error('API error:', error.response?.status, error.message);
    
    // Only log specific error details for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.debug('API error details:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
