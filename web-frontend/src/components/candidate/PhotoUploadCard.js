import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Avatar,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../../utils/axiosConfig';

const PhotoUploadCard = ({ userProfile, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Photo size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/api/jobseeker/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onProfileUpdate({
        user: userProfile,
        profile: response.data
      });
    } catch (err) {
      setError('Failed to upload photo');
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ backgroundColor: '#1A1A1A', color: 'white', position: 'relative' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={userProfile.candidateProfile?.photoUrl}
            alt={`${userProfile.firstName} ${userProfile.lastName}`}
            sx={{
              width: 120,
              height: 120,
              border: '2px solid #FFD700',
              backgroundColor: 'rgba(255, 215, 0, 0.1)'
            }}
          />
          <label htmlFor="photo-upload">
            <input
              accept="image/*"
              id="photo-upload"
              type="file"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <IconButton
              component="span"
              sx={{
                position: 'absolute',
                right: -10,
                bottom: -10,
                backgroundColor: '#FFD700',
                color: '#1A1A1A',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.8)'
                }
              }}
              disabled={uploading}
            >
              {uploading ? (
                <CircularProgress size={24} sx={{ color: '#1A1A1A' }} />
              ) : (
                <PhotoCameraIcon />
              )}
            </IconButton>
          </label>
        </Box>
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUploadCard;

