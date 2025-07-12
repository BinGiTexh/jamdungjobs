import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Slide,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  NotificationsActive as AlertIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { logDev, logError } from '../../utils/loggingUtils';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Enhanced Email Capture Modal
 * Strategically timed modal for job alert subscriptions
 */
const EmailCaptureModal = ({
  open,
  onClose,
  searchContext = {},
  trigger = 'empty_search', // empty_search, exit_intent, time_based
  onSuccess
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    frequency: 'DAILY',
    includeRemote: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill search context
  useEffect(() => {
    if (searchContext.query || searchContext.location) {
      logDev('info', 'Email capture modal opened with context', {
        trigger,
        hasQuery: !!searchContext.query,
        hasLocation: !!searchContext.location
      });
    }
  }, [searchContext, trigger]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const alertData = {
        email: formData.email,
        searchQuery: searchContext.query || '',
        searchLocation: searchContext.location || '',
        jobType: searchContext.jobType || '',
        skills: searchContext.skills || [],
        salaryMin: searchContext.salaryMin || 0,
        frequency: formData.frequency
      };

      const response = await api.post('/api/email-alerts', alertData);

      if (response.status === 201) {
        setSuccess(true);
        logDev('info', 'Email alert subscription successful', {
          trigger,
          frequency: formData.frequency,
          hasSearchContext: !!(searchContext.query || searchContext.location)
        });

        // Call success callback
        if (onSuccess) {
          onSuccess({
            email: formData.email,
            alertId: response.data.alert?.id,
            trigger
          });
        }

        // Auto-close after success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);

      } else {
        throw new Error(response.data?.message || 'Failed to create job alert');
      }

    } catch (err) {
      console.error('Email alert subscription error:', err);
      
      if (err.response?.status === 409) {
        setError('You already have a similar job alert. Check your email for existing alerts.');
      } else {
        setError(err.response?.data?.message || 'Failed to create job alert. Please try again.');
      }
      
      logError(err, 'Email alert subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'empty_search':
        return 'No jobs found? Let us notify you when new opportunities match your search!';
      case 'exit_intent':
        return 'Before you go, get notified about new job opportunities in Jamaica!';
      case 'time_based':
        return 'Stay updated with the latest job opportunities in Jamaica!';
      default:
        return 'Get personalized job alerts delivered to your inbox!';
    }
  };

  const getSearchSummary = () => {
    const parts = [];
    if (searchContext.query) parts.push(`"${searchContext.query}"`);
    if (searchContext.location) parts.push(`in ${searchContext.location}`);
    if (searchContext.jobType) parts.push(`${searchContext.jobType.toLowerCase()} positions`);
    
    return parts.length > 0 ? parts.join(' ') : 'all job opportunities';
  };

  if (success) {
    return (
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95))',
            color: 'white',
            textAlign: 'center',
            p: 2
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <SuccessIcon sx={{ fontSize: 64, mb: 2, color: 'white' }} />
          <Typography variant="h5" gutterBottom>
            Job Alert Created!
          </Typography>
          <Typography variant="body1">
            You'll receive {formData.frequency.toLowerCase()} updates about {getSearchSummary()}.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.95), rgba(255, 215, 0, 0.1))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: 'white',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertIcon sx={{ color: '#FFD700' }} />
          <Typography variant="h6" component="span">
            Get Job Alerts
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ color: 'white' }}>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            {getTriggerMessage()}
          </Typography>

          {/* Search Context Summary */}
          {(searchContext.query || searchContext.location) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                Get alerts for:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchContext.query && (
                  <Chip 
                    label={`"${searchContext.query}"`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  />
                )}
                {searchContext.location && (
                  <Chip 
                    label={searchContext.location}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  />
                )}
                {searchContext.jobType && (
                  <Chip 
                    label={searchContext.jobType}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Email Input */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.5)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.8)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#FFD700'
              },
              '& .MuiInputBase-input': {
                color: 'white'
              }
            }}
            InputProps={{
              startAdornment: <EmailIcon sx={{ color: '#FFD700', mr: 1 }} />
            }}
          />

          {/* Frequency Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#FFD700' }}>Alert Frequency</InputLabel>
            <Select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              disabled={loading}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 215, 0, 0.5)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 215, 0, 0.8)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFD700'
                }
              }}
            >
              <MenuItem value="INSTANT">Instant (as jobs are posted)</MenuItem>
              <MenuItem value="DAILY">Daily digest</MenuItem>
              <MenuItem value="WEEKLY">Weekly summary</MenuItem>
            </Select>
          </FormControl>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Benefits */}
          <Box sx={{ 
            backgroundColor: 'rgba(255, 215, 0, 0.1)', 
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 1,
            p: 2,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Why job seekers love our alerts:
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
              • Be first to apply to new opportunities<br/>
              • Never miss jobs that match your skills<br/>
              • Unsubscribe anytime with one click<br/>
              • Free service, no spam guaranteed
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Maybe Later
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #FFD700, #FFA000)',
              color: '#000',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #FFA000, #FFD700)'
              },
              '&:disabled': {
                background: 'rgba(255, 215, 0, 0.3)'
              }
            }}
            startIcon={loading ? <CircularProgress size={20} /> : <AlertIcon />}
          >
            {loading ? 'Creating Alert...' : 'Create Job Alert'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailCaptureModal;
