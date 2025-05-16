import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { useAuth } from './context/AuthContext';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import Register from './components/Register';
import JobSearch from './components/JobSearch';
import { buildAssetUrl } from './config';
import { FindJobsModal } from './components/FindJobsModal';
import HomePage from './components/home/HomePage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobApplyPage from './pages/JobApplyPage';
import EmployerApplicationsPage from './pages/EmployerApplicationsPage';
import EmployerPostJobPage from './pages/EmployerPostJobPage';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';

// Inline component definitions to avoid missing module errors
const LoginPage = () => {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Check if we're coming from the employer hiring button
  const isEmployerRedirect = location.state?.employerRedirect;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      let redirectTo = location.state?.from;
      
      if (!redirectTo) {
        // Redirect based on user role
        redirectTo = user.role === 'EMPLOYER' 
          ? '/employer/dashboard'
          : '/candidate/dashboard';
      }
      
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image with Jamaican styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="sm" sx={{ 
        position: 'relative', 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80vh',
        py: 8
      }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Card background gradient */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
              opacity: 0.3,
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h4" component="h1" align="center" sx={{ 
              mb: 2, 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              Sign In to JamDung Jobs
            </Typography>
            
            {isEmployerRedirect && (
              <Typography variant="subtitle1" align="center" sx={{ 
                mb: 3, 
                color: 'rgba(255, 215, 0, 0.8)',
                fontWeight: 500,
                backgroundColor: 'rgba(44, 85, 48, 0.2)',
                py: 1,
                px: 2,
                borderRadius: 1,
              }}>
                Sign in to start posting jobs and hiring top talent
              </Typography>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  sx: {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      borderWidth: '2px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.8)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 500 },
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  sx: {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      borderWidth: '2px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.8)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 500 },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Signing in...' : isEmployerRedirect ? 'Sign In to Start Hiring' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Don't have an account?{' '}
                  <Link 
                    to={isEmployerRedirect ? "/employer/register" : "/register"} 
                    style={{ color: '#FFD700', textDecoration: 'none' }}
                  >
                    {isEmployerRedirect ? 'Sign up as an employer' : 'Sign up'}
                  </Link>
                </Typography>
              </Box>
            </form>
            
            <Typography variant="body1" align="center" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 500 }}>
                Register
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}!</p>
      <button 
        onClick={logout}
        style={{
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Logout
      </button>
    </div>
  );
};

const JobSearchPage = () => <JobSearch />;


const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Register />;
};

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

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
                <button 
                  onClick={logout}
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
                <button 
                  onClick={logout}
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
            // Hide navigation links when user is not logged in since we have buttons on the homepage
            <>
              {/* Navigation links for non-logged in users removed */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employerProfile, setEmployerProfile] = useState(null);

  // Fetch employer profile if user is an employer
  useEffect(() => {
    const fetchEmployerProfile = async () => {
      if (user?.role === 'employer') {
        try {
          const response = await fetch('http://localhost:5000/api/employer/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Employer profile data:', data);
            setEmployerProfile(data);
          } else {
            console.error('Failed to fetch employer profile:', response.status);
          }
        } catch (err) {
          console.error('Error fetching employer profile:', err);
        }
      }
    };

    fetchEmployerProfile();
  }, [user?.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      // Update the user context with new data if needed
    } catch (err) {
      setError(err.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0 }}>Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="auth-button"
            style={{ padding: '0.5rem 1rem', margin: 0 }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da', 
          padding: '0.75rem', 
          marginBottom: '1rem', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ 
          color: '#155724', 
          backgroundColor: '#d4edda', 
          padding: '0.75rem', 
          marginBottom: '1rem', 
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows="4"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="auth-button"
                style={{ padding: '0.5rem 1rem' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    bio: user?.bio || ''
                  });
                }}
                className="auth-button"
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info" style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Email:</strong> 
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Role:</strong> 
              <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Name:</strong> 
              <span>{user?.name || 'Not set'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Phone:</strong> 
              <span>{user?.phone || 'Not set'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Address:</strong> 
              <span>{user?.address || 'Not set'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <strong>Bio:</strong> 
              <span>{user?.bio || 'Not set'}</span>
            </div>
            {user?.role === 'candidate' && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                <strong>Resume:</strong> 
                <span>
                  {user?.resumeUrl ? (
                    <a 
                      href={user.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      View Resume
                    </a>
                  ) : 'Not uploaded'}
                </span>
              </div>
            )}
            {user?.role === 'employer' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                  <strong>Company Logo:</strong>
                  <span>
                    {employerProfile?.logoUrl ? (
                      <img 
                        src={buildAssetUrl(employerProfile.logoUrl)} 
                        alt="Company Logo" 
                        style={{ 
                          maxWidth: '100px', 
                          maxHeight: '100px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }} 
                      />
                    ) : (
                      <span style={{ color: '#6c757d' }}>Not uploaded</span>
                    )}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', marginLeft: '120px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    To update your company logo, please visit the Company Dashboard
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
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
              <Route path="/jobs/:jobId/apply" element={<JobApplyPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/employer/dashboard"
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
