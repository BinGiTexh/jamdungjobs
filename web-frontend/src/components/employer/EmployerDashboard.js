import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl, buildAssetUrl } from '../../config';
import './EmployerDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { EnvDebug } from '../debug/EnvDebug';
import { LocationAutocomplete } from '../common/LocationAutocomplete';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Upload Company Logo</h3>
        <div
          className="logo-upload-area"
          style={{ 
            backgroundColor: dragOver ? 'var(--light-green)' : 'transparent'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div>
            <p>Drag and drop your logo here</p>
            <p>or</p>
            <button 
              className="upload-button" 
              type="button"
              onClick={handleFileSelect}
            >
              Choose File
            </button>
          </div>
          <p className="upload-hint">Recommended: 400x400px, PNG or JPG (max 5MB)</p>
        </div>
      </div>
    </div>
  );
};

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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
      <EnvDebug />
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
          <div className="section-header">
            <h2>Job Postings</h2>
            <button className="add-job-button">+ Add New Job</button>
          </div>

          <div className="job-listings">
            <div className="job-listing-header">
              <div>Job Title</div>
              <div>Location</div>
              <div>Posted Date</div>
              <div>Status</div>
              <div>Applications</div>
              <div>Actions</div>
            </div>
            
            <div className="no-jobs">
              No job postings yet. Click "Add New Job" to create your first posting.
            </div>
          </div>
        </div>
      )}

      {showLogoModal && (
        <LogoUploadModal
          onClose={() => setShowLogoModal(false)}
          onUpload={handleLogoUpload}
        />
      )}
    </div>
  );
};
