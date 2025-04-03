// App.js - Main application component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import JobListingPage from './pages/JobListingPage';
import JobDetailPage from './pages/JobDetailPage';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostJobPage from './pages/PostJobPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { config } from './config';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading BingiTech Jobs...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobListingPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              <Route path="/employer/dashboard" element={
                <PrivateRoute role="employer">
                  <EmployerDashboard />
                </PrivateRoute>
              } />
              <Route path="/employer/post-job" element={
                <PrivateRoute role="employer">
                  <PostJobPage />
                </PrivateRoute>
              } />
              <Route path="/candidate/dashboard" element={
                <PrivateRoute role="candidate">
                  <CandidateDashboard />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// App.css - Main application styles
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #1e88e5;
  --secondary-color: #ffc107;
  --dark-color: #333;
  --light-color: #f4f4f4;
  --danger-color: #dc3545;
  --success-color: #28a745;
  --max-width: 1100px;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  background: #f8f9fa;
  color: #333;
}

/* Mobile-first approach */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.container {
  width: 100%;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  background: var(--primary-color);
  color: #fff;
  padding: 0.6rem 1.3rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 4px;
  transition: opacity 0.2s ease-in;
  outline: none;
  width: 100%;
  text-align: center;
}

.btn:hover {
  opacity: 0.9;
}

.btn-light {
  background: var(--light-color);
  color: var(--dark-color);
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-secondary {
  background: var(--secondary-color);
  color: #333;
}

.btn-success {
  background: var(--success-color);
  color: #fff;
}

.btn-danger {
  background: var(--danger-color);
  color: #fff;
}

.card {
  background: #fff;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Form styles */
.form-group {
  margin-bottom: 1rem;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Media queries for larger screens */
@media (min-width: 768px) {
  .main-content {
    max-width: 768px;
  }

  .btn {
    width: auto;
  }
}

@media (min-width: 992px) {
  .main-content {
    max-width: 992px;
  }
}

@media (min-width: 1200px) {
  .main-content {
    max-width: var(--max-width);
  }
}

// components/Header.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>BingiTech<span>Jobs</span></h1>
        </Link>
        
        <div className="menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</Link></li>
            
            {!isAuthenticated ? (
              <>
                <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
              </>
            ) : (
              <>
                {user?.role === 'employer' ? (
                  <>
                    <li><Link to="/employer/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
                    <li><Link to="/employer/post-job" onClick={() => setMenuOpen(false)}>Post Job</Link></li>
                  </>
                ) : (
                  <li><Link to="/candidate/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
                )}
                <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
                <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

// components/Header.css
.header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: var(--max-width);
  margin: 0 auto;
}

.logo {
  text-decoration: none;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--dark-color);
}

.logo span {
  color: var(--primary-color);
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: var(--dark-color);
  border-radius: 3px;
}

.nav-menu {
  position: fixed;
  top: 60px;
  right: -100%;
  width: 70%;
  height: calc(100vh - 60px);
  background-color: #fff;
  transition: 0.4s ease;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.nav-menu.active {
  right: 0;
}

.nav-menu ul {
  list-style: none;
}

.nav-menu ul li {
  margin: 1.5rem 0;
  padding: 0 1rem;
}

.nav-menu ul li a {
  text-decoration: none;
  color: var(--dark-color);
  font-size: 1.1rem;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
}

/* Media queries for larger screens */
@media (min-width: 768px) {
  .menu-toggle {
    display: none;
  }

  .nav-menu {
    position: static;
    width: auto;
    height: auto;
    box-shadow: none;
    background-color: transparent;
  }

  .nav-menu ul {
    display: flex;
  }

  .nav-menu ul li {
    margin: 0 1rem;
    padding: 0;
  }
}

// components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>BingiTech Jobs</h3>
          <p>Connecting Jamaican talent with opportunities worldwide.</p>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/jobs">Browse Jobs</Link></li>
            <li><Link to="/employer/post-job">Post a Job</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} BingiTech LLC. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

// components/Footer.css
.footer {
  background-color: var(--dark-color);
  color: #fff;
  padding: 2rem 1rem 1rem;
  margin-top: 2rem;
}

.footer-container {
  display: flex;
  flex-direction: column;
  max-width: var(--max-width);
  margin: 0 auto;
}

.footer-section {
  margin-bottom: 1.5rem;
}

.footer-section h3, .footer-section h4 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.footer-section p {
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  margin-top: 0.5rem;
}

.social-links a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  margin-right: 0.5rem;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.social-links a:hover {
  background-color: var(--primary-color);
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #ddd;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: var(--secondary-color);
}

.footer-bottom {
  text-align: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Media queries for larger screens */
@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
  }

  .footer-section {
    flex: 1;
    margin-right: 2rem;
    margin-bottom: 0;
  }

  .footer-section:last-child {
    margin-right: 0;
  }
}

// components/JobCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './JobCard.css';

const JobCard = ({ job, featured }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`job-card ${featured ? 'featured' : ''}`}>
      {featured && <div className="featured-badge">Featured</div>}
      
      <div className="job-card-header">
        <div className="company-logo">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={`${job.companyName} logo`} />
          ) : (
            <div className="logo-placeholder">{job.companyName.charAt(0)}</div>
          )}
        </div>
        <div className="job-info">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.companyName}</p>
        </div>
      </div>
      
      <div className="job-details">
        <div className="detail-item">
          <i className="fas fa-map-marker-alt"></i>
          <span>{job.location}</span>
        </div>
        <div className="detail-item">
          <i className="fas fa-dollar-sign"></i>
          <span>{job.salary || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <i className="fas fa-briefcase"></i>
          <span>{job.jobType}</span>
        </div>
      </div>
      
      <div className="job-card-footer">
        <p className="posted-date">Posted: {formatDate(job.createdAt)}</p>
        <Link to={`/jobs/${job.id}`} className="view-job-btn">View Job</Link>
      </div>
    </div>
  );
};

export default JobCard;

// components/JobCard.css
.job-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.job-card.featured {
  border: 2px solid var(--secondary-color);
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: -30px;
  background-color: var(--secondary-color);
  color: var(--dark-color);
  padding: 5px 30px;
  font-size: 0.8rem;
  font-weight: bold;
  transform: rotate(45deg);
}

.job-card-header {
  display: flex;
  margin-bottom: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-color);
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
}

.job-info {
  flex: 1;
}

.job-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: var(--dark-color);
}

.company-name {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.detail-item i {
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.posted-date {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.view-job-btn {
  display: inline-block;
  background-color: var(--primary-color);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.view-job-btn:hover {
  background-color: #1565c0;
}

/* Media queries for smaller screens */
@media (max-width: 480px) {
  .job-card-header {
    flex-direction: column;
  }
  
  .company-logo {
    margin-bottom: 1rem;
  }
  
  .job-card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .posted-date {
    margin-bottom: 0.5rem;
  }
}

// pages/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import JobCard from '../components/JobCard';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  // Sample featured jobs (to be replaced with API call)
  const featuredJobs = [
    {
      id: '1',
      title: 'Senior Developer',
      companyName: 'Tech Innovators Ltd',
      companyLogo: null,
      location: 'Kingston, Jamaica',
      salary: '$60,000 - $80,000',
      jobType: 'Full-time',
      createdAt: '2025-03-20T12:00:00Z'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      companyName: 'Island Brands',
      companyLogo: null,
      location: 'Montego Bay, Jamaica',
      salary: '$45,000 - $55,000',
      jobType: 'Full-time',
      createdAt: '2025-03-18T09:30:00Z'
    },
    {
      id: '3',
      title: 'Hotel Front Desk Agent',
      companyName: 'Sunset Resort & Spa',
      companyLogo: null,
      location: 'Negril, Jamaica',
      salary: '$25,000 - $35,000',
      jobType: 'Full-time',
      createdAt: '2025-03-15T14:45:00Z'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchTerm}&location=${location}`);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job in Jamaica</h1>
          <p>Connect with top employers and opportunities across Jamaica and beyond.</p>
          
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Job title, skills, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Location (City or Parish)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">Find Jobs</button>
          </form>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs">
        <div className="section-header">
          <h2>Featured Jobs</h2>
          <a href="/jobs" className="view-all">View All Jobs</a>
        </div>
        <div className="jobs-container">
          {featuredJobs.map(job => (
            <JobCard key={job.id} job={job} featured={true} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="job-categories">
        <h2>Popular Job Categories</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3>Technology</h3>
            <p>152 Jobs Available</p>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-hotel"></i>
            </div>
            <h3>Hospitality</h3>
            <p>78 Jobs Available</p>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Finance</h3>
            <p>43 Jobs Available</p>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-stethoscope"></i>
            </div>
            <h3>Healthcare</h3>
            <p>67 Jobs Available</p>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Education</h3>
            <p>51 Jobs Available</p>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3>Retail</h3>
            <p>93 Jobs Available</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up as a job seeker or employer to get started.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Complete Your Profile</h3>
            <p>Add your resume, skills, and preferences to stand out.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Apply or Post Jobs</h3>
            <p>Apply to jobs or post opportunities if you're an employer.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Are You An Employer?</h2>
            <p>Post your jobs to reach thousands of qualified candidates across Jamaica.</p>
            <a href="/employer/post-job" className="cta-button">Post a Job Now</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

// pages/HomePage.css
.homepage {
  width: 100%;
}

/* Hero Section */
.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1526761122248-c31c908aff48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  color: #fff;
  padding: 4rem 1rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
}

.search-input-group {
  margin-bottom: 1rem;
}

.search-input-group input {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  background-color: var(--primary-color);
  color: #fff;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #1565c0;
}

/* Featured Jobs Section */
.featured-jobs {
  padding: 3rem 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.8rem;
  color: var(--dark-color);
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #1565c0;
}

.jobs-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Job Categories Section */
.job-categories {
  padding: 3rem 1rem;
  background-color: #f9f9f9;
  text-align: center;
}

.job-categories h2 {
  font-size: 1.8rem;
  color: var(--dark-color);
  margin-bottom: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.category-card {
  background-color: #fff;
  padding: 2rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-icon {
  width: 70px;
  height: 70px;
  background-color: rgba(30, 136, 229, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem;
}

.category-icon i {
  font-size: 2rem;
  color: var(--primary-color);
}

.category-card h3 {
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.category-card p {
  color: #666;
  font-size: 0.9rem;
}

/* How It Works Section */
.how-it-works {
  padding: 3rem 1rem;
  text-align: center;
}

.how-it-works h2 {
  font-size: 1.8rem;
  color: var(--dark-color);
  margin-bottom: 2rem;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.step-number {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.step h3 {
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.step p {
  color: #666;
}

/* CTA Section */
.cta-section {
  padding: 3rem 1rem;
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  color: #fff;
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.cta-content p {
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background-color: var(--secondary-color);
  color: var(--dark-color);
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #ffa000;
}

/* Media queries for larger screens */
@media (min-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .search-form {
    flex-direction: row;
    align-items: center;
  }

  .search-input-group {
    flex: 1;
    margin-right: 1rem;
    margin-bottom: 0;
  }

  .search-btn {
    width: auto;
  }

  .jobs-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps-container {
    flex-direction: row;
  }

  .step {
    flex: 1;
  }
}

@media (min-width: 992px) {
  .hero h1 {
    font-size: 3rem;
  }

  .jobs-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
