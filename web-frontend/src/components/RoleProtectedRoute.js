import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * RoleProtectedRoute component that handles role-based authentication routing
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} props.role - Required role to access this route
 * @returns {React.ReactElement} Role protected route component
 */
export const RoleProtectedRoute = ({ 
  children, 
  role, 
  redirectTo = '/dashboard' 
}) => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Handle authentication error state
  if (error) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px auto',
        maxWidth: '400px',
        backgroundColor: '#fff3f3',
        border: '1px solid #dc3545',
        borderRadius: '4px',
        color: '#dc3545'
      }}>
        <h3>Authentication Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check if user has the required role (case-insensitive)
  const userRole = user?.role?.toLowerCase();
  const requiredRole = role?.toLowerCase();
  
  if (userRole !== requiredRole) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Render protected content if authenticated and authorized
  return children;
};

RoleProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired,
  redirectTo: PropTypes.string
};

RoleProtectedRoute.defaultProps = {
  redirectTo: '/dashboard'
};
