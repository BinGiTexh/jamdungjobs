import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaRegClock } from 'react-icons/fa';

// Inline component definitions to avoid missing module errors
const LoginPage = () => {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register</Link>
      </p>
    </div>
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

const JobSearchPage = () => (
  <div style={{ padding: '20px' }}>
    <h2>Job Search</h2>
    <p>Search and apply for jobs here.</p>
  </div>
);

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchTerm, 'in', location);
  };

  // Sample job data
  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Jamaica',
      location: 'Kingston, Jamaica',
      salary: '$80,000 - $120,000 per year',
      type: 'Full-time',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Caribbean Digital',
      location: 'Montego Bay, Jamaica',
      salary: '$50,000 - $70,000 per year',
      type: 'Full-time',
      posted: '3 days ago'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'Island Tech Solutions',
      location: 'Kingston, Jamaica',
      salary: '$70,000 - $90,000 per year',
      type: 'Full-time',
      posted: '1 week ago'
    }
  ];

  return (
    <div>
      <section className="hero-section">
        <h1>Find Your Next Tech Job in Jamaica</h1>
        <p>Search through thousands of job listings</p>
        
        <form onSubmit={handleSearch} className="search-container">
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '1.2rem', color: '#666' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Job title, keywords, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <FaMapMarkerAlt style={{ position: 'absolute', left: '1rem', top: '1.2rem', color: '#666' }} />
            <input
              type="text"
              className="search-input"
              placeholder="City or parish"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <button type="submit" className="search-button">
            Find Jobs
          </button>
        </form>
      </section>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2>Featured Jobs</h2>
        <div>
          {featuredJobs.map(job => (
            <div key={job.id} className="job-card">
              <h3 className="job-title">{job.title}</h3>
              <p className="company-name"><FaBuilding style={{ marginRight: '0.5rem' }} />{job.company}</p>
              <p className="job-location"><FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />{job.location}</p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <p className="job-salary"><FaBriefcase style={{ marginRight: '0.5rem' }} />{job.salary}</p>
                <p style={{ color: '#666' }}><FaRegClock style={{ marginRight: '0.5rem' }} />{job.posted}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => (
  <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
    <h2>Register</h2>
    <p>Registration form coming soon...</p>
  </div>
);

const ProfilePage = () => (
  <div style={{ padding: '20px' }}>
    <h2>Profile</h2>
    <p>Your profile information will appear here.</p>
  </div>
);

function Navigation() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>JamDung Jobs</h1>
        </Link>
        
        <div className="nav-links">
          <Link to="/jobs">Find Jobs</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/salaries">Salaries</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>
              <button
                onClick={logout}
                className="auth-button"
                style={{ margin: 0, padding: '0.5rem 1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="auth-button" style={{ margin: 0, padding: '0.5rem 1rem', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Navigation />
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
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
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <JobSearchPage />
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
