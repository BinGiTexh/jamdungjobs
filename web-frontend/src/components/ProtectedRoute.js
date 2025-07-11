import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #1e88e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

/**
 * ProtectedRoute component that handles authentication-based routing
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} props.requiredRole - Required role to access this route (optional)
 * @param {string} props.redirectTo - Where to redirect if not authenticated
 * @returns {React.ReactElement} Protected route component
 */
const ProtectedRoute = ({ children, requiredRole, redirectTo = '/login' }) => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  // ProtectedRoute Check:
  // isAuthenticated, loading, error, user, requiredRole, currentPath

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
    // Not authenticated, redirecting to login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // Role mismatch - userRole: user?.role, requiredRole
    // Redirecting to dashboard
    return (
      <Navigate
        to="/dashboard"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Access granted to protected route
  // Render protected content if authenticated and authorized
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  requiredRole: PropTypes.string,
  redirectTo: PropTypes.string
};

ProtectedRoute.defaultProps = {
  redirectTo: '/login'
};

// Default export
export default ProtectedRoute;
