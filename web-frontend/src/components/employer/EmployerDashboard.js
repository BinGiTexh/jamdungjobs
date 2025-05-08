import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
    logo: null
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
          logo: data.logoUrl || null
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
          description: companyProfile.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile. Please try again.');
      }

      const data = await response.json();
      setCompanyProfile(prev => ({
        ...prev,
        ...data.profile
      }));
      setMessage({ 
        type: 'success', 
        text: 'Your company profile has been updated successfully! 🎉'
      });
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
      const response = await fetch('http://localhost:5000/api/employer/logo', {
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
        logo: data.logoUrl
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

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

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
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyProfile.name}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, name: e.target.value }))}
                required
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
              <input
                type="text"
                value={companyProfile.location}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, location: e.target.value }))}
                required
                placeholder="e.g., Kingston, Jamaica"
              />
            </div>

            <div className="form-group">
              <label>Company Description</label>
              <textarea
                value={companyProfile.description}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Tell potential candidates about your company..."
              />
            </div>

            <div className="form-group">
              <label>Company Logo</label>
              <div className="logo-upload">
                <div className="logo-container">
                  {companyProfile.logo ? (
                    <div className="logo-preview">
                      <img src={companyProfile.logo} alt="Company logo preview" />
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
                      {companyProfile.logo ? 'Change Logo' : 'Upload Logo'}
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
