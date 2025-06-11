import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../utils/axiosConfig';

const BasicInfoCard = ({ userProfile, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    email: userProfile.email || '',
    phoneNumber: userProfile.phoneNumber || ''
  });
  const [error, setError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/api/user/profile', formData);
      onProfileUpdate(response.data);
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <>
      <Card sx={{ backgroundColor: '#1A1A1A', color: 'white', position: 'relative' }}>
        <IconButton 
          onClick={handleOpen}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: '#FFD700'
          }}
        >
          <EditIcon />
        </IconButton>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Basic Information
          </Typography>
          <Stack spacing={1}>
            <Typography>
              <strong>Name:</strong> {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography>
              <strong>Email:</strong> {userProfile.email}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {userProfile.phoneNumber || 'Not provided'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1A1A1A', color: '#FFD700' }}>
          Edit Basic Information
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#1A1A1A', pt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Stack spacing={2}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)',
                }
              }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)',
                }
              }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)',
                }
              }}
            />
            <TextField
              name="phoneNumber"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)',
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1A1A1A', p: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: 'rgba(255, 215, 0, 0.7)',
              '&:hover': {
                color: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: '#FFD700',
              color: '#1A1A1A',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.8)'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BasicInfoCard;

