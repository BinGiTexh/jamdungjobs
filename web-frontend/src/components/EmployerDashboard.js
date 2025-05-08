import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBuilding, FaMapMarkerAlt, FaBriefcase, FaUpload, FaEdit, FaTrash } from 'react-icons/fa';

const EmployerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Check if user has employer role
  useEffect(() => {
    if (user && user.role !== 'employer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Company profile form state
  const [companyProfile, setCompanyProfile] = useState({
    name: user?.company || user?.companyDetails?.name || '',
    logo: null,
    description: user?.companyDetails?.description || '',
    location: user?.companyDetails?.location || '',
    industry: user?.companyDetails?.industry || '',
    size: user?.companyDetails?.size || '',
    website: user?.companyDetails?.website || '',
  });

  // Preview for logo upload
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Mock job postings data for demo
  const [jobPostings, setJobPostings] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      location: 'Kingston, Jamaica',
      type: 'Full-time',
      salary: '$80,000 - $120,000 per year',
      status: 'Active',
      applications: 12,
      datePosted: '2025-04-30'
    },
    {
      id: 2,
      title: 'Junior Developer',
      location: 'Kingston, Jamaica',
      type: 'Full-time',
      salary: '$40,000 - $60,000 per year',
      status: 'Active',
      applications: 8,
      datePosted: '2025-05-01'
    }
  ]);

  // Handle company profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setCompanyProfile({
      ...companyProfile,
      [name]: value
    });
  };

  // Handle logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyProfile({
        ...companyProfile,
        logo: file
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit company profile form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // In a real implementation, you would use FormData to handle file uploads
      const formData = new FormData();
      Object.keys(companyProfile).forEach(key => {
        if (companyProfile[key] !== null) {
          formData.append(key, companyProfile[key]);
        }
      });

      // For demo purposes, we're just simulating a successful update
      // In a real app, you would make an API call like:
      // await updateProfile(formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Company profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update company profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a job posting
  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobPostings(jobPostings.filter(job => job.id !== jobId));
    }
  };

  return (
    <div className="employer-dashboard">
      <h1>Employer Dashboard</h1>
      
      {/* Dashboard Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          Company Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`} 
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="message success">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="message error">{errorMessage}</div>
      )}

      {/* Company Profile Section */}
      {activeTab === 'profile' && (
        <div className="profile-section">
          <h2>Company Profile</h2>
          <p className="section-description">
            Complete your company profile to attract top talent. A detailed profile increases your visibility to job seekers.
          </p>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Company Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyProfile.name}
                onChange={handleProfileChange}
                required
                placeholder="Your company name"
              />
            </div>

            <div className="form-group logo-upload">
              <label>Company Logo</label>
              <div className="logo-container">
                {logoPreview || companyProfile.logo ? (
                  <div className="logo-preview">
                    <img src={logoPreview || companyProfile.logo} alt="Company logo preview" />
                  </div>
                ) : (
                  <div className="logo-placeholder">
                    <FaBuilding size={40} />
                    <p>No logo uploaded</p>
                  </div>
                )}
                <div className="upload-button-container">
                  <label htmlFor="logo-upload" className="upload-button">
                    <FaUpload /> Upload Logo
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <p className="upload-hint">Recommended size: 300x300px, PNG or JPG</p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Company Description*</label>
              <textarea
                id="description"
                name="description"
                value={companyProfile.description}
                onChange={handleProfileChange}
                required
                placeholder="Tell potential candidates about your company, mission, values, and culture"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={companyProfile.location}
                onChange={handleProfileChange}
                required
                placeholder="Company headquarters location"
              />
            </div>

            <div className="form-group">
              <label htmlFor="industry">Industry*</label>
              <select
                id="industry"
                name="industry"
                value={companyProfile.industry}
                onChange={handleProfileChange}
                required
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="size">Company Size</label>
              <select
                id="size"
                name="size"
                value={companyProfile.size}
                onChange={handleProfileChange}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="website">Company Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={companyProfile.website}
                onChange={handleProfileChange}
                placeholder="https://www.example.com"
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Company Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Job Postings Section */}
      {activeTab === 'jobs' && (
        <div className="jobs-section">
          <div className="section-header">
            <h2>Job Postings</h2>
            <button className="add-job-button">
              + Create New Job Posting
            </button>
          </div>
          
          <p className="section-description">
            Manage your job postings and track applications. Create, edit, or remove job listings.
          </p>

          <div className="job-listings">
            <div className="job-listing-header">
              <div className="job-column title-column">Job Title</div>
              <div className="job-column location-column">Location</div>
              <div className="job-column type-column">Type</div>
              <div className="job-column status-column">Status</div>
              <div className="job-column applications-column">Applications</div>
              <div className="job-column actions-column">Actions</div>
            </div>
            
            {jobPostings.length === 0 ? (
              <div className="no-jobs">
                <p>You don't have any job postings yet. Create your first job listing to start receiving applications.</p>
              </div>
            ) : (
              jobPostings.map(job => (
                <div key={job.id} className="job-listing-row">
                  <div className="job-column title-column">
                    <div className="job-title">{job.title}</div>
                    <div className="job-date">Posted on {job.datePosted}</div>
                  </div>
                  <div className="job-column location-column">
                    <FaMapMarkerAlt /> {job.location}
                  </div>
                  <div className="job-column type-column">
                    <FaBriefcase /> {job.type}
                  </div>
                  <div className="job-column status-column">
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-column applications-column">
                    {job.applications}
                  </div>
                  <div className="job-column actions-column">
                    <button className="action-button edit" title="Edit job">
                      <FaEdit />
                    </button>
                    <button 
                      className="action-button delete" 
                      title="Delete job"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;

