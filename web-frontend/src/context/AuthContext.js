import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';
import api from '../utils/api';
import { config } from '../config';

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
      console.log('🔄 AuthContext: Starting token validation');
      const token = storage.getToken();
      const storedUser = storage.getUser();
      
      console.log('🔐 AuthContext: Token check:', {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
        storedUserRole: storedUser?.role
      });
      
      if (!token) {
        console.log('🚫 AuthContext: No token found, user not authenticated');
        logDev('debug', 'No token found during initialization, user is not authenticated');
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      console.log('🔍 AuthContext: Validating token with API');
      logDev('debug', 'Validating existing auth token');

      try {
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000); // 10 second timeout

        const response = await fetch(`${config.apiUrl}/api/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Token validation failed: ${response.status}`);
        }

        const userData = await response.json();
        console.log('✅ AuthContext: Token validation successful', {
          userId: userData.user?.id || userData.id,
          userRole: userData.user?.role || userData.role,
          userEmail: userData.user?.email || userData.email
        });
        logDev('debug', 'Token validation successful');
        // Handle both nested and flat response structures
        const user = userData.user || userData;
        setUser(user);
        storage.setUser(user);
        setError(null);
      } catch (err) {
        console.error('❌ AuthContext: Token validation failed:', err.message);
        logError('Token validation failed', err, {
          module: 'AuthContext',
          function: 'validateToken',
          status: err.status || 'unknown'
        });
        
        // Determine specific error type for better user feedback
        const errorType = err.name === 'AbortError' ? 'TIMEOUT' : 
                         err.message?.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
        console.log('⚠️ AuthContext: Error type:', errorType);
        logDev('warn', `Auth token error: ${errorType}`);
        
        storage.clearAll();
        setUser(null);
        setError(errorType === 'TIMEOUT' ? 'Connection timeout. Please try again.' : null);
      } finally {
        console.log('🏁 AuthContext: Token validation complete, setting loading to false');
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    console.log('🔑 AuthContext: Starting login process');
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Login attempt', { email: email ? `${email.substring(0, 3)}...` : 'none' });

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { data } = response;

      if (response.status !== 200) {
        const errorMsg = data?.message || 'Login failed';
        logError('Login failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'login',
          status: response.status,
          email: email ? `${email.substring(0, 3)}...` : 'none'
        });
        throw new Error(errorMsg);
      }

      console.log('✅ AuthContext: Login successful', {
        userId: data.user.id,
        userRole: data.user.role,
        userEmail: data.user.email,
        tokenReceived: !!data.token
      });
      logDev('debug', 'Login successful', { 
        user: sanitizeForLogging(data.user),
        tokenReceived: !!data.token
      });
      
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      console.log('💾 AuthContext: User state updated after login');
      return data.user;
    } catch (err) {
      console.error('❌ AuthContext: Login error:', err);
      
      // Extract user-friendly error message
      let userFriendlyMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const { status, data } = err.response;
        
        if (status === 401) {
          if (data?.code === 'INVALID_CREDENTIALS') {
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else {
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
          }
        } else if (status === 400) {
          if (data?.code === 'MISSING_CREDENTIALS') {
            userFriendlyMessage = 'Please enter both email and password.';
          } else {
            userFriendlyMessage = data?.message || 'Please check your input and try again.';
          }
        } else if (status === 429) {
          userFriendlyMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (status >= 500) {
          userFriendlyMessage = 'Server error. Please try again in a few moments.';
        } else {
          userFriendlyMessage = data?.message || 'Login failed. Please try again.';
        }
      } else if (err.request) {
        // Network error - no response received
        userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message && err.message.includes('timeout')) {
        userFriendlyMessage = 'Login request timed out. Please try again.';
      }
      
      logError('Login failed', err, {
        module: 'AuthContext',
        function: 'login',
        status: err.response?.status || 'no_response',
        userMessage: userFriendlyMessage,
        email: email ? `${email.substring(0, 3)}...` : 'none'
      });
      
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Registration attempt', { 
      email: userData.email ? `${userData.email.substring(0, 3)}...` : 'none',
      role: userData.role || 'unknown'
    });

    try {
      const response = await api.post('/api/auth/register', userData);
      const { data } = response;

      if (response.status !== 201 && response.status !== 200) {
        const errorMsg = data?.message || 'Registration failed';
        logError('Registration failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'register',
          status: response.status,
          email: userData.email ? `${userData.email.substring(0, 3)}...` : 'none',
          role: userData.role || 'unknown'
        });
        throw new Error(errorMsg);
      }

      // Store token and user data
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      
      logDev('info', 'Registration successful', { 
        userId: data.user.id, 
        role: data.user.role 
      });
      
      return data.user;
    } catch (err) {
      // Extract user-friendly error message for registration
      let userFriendlyMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const { status, data } = err.response;
        
        if (status === 400) {
          if (data?.code === 'USER_EXISTS') {
            userFriendlyMessage = 'An account with this email already exists. Please try logging in instead.';
          } else if (data?.code === 'INVALID_INPUT') {
            userFriendlyMessage = data?.message || 'Please check your input and try again.';
            if (data?.errors && Array.isArray(data.errors)) {
              userFriendlyMessage = data.errors.join(', ');
            }
          } else {
            userFriendlyMessage = data?.message || 'Please check your input and try again.';
          }
        } else if (status === 429) {
          userFriendlyMessage = 'Too many registration attempts. Please wait a moment and try again.';
        } else if (status >= 500) {
          userFriendlyMessage = 'Server error. Please try again in a few moments.';
        } else {
          userFriendlyMessage = data?.message || 'Registration failed. Please try again.';
        }
      } else if (err.request) {
        // Network error - no response received
        userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message && err.message.includes('timeout')) {
        userFriendlyMessage = 'Registration request timed out. Please try again.';
      }
      
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
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
    if (!user) {
      const errorMsg = 'User not authenticated';
      logError(errorMsg, new Error(errorMsg), {
        module: 'AuthContext',
        function: 'updateProfile'
      });
      throw new Error(errorMsg);
    }
    
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Profile update attempt', {
      userId: user?.id,
      fields: Object.keys(profileData)
    });

    try {
      const response = await api.put('/api/auth/profile', profileData);
      const { data } = response;

      if (response.status !== 200) {
        const errorMsg = data?.message || 'Profile update failed';
        logError('Profile update failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'updateProfile',
          status: response.status,
          userId: user?.id
        });
        throw new Error(errorMsg);
      }

      // Update user data
      const updatedUser = { ...user, ...data.data.user };
      storage.setUser(updatedUser);
      setUser(updatedUser);
      
      logDev('info', 'Profile update successful', { 
        userId: updatedUser.id,
        updatedFields: Object.keys(profileData)
      });
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Google OAuth login handler
  const loginWithGoogle = useCallback(async (googleToken, userInfo) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Google OAuth login attempt', { 
      email: userInfo.email ? `${userInfo.email.substring(0, 3)}...` : 'none',
      verified: userInfo.email_verified
    });

    try {
      const response = await api.post('/api/auth/google', {
        googleToken,
        userInfo
      });
      const { data } = response;

      if (response.status !== 200) {
        const errorMsg = data?.message || 'Google login failed';
        logError('Google login failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'loginWithGoogle',
          status: response.status,
          email: userInfo.email ? `${userInfo.email.substring(0, 3)}...` : 'none'
        });
        throw new Error(errorMsg);
      }

      logDev('debug', 'Google login successful', { 
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

  // Google OAuth registration handler
  const registerWithGoogle = useCallback(async (googleToken, userInfo, additionalData = {}) => {
    setLoading(true);
    setError(null);
    
    logDev('debug', 'Google OAuth registration attempt', { 
      email: userInfo.email ? `${userInfo.email.substring(0, 3)}...` : 'none',
      role: additionalData.role || 'JOBSEEKER',
      verified: userInfo.email_verified
    });

    try {
      const response = await api.post('/api/auth/google/register', {
        googleToken,
        userInfo,
        ...additionalData
      });
      const { data } = response;

      if (response.status !== 200) {
        const errorMsg = data?.message || 'Google registration failed';
        logError('Google registration failed', new Error(errorMsg), {
          module: 'AuthContext',
          function: 'registerWithGoogle',
          status: response.status,
          email: userInfo.email ? `${userInfo.email.substring(0, 3)}...` : 'none',
          role: additionalData.role || 'JOBSEEKER'
        });
        throw new Error(errorMsg);
      }

      // Store token and user data
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      
      logDev('info', 'Google registration successful', { 
        userId: data.user.id, 
        role: data.user.role 
      });
      
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
    updateProfile,
    loginWithGoogle,
    registerWithGoogle
  }), [user, loading, error, login, logout, register, updateProfile, loginWithGoogle, registerWithGoogle]);

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
    name: PropTypes.string
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

