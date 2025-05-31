import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  MenuItem,
  Tabs,
  Tab,
  styled
} from '@mui/material';
import { JamaicaLocationProfileAutocomplete } from '../common/JamaicaLocationProfileAutocomplete';
import JobDescriptionBuilder from './JobDescriptionBuilder';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../utils/axiosConfig';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
}));

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Freelance',
  'Remote'
];

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'rgba(255, 215, 0, 0.9)',
    backgroundColor: 'rgba(44, 85, 48, 0.1)',
  },
}));

const JobDetailsDialog = ({ open, onClose, job, isEditing, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [useDescriptionBuilder, setUseDescriptionBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    salary: '',
    salaryMin: '',
    salaryMax: '',
    requirements: '',
    benefits: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (job) {
      // Format salary for display if it exists
      let formattedSalaryMin = '';
      let formattedSalaryMax = '';
      
      if (job.salaryMin !== undefined && job.salaryMin !== null) {
        formattedSalaryMin = job.salaryMin.toString();
      }
      
      if (job.salaryMax !== undefined && job.salaryMax !== null) {
        formattedSalaryMax = job.salaryMax.toString();
      }
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        type: job.jobType || job.type || '',
        salary: job.salary || '',
        salaryMin: formattedSalaryMin,
        salaryMax: formattedSalaryMax,
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        status: job.status || 'ACTIVE'
      });
    }
  }, [job]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location: typeof location === 'object' ? location.formattedAddress : location
    }));
  };

  const handleDescriptionBuilderSave = (builderData) => {
    setFormData(prev => ({
      ...prev,
      description: builderData.formattedDescription,
      requirements: builderData.requirements,
      benefits: builderData.benefits
    }));
    setUseDescriptionBuilder(false);
    setActiveTab(0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Format data for API
      const apiData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        requirements: formData.requirements,
        benefits: formData.benefits,
        status: formData.status
      };
      
      // Update job
      const response = await api.put(`/api/employer/jobs/${job.id}`, apiData);
      
      setSuccess('Job updated successfully');
      
      // Call the onSave callback with the updated job
      if (onSave && typeof onSave === 'function') {
        onSave(response.data);
      }
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error updating job:', err);
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={500}
      PaperProps={{
        sx: {
          backgroundColor: '#0A0A0A',
          backgroundImage: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <DialogTitle sx={{ color: '#FFD700' }}>
        {isEditing ? 'Edit Job Listing' : 'Job Details'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(211, 47, 47, 0.9)',
              color: 'white',
              border: '1px solid rgba(244, 67, 54, 0.5)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(44, 85, 48, 0.9)',
              color: 'white',
              border: '1px solid rgba(76, 175, 80, 0.5)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
          >
            {success}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : isEditing ? (
          // Edit mode with tabs
          <>
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'rgba(255, 215, 0, 0.3)', 
              mb: 3,
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(90deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#FFD700',
                    height: '3px',
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <StyledTab label="Basic Info" />
                <StyledTab label="Description Builder" icon={<DescriptionIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    name="title"
                    label="Job Title"
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="type"
                    label="Job Type"
                    value={formData.type}
                    onChange={handleChange}
                    fullWidth
                    select
                  >
                    {jobTypes.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
                      Location
                    </Typography>
                    <JamaicaLocationProfileAutocomplete
                      value={formData.location}
                      onChange={handleLocationChange}
                      placeholder="Job Location in Jamaica"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="salaryMin"
                    label="Minimum Salary (JMD)"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    fullWidth
                    type="number"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="salaryMax"
                    label="Maximum Salary (JMD)"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    fullWidth
                    type="number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>
                      Job Description
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setActiveTab(1)}
                      startIcon={<DescriptionIcon />}
                      sx={{
                        color: '#FFD700',
                        borderColor: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                      }}
                    >
                      Use Description Builder
                    </Button>
                  </Box>
                  <StyledTextField
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={6}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    name="requirements"
                    label="Requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    name="benefits"
                    label="Benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    name="status"
                    label="Status"
                    value={formData.status}
                    onChange={handleChange}
                    fullWidth
                    select
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="FILLED">Filled</MenuItem>
                  </StyledTextField>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <JobDescriptionBuilder 
                initialData={formData} 
                onSave={handleDescriptionBuilderSave} 
              />
            )}
          </>
        ) : (
          // View mode
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ color: '#FFD700', mb: 2 }}>
                {formData.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  label={formData.type} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: 'white',
                  }}
                />
                <Chip 
                  label={formData.location} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: 'white',
                  }}
                />
                {(formData.salaryMin || formData.salaryMax) && (
                  <Chip 
                    label={
                      `$${formData.salaryMin ? Number(formData.salaryMin).toLocaleString() : '0'} - $${formData.salaryMax ? Number(formData.salaryMax).toLocaleString() : 'Negotiable'}`
                    } 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(44, 85, 48, 0.7)',
                      color: 'white',
                    }}
                  />
                )}
                <Chip 
                  label={formData.status} 
                  size="small" 
                  sx={{ 
                    backgroundColor: formData.status === 'ACTIVE' ? 'rgba(76, 175, 80, 0.7)' : 
                                    formData.status === 'INACTIVE' ? 'rgba(211, 47, 47, 0.7)' :
                                    formData.status === 'DRAFT' ? 'rgba(255, 152, 0, 0.7)' :
                                    'rgba(3, 169, 244, 0.7)',
                    color: 'white',
                  }}
                />
              </Box>
              
              <Typography variant="h6" sx={{ color: '#FFD700', mt: 3, mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, whiteSpace: 'pre-line' }}>
                {formData.description}
              </Typography>
              
              {formData.requirements && (
                <>
                  <Typography variant="h6" sx={{ color: '#FFD700', mt: 3, mb: 1 }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, whiteSpace: 'pre-line' }}>
                    {formData.requirements}
                  </Typography>
                </>
              )}
              
              {formData.benefits && (
                <>
                  <Typography variant="h6" sx={{ color: '#FFD700', mt: 3, mb: 1 }}>
                    Benefits
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, whiteSpace: 'pre-line' }}>
                    {formData.benefits}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: '#FFFFFF',
            }
          }}
        >
          {isEditing ? 'Cancel' : 'Close'}
        </Button>
        {isEditing && (
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #2C5530, #FFD700)',
              color: '#000',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              },
              transition: 'all 0.3s ease',
              textTransform: 'none',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '8px',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
