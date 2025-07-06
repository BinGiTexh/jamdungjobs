import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import SimpleMobileNav from './components/navigation/SimpleMobileNav';
import HomePage from './components/home/HomePage';
import HomePageDemo from './components/home/HomePageDemo';
import SmartJobDiscovery from './components/search/SmartJobDiscovery';
import LoginPage from './components/auth/LoginPage';
import Register from './components/Register';
import UniversalJobSearch from './components/search/UniversalJobSearch';
import JobSearchDemo from './components/JobSearchDemo';
import ApplicationsPage from './pages/ApplicationsPage';
import JobApplyPage from './pages/JobApplyPage';
import JobDetailsPage from './pages/JobDetailsPage';
import EmployerApplicationsPage from './pages/EmployerApplicationsPage';
import EmployerPostJobPage from './pages/EmployerPostJobPage';
import ProfilePage from './components/profile/ProfilePage';
import ResumeBuilderPage from './components/candidate/ResumeBuilderPage';
import AboutUs from './components/AboutUs';
import DashboardRedirect from './components/DashboardRedirect';
import FeatureDemo from './pages/FeatureDemo';
import IndustryDiscoveryPage from './pages/IndustryDiscoveryPage';
import BasicSearchPage from './pages/BasicSearchPage';
import SearchTestPage from './pages/SearchTestPage';
import EmployerBillingPage from './pages/EmployerBillingPage';
import EmployerAnalyticsPage from './pages/EmployerAnalyticsPage';

// Utils
import { logDev } from './utils/logger';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Simple Register Page wrapper
const RegisterPage = () => {
  return <Register />;
};

// Job Search wrapper using BasicSearchPage for better URL handling
const JobSearchPage = () => {
  return <BasicSearchPage />;
};

function App() {
  useEffect(() => {
    logDev('info', 'JamDung Jobs App initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeContextProvider>
          <CssBaseline />
        <Helmet>
          <title>JamDung Jobs - Find Your Dream Job in Jamaica</title>
          <meta name="description" content="Jamaica's premier job search platform. Connect with top employers and find your dream job across the island." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Helmet>
        
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SimpleMobileNav />
            
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/demo" element={<HomePageDemo />} />
                <Route path="/search" element={
                  <SmartJobDiscovery 
                    onSearch={(criteria) => console.warn('🔍 Search:', criteria)}
                    onClearFilters={() => console.warn('🧹 Filters cleared')}
                  />
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/jobs" element={<JobSearchPage />} />
                <Route path="/search/jobs" element={<UniversalJobSearch showFilters={true} variant="full" />} />
                <Route path="/search/basic" element={<BasicSearchPage />} />
                <Route path="/search/test" element={<SearchTestPage />} />
                <Route path="/home/new" element={<HomePage />} />
                <Route path="/jobs-demo" element={<JobSearchDemo />} />
                <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                <Route path="/jobs/:jobId/apply" element={<JobApplyPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/feature-demo" element={<FeatureDemo />} />
                <Route path="/industries" element={<IndustryDiscoveryPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRedirect />
                    </ProtectedRoute>
                  }
                />

                {/* Employer Routes */}
                <Route
                  path="/employer/dashboard"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <DashboardRedirect />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/jobs"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <EmployerPostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/applications"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <EmployerApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/profile"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/billing"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <EmployerBillingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/analytics"
                  element={
                    <ProtectedRoute requiredRole="EMPLOYER">
                      <EmployerAnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Candidate Routes */}
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute requiredRole="JOBSEEKER">
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredRole="JOBSEEKER">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume-builder"
                  element={
                    <ProtectedRoute requiredRole="JOBSEEKER">
                      <ResumeBuilderPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
          </div>
        </Router>
        </ThemeContextProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
