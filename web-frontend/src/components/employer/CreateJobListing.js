import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Paper,
  styled,
  Alert,
  CircularProgress,
  InputAdornment,
  FormHelperText,
  Divider
} from '@mui/material';
import { JamaicaLocationProfileAutocomplete } from '../common/JamaicaLocationProfileAutocomplete';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
    opacity: 0.3,
    zIndex: 0,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)',
  },
  padding: '10px 24px',
  fontWeight: 500,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
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
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#FFD700',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
  '& .MuiSvgIcon-root': {
    color: '#FFD700',
  },
}));

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: 'rgba(255, 215, 0, 0.7)',
  '&.Mui-focused': {
    color: '#FFD700',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 'rgba(44, 85, 48, 0.8)',
  color: '#FFD700',
  borderColor: 'rgba(255, 215, 0, 0.5)',
  '& .MuiChip-deleteIcon': {
    color: 'rgba(255, 215, 0, 0.7)',
    '&:hover': {
      color: '#FFD700',
    },
  },
}));

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Freelance'
];

const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Executive'
];

const CreateJobListing = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [jobData, setJobData] = useState({
    title: '',
    company: user?.companyName || '',
    location: null,
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    jobType: 'Full-time',
    experienceLevel: 'Mid-Level',
    salaryMin: '',
    salaryMax: '',
    skills: [],
    remote: false,
    applicationDeadline: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleLocationSelect = (location) => {
    setJobData(prev => ({
      ...prev,
      location
    }));
    
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: null
      }));
    }
  };

  const handleSkillsChange = (skills) => {
    setJobData(prev => ({
      ...prev,
      skills
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!jobData.title.trim()) newErrors.title = 'Job title is required';
    if (!jobData.company.trim()) newErrors.company = 'Company name is required';
    if (!jobData.location) newErrors.location = 'Location is required';
    if (!jobData.description.trim()) newErrors.description = 'Job description is required';
    if (!jobData.salaryMin.trim()) newErrors.salaryMin = 'Minimum salary is required';
    if (!jobData.salaryMax.trim()) newErrors.salaryMax = 'Maximum salary is required';
    
    if (jobData.salaryMin && jobData.salaryMax) {
      const min = parseFloat(jobData.salaryMin);
      const max = parseFloat(jobData.salaryMax);
      if (min > max) {
        newErrors.salaryMin = 'Minimum salary cannot be greater than maximum';
        newErrors.salaryMax = 'Maximum salary cannot be less than minimum';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please correct the errors in the form'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the job data for the API
      const formattedJobData = {
        ...jobData,
        location: jobData.location?.formattedAddress || jobData.location,
        locationData: jobData.location,
        skills: jobData.skills.map(skill => skill.name || skill),
        salaryMin: parseFloat(jobData.salaryMin),
        salaryMax: parseFloat(jobData.salaryMax),
        applicationDeadline: jobData.applicationDeadline 
          ? new Date(jobData.applicationDeadline).toISOString() 
          : null
      };
      
      const response = await axios.post('/api/employer/jobs', formattedJobData);
      
      setMessage({
        type: 'success',
        text: 'Job listing created successfully!'
      });
      
      // Reset form after successful submission
      setJobData({
        title: '',
        company: user?.companyName || '',
        location: null,
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        jobType: 'Full-time',
        experienceLevel: 'Mid-Level',
        salaryMin: '',
        salaryMax: '',
        skills: [],
        remote: false,
        applicationDeadline: ''
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating job listing:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create job listing'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const renderJobPreview = () => {
    return (
      <StyledPaper>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ color: '#FFD700', mb: 2, fontWeight: 600 }}>
            {jobData.title || 'Job Title'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                {jobData.company || 'Company Name'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                {jobData.location?.formattedAddress || jobData.location?.name || 'Location'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                {jobData.jobType} • {jobData.experienceLevel}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                ${jobData.salaryMin.toLocaleString ? jobData.salaryMin.toLocaleString() : jobData.salaryMin || '0'} - 
                ${jobData.salaryMax.toLocaleString ? jobData.salaryMax.toLocaleString() : jobData.salaryMax || '0'} JMD
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
              Skills Required
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {jobData.skills.length > 0 ? (
                jobData.skills.map((skill, index) => (
                  <StyledChip 
                    key={index} 
                    label={skill.name || skill} 
                    variant="outlined" 
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  No skills specified
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
              Job Description
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-line' }}>
              {jobData.description || 'No description provided'}
            </Typography>
          </Box>
          
          {jobData.responsibilities && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Responsibilities
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-line' }}>
                {jobData.responsibilities}
              </Typography>
            </Box>
          )}
          
          {jobData.requirements && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Requirements
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-line' }}>
                {jobData.requirements}
              </Typography>
            </Box>
          )}
          
          {jobData.benefits && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Benefits
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-line' }}>
                {jobData.benefits}
              </Typography>
            </Box>
          )}
          
          {jobData.applicationDeadline && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Application Deadline: {new Date(jobData.applicationDeadline).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </StyledPaper>
    );
  };

  const renderJobForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <StyledPaper>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ color: '#FFD700', mb: 3, fontWeight: 600 }}>
              Job Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Company Name"
                  name="company"
                  value={jobData.company}
                  onChange={handleChange}
                  error={!!errors.company}
                  helperText={errors.company}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ color: '#FFD700', mb: 1 }}>
                    Location
                  </Typography>
                  <JamaicaLocationProfileAutocomplete
                    value={jobData.location}
                    onChange={handleLocationSelect}
                    placeholder="Job Location in Jamaica"
                  />
                  {errors.location && (
                    <FormHelperText error>{errors.location}</FormHelperText>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <StyledInputLabel id="job-type-label">Job Type</StyledInputLabel>
                  <StyledSelect
                    labelId="job-type-label"
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleChange}
                    label="Job Type"
                  >
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type} sx={{ color: 'black' }}>
                        {type}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <StyledInputLabel id="experience-level-label">Experience Level</StyledInputLabel>
                  <StyledSelect
                    labelId="experience-level-label"
                    name="experienceLevel"
                    value={jobData.experienceLevel}
                    onChange={handleChange}
                    label="Experience Level"
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level} value={level} sx={{ color: 'black' }}>
                        {level}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Minimum Salary (JMD)"
                  name="salaryMin"
                  type="number"
                  value={jobData.salaryMin}
                  onChange={handleChange}
                  error={!!errors.salaryMin}
                  helperText={errors.salaryMin}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Maximum Salary (JMD)"
                  name="salaryMax"
                  type="number"
                  value={jobData.salaryMax}
                  onChange={handleChange}
                  error={!!errors.salaryMax}
                  helperText={errors.salaryMax}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ color: '#FFD700', mb: 1 }}>
                    Required Skills
                  </Typography>
                  <SkillsAutocomplete
                    value={jobData.skills}
                    onChange={handleSkillsChange}
                    placeholder="Add required skills"
                  />
                  <StyledFormHelperText>
                    Add skills that are required for this position
                  </StyledFormHelperText>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Application Deadline"
                  name="applicationDeadline"
                  type="date"
                  value={jobData.applicationDeadline}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>
        
        <StyledPaper>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ color: '#FFD700', mb: 3, fontWeight: 600 }}>
              Job Description
            </Typography>
            
            <StyledTextField
              fullWidth
              label="Job Description"
              name="description"
              multiline
              rows={6}
              value={jobData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || "Provide a detailed description of the job"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <DescriptionIcon sx={{ color: '#FFD700' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Divider sx={{ my: 3, borderColor: 'rgba(255, 215, 0, 0.3)' }} />
            
            <StyledTextField
              fullWidth
              label="Responsibilities"
              name="responsibilities"
              multiline
              rows={4}
              value={jobData.responsibilities}
              onChange={handleChange}
              helperText="Describe the key responsibilities of this role"
            />
            
            <StyledTextField
              fullWidth
              label="Requirements"
              name="requirements"
              multiline
              rows={4}
              value={jobData.requirements}
              onChange={handleChange}
              helperText="List qualifications, experience, and skills required"
            />
            
            <StyledTextField
              fullWidth
              label="Benefits"
              name="benefits"
              multiline
              rows={4}
              value={jobData.benefits}
              onChange={handleChange}
              helperText="Describe perks, benefits, and advantages of this position"
            />
          </Box>
        </StyledPaper>
        
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 3,
              backgroundColor: message.type === 'success' ? 'rgba(44, 85, 48, 0.9)' : 'rgba(211, 47, 47, 0.9)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={togglePreview}
            sx={{
              color: '#FFD700',
              borderColor: '#FFD700',
              '&:hover': {
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            {previewMode ? 'Edit Job' : 'Preview Job'}
          </Button>
          
          <StyledButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Creating...' : 'Create Job Listing'}
          </StyledButton>
        </Box>
      </form>
    );
  };

  return (
    <Box>
      {previewMode ? renderJobPreview() : renderJobForm()}
    </Box>
  );
};

export default CreateJobListing;
