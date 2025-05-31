import axios from 'axios';
import { logDev, logError, sanitizeForLogging } from './loggingUtils';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Constants for localStorage keys (must match the ones in AuthContext.js)
const TOKEN_KEY = 'jamdung_auth_token';

// Add a request interceptor to automatically add the JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from the correct localStorage key
    let token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      // Sanitize the token - remove any quotes, whitespace or malformed characters
      token = token.trim();
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      
      // Log token format for debugging (excluding actual token value)
      logDev('debug', 'Token format check', { 
        length: token.length,
        hasBearer: token.startsWith('Bearer '),
        hasMalformedChars: /[^\w\d\.\-_]/g.test(token.replace('Bearer ', ''))
      });
      
      // Make sure token is properly formatted with Bearer prefix
      let finalToken;
      if (token.startsWith('Bearer ')) {
        // If token already has 'Bearer ' prefix, use as is
        finalToken = token;
      } else {
        // Otherwise add the Bearer prefix
        finalToken = `Bearer ${token}`;
      }
      
      // Set the Authorization header
      config.headers.Authorization = finalToken;
      logDev('debug', `Setting Authorization header for ${config.url}`, { 
        headerSet: true, 
        headerLength: finalToken.length
      });
      
      // Also set token in the regular 'token' key for backward compatibility
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', token);
      }
    } else {
      // Try fallback to the old token key as a temporary measure
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        // Sanitize the legacy token too
        const sanitizedLegacyToken = legacyToken.trim();
        const finalLegacyToken = sanitizedLegacyToken.startsWith('Bearer ') 
          ? sanitizedLegacyToken 
          : `Bearer ${sanitizedLegacyToken}`;
          
        config.headers.Authorization = finalLegacyToken;
        // Migrate the token to the correct key
        localStorage.setItem(TOKEN_KEY, sanitizedLegacyToken);
        
        logDev('debug', 'Using legacy token', {
          tokenMigrated: true,
          headerSet: true
        });
      } else {
        // Only log auth issues for protected endpoints, not for public routes
        if (!config.url.includes('/auth/') && !config.url.includes('/public/')) {
          logDev('warn', 'No token found for request to:', config.url);
        }
      }
    }
    
    return config;
  },
  (error) => {
    // Always log request errors in all environments
    logError('Request interceptor error', error, {
      module: 'axiosConfig',
      interceptor: 'request'
    });
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
    // Log errors with improved context
    logError('API request failed', error, {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      module: 'axiosConfig',
      interceptor: 'response'
    });
    
    // Only log detailed error data in development
    logDev('debug', 'API error details:', sanitizeForLogging(error.response?.data));
    
    return Promise.reject(error);
  }
);

export default api;
