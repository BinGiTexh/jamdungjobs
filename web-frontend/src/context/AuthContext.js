import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';

// Base URL for API requests
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(undefined);

// Constants for localStorage keys
const TOKEN_KEY = 'jamdung_auth_token';
const USER_KEY = 'jamdung_user';

// Token management utilities
const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      logError('Error parsing stored user', error, { 
        module: 'AuthContext',
        function: 'storage.getUser'
      });
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export function AuthProvider({ children }) {
  // State management
  const [user, setUser] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = storage.getToken();
      if (!token) {
        logDev('debug', 'No token found during initialization, user is not authenticated');
        setLoading(false);
        return;
      }
      
      logDev('debug', 'Validating existing auth token');

      try {
        const response = await fetch(`${baseUrl}/api/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const userData = await response.json();
        logDev('debug', 'Token validation successful');
        setUser(userData);
        storage.setUser(userData);
      } catch (err) {
        logError('Token validation failed', err, {
          module: 'AuthContext',
          function: 'validateToken',
          status: err.status || 'unknown'
        });
        
        // Determine specific error type for better user feedback
        const errorType = err.message?.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
        logDev('warn', `Auth token error: ${errorType}`);
        
        storage.clearAll();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Login attempt', { email: email ? `${email.substring(0, 3)}...` : 'none' });

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Login failed';
        logError('Login failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'login',
          status: response.status,
          email: email ? `${email.substring(0, 3)}...` : 'none'
        });
        throw new Error(errorMsg);
      }

      logDev('debug', 'Login successful', { 
        user: sanitizeForLogging(data.user),
        tokenReceived: !!data.token
      });
      
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registration handler
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Registration attempt', { 
      email: userData.email ? `${userData.email.substring(0, 3)}...` : 'none',
      role: userData.role
    });

    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Registration failed';
        logError('Registration failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'register',
          status: response.status,
          role: userData.role
        });
        throw new Error(errorMsg);
      }

      logDev('debug', 'Registration successful', {
        user: sanitizeForLogging(data.user),
        tokenReceived: !!data.token
      });
      
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    logDev('debug', 'User logout', { 
      userId: user?.id,
      userRole: user?.role
    });
    
    storage.clearAll();
    setUser(null);
    setError(null);
  }, [user]);

  // Update profile handler
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Profile update attempt', {
      userId: user?.id,
      fields: Object.keys(profileData)
    });

    try {
      const token = storage.getToken();
      const response = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Profile update failed';
        logError('Profile update failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'updateProfile',
          status: response.status,
          userId: user?.id
        });
        throw new Error(errorMsg);
      }

      logDev('debug', 'Profile update successful', {
        user: sanitizeForLogging(data.user)
      });
      
      storage.setUser(data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile
  }), [user, loading, error, login, logout, register, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// PropTypes for the AuthProvider component
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook for consuming the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// PropTypes for the auth context value
export const AuthContextShape = PropTypes.shape({
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    // Add other user properties as needed
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired
});

export default AuthContext;

