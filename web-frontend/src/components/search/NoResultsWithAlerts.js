import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { logError } from '../../utils/loggingUtils';

const NoResultsWithAlerts = ({ 
  searchQuery = '', 
  location = '', 
  onNewSearch,
  showEmailCapture = true 
}) => {
  const [email, setEmail] = useState('');
  const [alertCreated, setAlertCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Popular job categories in Jamaica
  const popularCategories = [
    'Customer Service',
    'Sales',
    'Administrative',
    'IT Support',
    'Marketing',
    'Accounting',
    'Healthcare',
    'Education',
    'Tourism',
    'Banking'
  ];

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const alertData = {
        email: email.trim(),
        keywords: searchQuery.trim(),
        location: location.trim(),
        frequency: 'daily',
        source: 'no_results_search'
      };

      const response = await api.post('/api/email-alerts', alertData);

      if (response.data.success) {
        setAlertCreated(true);
      } else {
        throw new Error(response.data.message || 'Failed to create job alert');
      }
    } catch (error) {
      logError('Failed to create job alert:', error);
      setError('Unable to create job alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySearch = (category) => {
    if (onNewSearch) {
      onNewSearch({ query: category, location: '' });
    }
  };

  if (alertCreated) {
    return (
      <Box textAlign="center" py={6}>
        <Card sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
          <CardContent>
            <NotificationsIcon 
              sx={{ 
                fontSize: 64, 
                color: '#009639', 
                mb: 2 
              }} 
            />
            <Typography variant="h5" gutterBottom sx={{ color: '#009639' }}>
              Job Alert Created!
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
              We'll notify you at <strong>{email}</strong> when jobs matching your search become available.
            </Typography>
            <Button
              variant="contained"
              onClick={() => onNewSearch?.({ query: '', location: '' })}
              sx={{
                background: 'linear-gradient(135deg, #009639 0%, #FFD700 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #007a2e 0%, #e6c200 100%)'
                }
              }}
            >
              Try Another Search
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <Box textAlign="center" mb={4}>
        <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          No Jobs Found
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={2}>
          {searchQuery 
            ? `We couldn't find any jobs matching "${searchQuery}"${location ? ` in ${location}` : ''}`
            : 'No jobs match your current search criteria'
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your search terms or explore popular job categories below
        </Typography>
      </Box>

      {/* Email Alert Signup */}
      {showEmailCapture && !alertCreated && (
        <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 1, color: '#009639' }} />
              <Typography variant="h6">
                Get notified when matching jobs are posted
              </Typography>
            </Box>
            
            <Typography variant="body2" color="textSecondary" mb={3}>
              We'll send you an email when new jobs matching your search criteria become available.
            </Typography>

            <form onSubmit={handleCreateAlert}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  type="email"
                  label="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  helperText={error}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#009639'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#009639'
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    background: 'linear-gradient(135deg, #009639 0%, #FFD700 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #007a2e 0%, #e6c200 100%)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Alert'}
                </Button>
              </Box>
            </form>

            {searchQuery && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Alert will be created for: <strong>"{searchQuery}"</strong>
                  {location && <> in <strong>{location}</strong></>}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Categories */}
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom>
          Popular Job Categories in Jamaica
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Click on a category to search for related jobs
        </Typography>
        
        <Grid container spacing={1} justifyContent="center" maxWidth={600} mx="auto">
          {popularCategories.map((category) => (
            <Grid item key={category}>
              <Chip
                label={category}
                onClick={() => handleCategorySearch(category)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#009639',
                    color: 'white'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={4}>
          <Button
            variant="outlined"
            onClick={() => onNewSearch?.({ query: '', location: '' })}
            sx={{
              borderColor: '#009639',
              color: '#009639',
              '&:hover': {
                borderColor: '#007a2e',
                backgroundColor: 'rgba(0, 150, 57, 0.04)'
              }
            }}
          >
            Clear Search & Browse All Jobs
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NoResultsWithAlerts;
