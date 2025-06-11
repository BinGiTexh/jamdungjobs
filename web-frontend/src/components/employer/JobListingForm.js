import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  Paper,
  styled,
  Fade
} from '@mui/material';
import { JamaicaLocationProfileAutocomplete } from '../common/JamaicaLocationProfileAutocomplete';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
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
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
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
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 215, 0, 0.1)',
  color: '#FFD700',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  '&:hover': {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
}));

const JobListingForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    locationDisplay: '',
    type: 'FULL_TIME',
    salary: '',
    requirements: [],
    benefits: [],
    applicationDeadline: '',
    experienceLevel: 'ENTRY',
    department: '',
    ...initialData
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationChange = (newLocation) => {
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      locationDisplay: newLocation ? newLocation.formattedAddress : ''
    }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: null }));
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location || !formData.locationDisplay) newErrors.location = 'Location is required';
    if (!formData.salary.trim()) newErrors.salary = 'Salary is required';
    if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is needed';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Create a copy of formData with locationDisplay for API submission
      const submissionData = {
        ...formData,
        location: formData.locationDisplay // Use the formatted address for submission
      };
      onSubmit(submissionData);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <StyledPaper>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <JamaicaLocationProfileAutocomplete
                value={formData.location}
                onChange={handleLocationChange}
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="FULL_TIME">Full Time</MenuItem>
                  <MenuItem value="PART_TIME">Part Time</MenuItem>
                  <MenuItem value="CONTRACT">Contract</MenuItem>
                  <MenuItem value="TEMPORARY">Temporary</MenuItem>
                  <MenuItem value="INTERNSHIP">Internship</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Salary Range"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                error={!!errors.salary}
                helperText={errors.salary}
                placeholder="e.g. $50,000 - $70,000 per year"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <MenuItem value="ENTRY">Entry Level</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="SENIOR">Senior</MenuItem>
                  <MenuItem value="EXPERT">Expert</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <StyledTextField
                  fullWidth
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  error={!!errors.requirements}
                  helperText={errors.requirements}
                />
                <IconButton 
                  onClick={handleAddRequirement}
                  sx={{ color: '#FFD700' }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.requirements.map((req, index) => (
                  <StyledChip
                    key={index}
                    label={req}
                    onDelete={() => handleRemoveRequirement(index)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Benefits
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <StyledTextField
                  fullWidth
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                />
                <IconButton 
                  onClick={handleAddBenefit}
                  sx={{ color: '#FFD700' }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.benefits.map((benefit, index) => (
                  <StyledChip
                    key={index}
                    label={benefit}
                    onDelete={() => handleRemoveBenefit(index)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button 
                  onClick={onCancel}
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { color: '#FFFFFF' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: '#FFE44D'
                    }
                  }}
                >
                  {initialData ? 'Update Job' : 'Create Job'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </Fade>
  );
};

export default JobListingForm;

