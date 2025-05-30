import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    skills: [],
    // Employer specific fields
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setError('');
        setLoading(true);
        console.log("Fetching profile data for user role:", user?.role);
        
        const endpoint = user?.role === 'EMPLOYER' 
          ? 'http://localhost:5000/api/employer/profile'
          : 'http://localhost:5000/api/users/me';
          
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        if (response.status === 200) {
          const data = response.data;
          console.log('Profile data:', data);
          setProfileData(data);
          
          // Initialize form data with fetched profile data
          setFormData({
            name: data.name || user?.name || '',
            phone: data.phone || '',
            address: data.address || '',
            bio: data.bio || '',
            skills: data.skills || [],
            // Employer specific fields
            companyName: data.companyName || '',
            companyWebsite: data.companyWebsite || '',
            companyLocation: data.companyLocation || '',
            companyDescription: data.companyDescription || ''
          });
        } else {
          console.error('Failed to fetch profile:', response.status);
          setError('Failed to load profile data. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  // For debugging purposes - remove in production
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Profile data:", profileData);
    console.log("Form data:", formData);
    console.log("Loading state:", loading);
  }, [user, profileData, formData, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill selection changes
  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the new endpoint for employer profiles
      const endpoint = user?.role === 'EMPLOYER' 
        ? 'http://localhost:5000/api/employer/create-company'
        : 'http://localhost:5000/api/users/me';
      
      const dataToSubmit = user?.role === 'EMPLOYER'
        ? {
            // Only include fields that exist in the Prisma schema
            name: formData.companyName, // Company name field
            website: formData.companyWebsite,
            location: formData.companyLocation,
            description: formData.companyDescription, // Changed to match the expected field name
          }
        : {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            bio: formData.bio,
            skills: formData.skills
          };

      const response = await axios.put(endpoint, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });

      if (response.status === 200) {
        setProfileData(response.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel editing and revert to original values
  const handleCancel = () => {
    setFormData({
      name: profileData?.name || user?.name || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
      bio: profileData?.bio || '',
      skills: profileData?.skills || [],
      companyName: profileData?.companyName || '',
      companyWebsite: profileData?.companyWebsite || '',
      companyLocation: profileData?.companyLocation || '',
      companyDescription: profileData?.companyDescription || ''
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p>Loading profile information...</p>
          {/* You could add a spinner here */}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderTop: '4px solid #006400' // Jamaican green color for the header
      }}>
        <h2 style={{ margin: 0 }}>{user?.role === 'EMPLOYER' ? 'Company Profile' : 'Job Seeker Profile'}</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="auth-button"
            style={{ 
              padding: '0.5rem 1rem', 
              margin: 0,
              backgroundColor: '#006400', // Jamaican green
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
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
            {/* Common fields for both user types */}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
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
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            {/* Job seeker specific fields */}
            {user?.role !== 'EMPLOYER' && (
              <>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
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
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <SkillsAutocomplete 
                    value={formData.skills} 
                    onChange={handleSkillsChange} 
                  />
                </div>
              </>
            )}

            {/* Employer specific fields */}
            {user?.role === 'EMPLOYER' && (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    placeholder="Enter your company website"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Company Location</label>
                  <input
                    type="text"
                    name="companyLocation"
                    value={formData.companyLocation}
                    onChange={handleInputChange}
                    placeholder="Enter your company location"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Company Description</label>
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your company"
                    rows="4"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#006400', // Jamaican green
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Common fields for both user types */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Name</h3>
              <p style={{ fontSize: '1.1rem' }}>{profileData?.name || 'Not provided'}</p>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Email</h3>
              <p style={{ fontSize: '1.1rem' }}>{profileData?.email || user?.email || 'Not provided'}</p>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Phone</h3>
              <p style={{ fontSize: '1.1rem' }}>{profileData?.phone || 'Not provided'}</p>
            </div>

            {/* Job seeker specific fields */}
            {user?.role !== 'EMPLOYER' && (
              <>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Address</h3>
                  <p style={{ fontSize: '1.1rem' }}>{profileData?.address || 'Not provided'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Bio</h3>
                  <p style={{ fontSize: '1.1rem' }}>{profileData?.bio || 'Not provided'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Skills</h3>
                  {profileData?.skills && profileData.skills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profileData.skills.map((skill, index) => (
                        <span key={index} style={{
                          backgroundColor: '#f0f8ff',
                          border: '1px solid #4682b4',
                          borderRadius: '16px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.9rem',
                          color: '#4682b4'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '1.1rem' }}>No skills added yet</p>
                  )}
                </div>
              </>
            )}

            {/* Employer specific fields */}
            {user?.role === 'EMPLOYER' && (
              <>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Company Name</h3>
                  <p style={{ fontSize: '1.1rem' }}>{profileData?.companyName || 'Not provided'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Company Website</h3>
                  {profileData?.companyWebsite ? (
                    <a 
                      href={profileData.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#006400', textDecoration: 'underline' }}
                    >
                      {profileData.companyWebsite}
                    </a>
                  ) : (
                    <p style={{ fontSize: '1.1rem' }}>Not provided</p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Company Location</h3>
                  <p style={{ fontSize: '1.1rem' }}>{profileData?.companyLocation || 'Not provided'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#006400' }}>Company Description</h3>
                  <p style={{ fontSize: '1.1rem' }}>{profileData?.companyDescription || 'Not provided'}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
