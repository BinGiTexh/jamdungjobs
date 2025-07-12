import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute component that redirects authenticated users away from marketing pages
 * This ensures authenticated users don't see the marketing homepage with non-functional CTAs
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when not authenticated
 * @param {string} props.redirectTo - Where to redirect authenticated users (default: /dashboard)
 * @returns {React.ReactElement} Public route component
 */
const PublicRoute = ({ children, redirectTo: _redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const _location = useLocation();

  // PublicRoute Check:
  // isAuthenticated, loading, userRole, currentPath, redirectTo

  // Show content during loading
  if (loading) {
    return children;
  }

  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard';
    
    // Authenticated user accessing public route, redirecting to dashboard
    
    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  // Showing public content to unauthenticated user
  // Show public content for unauthenticated users
  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  redirectTo: PropTypes.string
};

export default PublicRoute;