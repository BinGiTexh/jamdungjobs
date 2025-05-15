import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl, buildAssetUrl } from '../../config';
import JobManagementModal from './JobManagementModal';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import axios from 'axios';

// Logo Upload Modal Component
const LogoUploadModal = ({ onClose, onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
      onClose();
    }
  };

  const handleFileSelect = () => {
    void fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
      onClose();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: { xs: 2, sm: 3 }
      }}
      onClick={onClose}
    >
      <Paper
        onClick={e => e.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: { xs: '90%', sm: '450px' },
          maxHeight: '90vh',
          overflowY: 'auto',
          p: { xs: 2, sm: 3 },
          position: 'relative',
          borderRadius: 2
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ mb: 3 }}>
          Upload Company Logo
        </Typography>

        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: dragOver ? 'primary.50' : 'background.paper',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Box sx={{ mb: 2 }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              Drag and drop your logo here
            </Typography>
            <Typography variant="body2" color="textSecondary">
              or click to browse
            </Typography>
          </Box>

          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
            Recommended: 400x400px, PNG or JPG (max 5MB)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [jobs, setJobs] = useState([]);
  const [showJobModal, setShowJobModal] = useState(null);
  const [companyProfile, setCompanyProfile] = useState({
    name: user?.company || '',
    industry: '',
    location: '',
    description: '',
    logoUrl: null,
    website: '',
    employeeCount: '',
    founded: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    benefits: [],
    culture: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Fetch company profile on component mount
  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/employer/jobs');
      setJobs(response.data || []); // Ensure we always have an array
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Don't show error to user, just set empty jobs array
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSave = async (jobData) => {
    try {
      if (showJobModal.mode === 'create') {
        const response = await axios.post('/api/employer/jobs', jobData);
        setJobs(prev => [...prev, response.data]);
      } else {
        const response = await axios.put(`/api/employer/jobs/${showJobModal.jobId}`, jobData);
        setJobs(prev => prev.map(job => 
          job.id === showJobModal.jobId ? response.data : job
        ));
      }
      setShowJobModal(null);
      setMessage({ type: 'success', text: `Job ${showJobModal.mode === 'create' ? 'created' : 'updated'} successfully` });
    } catch (error) {
      console.error('Error saving job:', error);
      setMessage({ type: 'error', text: 'Failed to save job' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      await axios.delete(`/api/employer/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setMessage({ type: 'success', text: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage({ type: 'error', text: 'Failed to delete job' });
    }
  };

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jamdung_auth_token');
        if (!token) {
          return; // Don't try to fetch if there's no token
        }

        const response = await fetch('http://localhost:5000/api/employer/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status !== 404) { // Only show error for non-404 responses
            throw new Error('Failed to fetch profile');
          }
        }

        const data = await response.json();
        setCompanyProfile({
          name: data.name || '',
          industry: data.industry || '',
          location: data.location || '',
          description: data.description || '',
          logoUrl: data.logoUrl || null,
          website: data.website || '',
          employeeCount: data.employeeCount || '',
          founded: data.founded || '',
          socialLinks: data.socialLinks || {
            linkedin: '',
            twitter: '',
            facebook: ''
          },
          culture: data.culture || ''
        });
      } catch (error) {
        // Only set error message for network failures or server errors
        if (error.message !== 'Failed to fetch profile') {
          setMessage({ 
            type: 'error', 
            text: 'Unable to connect to the server. Please check your connection and try again.'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
    fetchJobs();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/employer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        },
        body: JSON.stringify({
          name: companyProfile.name,
          industry: companyProfile.industry,
          location: companyProfile.location,
          description: companyProfile.description,
          website: companyProfile.website,
          employeeCount: companyProfile.employeeCount,
          founded: companyProfile.founded,
          socialLinks: companyProfile.socialLinks,
          culture: companyProfile.culture
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile. Please try again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setCompanyProfile(prev => ({
        ...prev,
        ...data.profile,
        logoUrl: data.profile.logoUrl || prev.logoUrl // Keep the logo state in sync
      }));
      setMessage({ 
        type: 'success', 
        text: 'Your company profile has been updated successfully! 🎉'
      });
      
      // Prevent page reload
      return false;
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Update failed: ${error.message}. Please ensure all required fields are filled correctly and try again.`
      });
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size exceeds 5MB limit');
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        throw new Error('Only JPEG and PNG files are allowed');
      }

      // Create FormData and append file
      const formData = new FormData();
      formData.append('logo', file);

      // Get token from correct storage key
      const token = localStorage.getItem('jamdung_auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Upload to server
      const response = await fetch(buildApiUrl('api/employer/logo'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload logo');
      }

      const data = await response.json();
      
      // Update company profile with the new logo URL
      setCompanyProfile(prev => ({
        ...prev,
        logoUrl: data.logoUrl
      }));
      
      setMessage({ 
        type: 'success', 
        text: 'Company logo uploaded successfully! 🎉'
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage({ 
        type: 'error', 
        text: `Logo upload failed: ${error.message}`
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="dashboard-header">
        <div className="company-header">
          <div className="company-logo-large">
            {companyProfile.logoUrl ? (
              <img 
                src={buildAssetUrl(companyProfile.logoUrl)} 
                alt={`${companyProfile.name} logo`} 
              />
            ) : (
              <div className="logo-placeholder-large">
                {companyProfile.name ? companyProfile.name[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="company-info">
            <h1>{companyProfile.name || 'Your Company Name'}</h1>
            {companyProfile.industry && <span className="industry-badge">{companyProfile.industry}</span>}
            {companyProfile.location && (
              <div className="location">
                <i className="fas fa-map-marker-alt"></i> {companyProfile.location}
              </div>
            )}
          </div>
        </div>
      </div>

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

      {activeTab === 'profile' && (
        <div className="profile-section">
          <h2>Company Profile</h2>
          <div className="section-description">
            Welcome back, {user?.name || user?.email}!
          </div>
          <p className="section-description">
            Build your company's presence on JamDung Jobs. A complete profile helps attract the best candidates.
          </p>

          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <select
                    value={companyProfile.industry}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, industry: e.target.value }))}
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="tourism">Tourism</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <LocationAutocomplete
                    value={companyProfile.location}
                    onChange={(value) => setCompanyProfile(prev => ({ ...prev, location: value }))}
                    placeholder="Company location"
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={companyProfile.website}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Founded Year</label>
                  <input
                    type="number"
                    value={companyProfile.founded}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, founded: e.target.value }))}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="form-group">
                  <label>Employee Count</label>
                  <select
                    value={companyProfile.employeeCount}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, employeeCount: e.target.value }))}
                  >
                    <option value="">Select Range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Company Details</h3>
              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  value={companyProfile.description}
                  onChange={(e) => setCompanyProfile(prev => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Tell potential candidates about your company..."
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label>Company Culture</label>
                <textarea
                  value={companyProfile.culture}
                  onChange={(e) => setCompanyProfile(prev => ({ ...prev, culture: e.target.value }))}
                  placeholder="Describe your company culture and values..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Social Media</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={companyProfile.socialLinks.linkedin}
                    onChange={(e) => setCompanyProfile(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    placeholder="LinkedIn profile URL"
                  />
                </div>

                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="url"
                    value={companyProfile.socialLinks.twitter}
                    onChange={(e) => setCompanyProfile(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="Twitter profile URL"
                  />
                </div>

                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="url"
                    value={companyProfile.socialLinks.facebook}
                    onChange={(e) => setCompanyProfile(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                    placeholder="Facebook page URL"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Company Logo</label>
              <div className="logo-upload">
                <div className="logo-container">
                  {companyProfile.logoUrl ? (
                    <div className="logo-preview">
                      <img 
                        src={buildAssetUrl(companyProfile.logoUrl)} 
                        alt="Company logo preview" 
                      />
                    </div>
                  ) : (
                    <div className="logo-placeholder">
                      <span>No logo uploaded</span>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      className="upload-button"
                      onClick={() => setShowLogoModal(true)}
                    >
                      {companyProfile.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <p className="upload-hint">Recommended: 400x400px, PNG or JPG</p>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="submit-button">
              Save Profile
            </button>
          </form>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="jobs-section">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Job Postings</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowJobModal({ mode: 'create' })}
            >
              Add New Job
            </Button>
          </Box>

          <Grid container spacing={3}>
            {jobs.map(job => (
              <Grid item xs={12} key={job.id}>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography color="textSecondary">
                        {job.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="body2" color="textSecondary">
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Chip
                        label={job.status}
                        color={
                          job.status === 'ACTIVE' ? 'success' :
                          job.status === 'DRAFT' ? 'default' :
                          job.status === 'CLOSED' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography>
                        {job.applications?.length || 0} Applications
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2} sx={{ textAlign: 'right' }}>
                      <IconButton
                        onClick={() => setShowJobModal({ mode: 'edit', jobId: job.id })}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteJob(job.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            {jobs.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No job postings yet. Click "Add New Job" to create your first posting.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </div>
      )}

      {showLogoModal && (
        <LogoUploadModal
          onClose={() => setShowLogoModal(false)}
          onUpload={handleLogoUpload}
        />
      )}

      {showJobModal && (
        <JobManagementModal
          open={!!showJobModal}
          onClose={() => setShowJobModal(null)}
          mode={showJobModal.mode}
          jobData={showJobModal.mode === 'edit' ? jobs.find(j => j.id === showJobModal.jobId) : null}
          onSave={handleJobSave}
          applications={showJobModal.mode === 'edit' ? jobs.find(j => j.id === showJobModal.jobId)?.applications || [] : []}
        />
      )}
    </div>
  );
};
