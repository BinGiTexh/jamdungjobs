import React, { useState, useEffect, useMemo } from 'react';
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
  Paper,
  styled,
  Fade,
  Alert,
  FormLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { JamaicaLocationAutocomplete } from '../common/JamaicaLocationAutocomplete';
import JobDescriptionBuilder from './JobDescriptionBuilder';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
    '& .MuiInputLabel-asterisk': {
      color: '#FF5252'
    }
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
    '& .MuiInputLabel-asterisk': {
      color: '#FF5252'
    }
  }
}));

const salaryOptions = Array.from({ length: 20 }, (_, i) => (i + 2) * 10000); // 20k to 200k


const JobListingForm = ({ initialData, onSubmit, onCancel }) => {
  const [builderOpen, setBuilderOpen] = useState(false);
  // preprocess salary if object
  const processedInitial = useMemo(() => {
    if (initialData && typeof initialData.salary === 'object' && initialData.salary !== null) {
      const { min, max } = initialData.salary;
      return {
        ...initialData,
        salary: `${min ?? ''}-${max ?? ''}`
      };
    }
    return initialData;
  }, [initialData]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    // Pre-fill display string for edit mode so validation passes
    locationDisplay: processedInitial?.locationDisplay || (processedInitial?.location?.formattedAddress || (typeof processedInitial?.location === 'string' ? processedInitial.location : '')) || '',
    type: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    requirements: [],
    benefits: [],
    applicationDeadline: '',
    responsibilities: [],
    experienceLevel: 'ENTRY',
    department: '',
    ...processedInitial
  });

  // Keep form in sync if parent passes in a new job (e.g., when switching edits)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...processedInitial,
        locationDisplay: processedInitial?.locationDisplay || (processedInitial?.location?.formattedAddress || (typeof processedInitial?.location === 'string' ? processedInitial.location : '')) || ''
      }));
    }
  }, [processedInitial, initialData]);

  const [errors, setErrors] = useState({});
  const [formErrorSummary, setFormErrorSummary] = useState('');

  const handleChange = (e) => {
    if (builderOpen) return; // prevent edits while builder active
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
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleAddBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const handleRequirementFieldChange = (index, value) => {
    setFormData(prev => {
      const arr = [...prev.requirements];
      arr[index] = value;
      return { ...prev, requirements: arr };
    });
  };

  const handleBenefitFieldChange = (index, value) => {
    setFormData(prev => {
      const arr = [...prev.benefits];
      arr[index] = value;
      return { ...prev, benefits: arr };
    });
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
    if (builderOpen) {
      setErrors({});
      return false;
    }
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location || !formData.locationDisplay) newErrors.location = 'Location is required';
    if (!formData.salaryMin || !formData.salaryMax) newErrors.salary = 'Salary range is required';
    if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is needed';
    if (Object.keys(newErrors).length > 0) {
      setFormErrorSummary('Please fill in all required fields');
    } else {
      setFormErrorSummary('');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Create a copy of formData with locationDisplay for API submission
      const submissionData = {
        ...formData,
        location: formData.locationDisplay,
        salary: `${formData.salaryMin}-${formData.salaryMax}`
      };
      onSubmit(submissionData);
    }
  };

  const handleOpenBuilder = () => {
    setBuilderOpen(true);
  };

  const handleBuilderSave = (builderData) => {
    // builderData contains description, responsibilities, requirements, benefits
    if (!builderData) {
      setBuilderOpen(false);
      return;
    }
    const {
      description = '',
      responsibilities = [],
      requirements = [],
      benefits = []
    } = builderData;
    setFormData(prev => ({
      ...prev,
      description,
      responsibilities,
      requirements,
      benefits
    }));
    setBuilderOpen(false);
  };


  return (
    <>
      {formErrorSummary && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formErrorSummary}
        </Alert>
      )}
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
              <Button variant="outlined" sx={{ mt: 1 }} onClick={handleOpenBuilder}>
                Use Template
              </Button>
              {builderOpen && (
                <JobDescriptionBuilder
                  onSave={handleBuilderSave}
                  initialData={{
            description: formData.description,
            responsibilities: formData.responsibilities,
            requirements: formData.requirements,
            benefits: formData.benefits
          }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <JamaicaLocationAutocomplete
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
              <StyledFormControl fullWidth>
                <InputLabel>Min Salary (JMD)</InputLabel>
                <Select
                  name="salaryMin"
                  value={formData.salaryMin}
                  label="Min Salary (JMD)"
                  onChange={handleChange}
                  required
                >
                  {salaryOptions.map((v) => (
                    <MenuItem key={v} value={v}>{`$${v.toLocaleString()}`}</MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledFormControl fullWidth>
                <InputLabel>Max Salary (JMD)</InputLabel>
                <Select
                  name="salaryMax"
                  value={formData.salaryMax}
                  label="Max Salary (JMD)"
                  onChange={handleChange}
                  required
                >
                  {salaryOptions.map((v) => (
                    <MenuItem key={v} value={v}>{`$${v.toLocaleString()}`}</MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
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
              <FormControl required fullWidth sx={{ mb: 2 }}>
                <FormLabel sx={{ color: '#FFD700', mb: 1 }} required>Requirements</FormLabel>
                <Box>
                  {formData.requirements.map((req, index) => (
                    <Box key={index} sx={{ display:'flex', gap:1, mb:1 }}>
                      <StyledTextField
                        fullWidth
                        value={req}
                        onChange={(e)=>handleRequirementFieldChange(index, e.target.value)}
                        placeholder="Requirement"
                      />
                      <IconButton onClick={()=>handleRemoveRequirement(index)} sx={{color:'#FFD700'}}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} variant="outlined" sx={{color:'#FFD700', borderColor:'rgba(255,215,0,0.4)'}} onClick={handleAddRequirement}>
                    Add Requirement
                  </Button>
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl required fullWidth sx={{ mb: 2 }}>
                <FormLabel sx={{ color: '#FFD700', mb: 1 }} required>Benefits</FormLabel>
                <Box>
                  {formData.benefits.map((b, index) => (
                    <Box key={index} sx={{ display:'flex', gap:1, mb:1 }}>
                      <StyledTextField
                        fullWidth
                        value={b}
                        onChange={(e)=>handleBenefitFieldChange(index, e.target.value)}
                        placeholder="Benefit"
                      />
                      <IconButton onClick={()=>handleRemoveBenefit(index)} sx={{color:'#FFD700'}}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} variant="outlined" sx={{color:'#FFD700', borderColor:'rgba(255,215,0,0.4)'}} onClick={handleAddBenefit}>
                    Add Benefit
                  </Button>
                </Box>
              </FormControl>
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
    </>
  );
};

export default JobListingForm;
