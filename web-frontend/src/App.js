import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { logDev, logError, sanitizeForLogging } from './utils/loggingUtils';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { useAuth } from './context/AuthContext';
import EmployerDashboard from './components/employer/EmployerDashboard';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import LoginPage from './components/auth/LoginPage';
import Register from './components/Register';
import JobSearch from './components/JobSearch';
import HomePage from './components/home/HomePage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobApplyPage from './pages/JobApplyPage';
import JobDetailsPage from './pages/JobDetailsPage';
import EmployerApplicationsPage from './pages/EmployerApplicationsPage';
import EmployerPostJobPage from './pages/EmployerPostJobPageNew';
import ProfilePage from './components/profile/ProfilePage';
import ResumeBuilderPage from './components/candidate/ResumeBuilderPage';
import AboutUs from './components/AboutUs';
import DashboardRedirect from './components/DashboardRedirect';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Alert
} from '@mui/material';
// Simple page components

// Simple page components
const JobSearchPage = () => <JobSearch />;

// RegisterPage component
const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    logDev('debug', 'Register page accessed', {
      isAuthenticated,
      from: location.state?.from || 'direct'
    });
  }, [isAuthenticated, location.state]);
  
  if (isAuthenticated) {
    logDev('debug', 'Redirecting authenticated user from register page to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Register />;
};

// Navigation component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Removed unused location variable
  
  const handleLogout = () => {
    logDev('info', 'User logging out', {
      userRole: user?.role,
      userId: user?.id
    });
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>JamDung Jobs</h1>
        </Link>
        
        <div className="nav-links">
          {user ? (
            user.role === 'EMPLOYER' ? (
              <>
                <Link to="/employer/dashboard">Dashboard</Link>
                <Link to="/employer/jobs">Job Listings</Link>
                <Link to="/employer/applications">Applications</Link>
                <Link to="/employer/profile">Company Profile</Link>
                <Link to="/about">About Us</Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/candidate/dashboard">Dashboard</Link>
                <Link to="/jobs">Find Jobs</Link>
                <Link to="/applications">My Applications</Link>
                <Link to="/about">About Us</Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            )
          ) : (
            // Minimal navigation for non-logged in users
            <>
              <Link to="/about" style={{
                color: '#FFD700',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #FFD700'
              }}>About Us</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Main App component
function App() {
  // Log application initialization
  useEffect(() => {
    logDev('info', 'Application initialized', {
      env: process.env.NODE_ENV,
      buildTime: process.env.REACT_APP_BUILD_TIME || 'unknown',
      version: process.env.REACT_APP_VERSION || '1.0.0'
    });
  }, []);
  
  return (
    <AuthProvider>
      <Helmet>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Helmet>
      <Router>
        <div style={{ minHeight: '100vh' }}>
          <Navigation />
          <div>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
              <Route path="/jobs/:jobId/apply" element={<JobApplyPage />} />
              <Route path="/about" element={<AboutUs />} />

              {/* Protected Routes - Redirect based on role */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    onAccessDenied={(message) => {
                      logDev('warn', 'Access denied to protected route', {
                        route: '/dashboard',
                        reason: message || 'Not authenticated'
                      });
                    }}
                  >
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <RoleProtectedRoute 
                    role="EMPLOYER"
                    onAccessDenied={(message) => {
                      logDev('warn', 'Access denied to employer route', {
                        route: '/employer/dashboard',
                        reason: message || 'Wrong role or not authenticated'
                      });
                    }}
                  >
                    <EmployerDashboard />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/employer/dashboard-old"
                element={
                  <RoleProtectedRoute role="EMPLOYER">
                    <EmployerDashboard />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/employer/applications"
                element={
                  <RoleProtectedRoute role="EMPLOYER">
                    <EmployerApplicationsPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/employer/post-job"
                element={<EmployerPostJobPage />}
              />

              {/* Candidate Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <RoleProtectedRoute role="JOBSEEKER">
                    <CandidateDashboard />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/applications"
                element={
                  <RoleProtectedRoute role="JOBSEEKER">
                    <ApplicationsPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/resume-builder"
                element={
                  <RoleProtectedRoute role="JOBSEEKER">
                    <ResumeBuilderPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
