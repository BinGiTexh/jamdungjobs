import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Alert, CircularProgress } from '@mui/material';
import api from '../../utils/axiosConfig';
import BasicInfoCard from './BasicInfoCard';
import AboutMeCard from './AboutMeCard';
import PhotoUploadCard from './PhotoUploadCard';

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/me');
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedData) => {
    // If we receive user data directly, update the profile
    if (updatedData.user) {
      setProfile({
        ...profile,
        ...updatedData.user,
        candidateProfile: {
          ...profile.candidateProfile,
          ...updatedData.profile
        }
      });
    } else {
      // If we receive just the user data
      setProfile({
        ...profile,
        ...updatedData
      });
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          sx={{
            '& .MuiAlert-icon': {
              color: '#FFD700'
            }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="info"
          sx={{
            '& .MuiAlert-icon': {
              color: '#FFD700'
            }
          }}
        >
          No profile data available. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ width: 200 }}>
              <PhotoUploadCard 
                userProfile={profile} 
                onProfileUpdate={handleProfileUpdate} 
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <BasicInfoCard 
            userProfile={profile} 
            onProfileUpdate={handleProfileUpdate} 
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <AboutMeCard 
            userProfile={profile} 
            onProfileUpdate={handleProfileUpdate} 
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CandidateProfile;

