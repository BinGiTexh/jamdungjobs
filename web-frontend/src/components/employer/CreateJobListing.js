import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  styled
} from '@mui/material';
import PropTypes from 'prop-types';
import { JamaicaLocationAutocomplete } from '../common/JamaicaLocationAutocomplete';
import api from '../../utils/axiosConfig';
import JOB_TEMPLATES from '../../constants/jobTemplates';

// minimal fallback skills list if API returns none
const DEFAULT_SKILLS = [
  'JavaScript','Python','React','Node.js','Project Management','Customer Service','Sales','Marketing','Accounting','AWS','SQL','Communication','Leadership','Teamwork','Problem Solving'
];

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FFD700',
  color: '#000000',
  '&:hover': {
    backgroundColor: '#FFC700'
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#1a1a1a',
    color: '#FFFFFF',
    minWidth: '600px'
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#FFD700'
    },
    '&:hover fieldset': {
      borderColor: '#FFD700'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#FFD700'
  },
  '& .MuiOutlinedInput-input': {
    color: '#FFFFFF'
  }
});

const StyledFormControl = styled(FormControl)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#FFD700'
    },
    '&:hover fieldset': {
      borderColor: '#FFD700'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#FFD700'
  },
  '& .MuiSelect-icon': {
    color: '#FFD700'
  },
  '& .MuiOutlinedInput-input': {
    color: '#FFFFFF'
  }
});

const getLocationDisplay = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return location.formattedAddress || location.mainText || location.name || '';
};

const DialogCreateJobListing = ({ open, onClose, onSave }) => {
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [jobData, setJobData] = useState({
    title: '',
    location: null,
    employmentType: 'FULL_TIME',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryMin: '',
    salaryMax: '',
    experienceLevel: 'ENTRY_LEVEL',
    skills: [],
    applicationDeadline: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler to apply a selected template
  const applyTemplate = (sector) => {
    const template = JOB_TEMPLATES[sector];
    if (template) {
      setJobData(prev => ({
        ...prev,
        description: template.description,
        requirements: template.requirements,
        responsibilities: template.responsibilities
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationChange = (location) => {
    setJobData(prev => ({
      ...prev,
      location
    }));
    if (formErrors.location) {
      setFormErrors(prev => ({
        ...prev,
        location: ''
      }));
    }
  };

  const handleSkillsChange = (newSkills) => {
    setJobData(prev => ({
      ...prev,
      skills: newSkills
    }));
    if (formErrors.skills) {
      setFormErrors(prev => ({
        ...prev,
        skills: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!jobData.title.trim()) errors.title = 'Title is required';
    if (!jobData.location) errors.location = 'Location is required';
    if (!jobData.description.trim()) errors.description = 'Description is required';
    if (!jobData.requirements.trim()) errors.requirements = 'Requirements are required';
    if (!jobData.responsibilities.trim()) errors.responsibilities = 'Responsibilities are required';
    if (!jobData.salaryMin) errors.salaryMin = 'Minimum salary is required';
    if (!jobData.salaryMax) errors.salaryMax = 'Maximum salary is required';
    if (Number(jobData.salaryMin) > Number(jobData.salaryMax)) {
      errors.salaryMin = 'Minimum salary cannot be greater than maximum salary';
    }
    if (jobData.skills.length === 0) errors.skills = 'At least one skill is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const formattedJobData = {
        title: jobData.title,
        description: jobData.description,
        location: getLocationDisplay(jobData.location),
        type: jobData.employmentType,
        skills: jobData.skills.map(skill => (typeof skill === 'string' ? skill : skill.name || '')),
        salary: {
          min: parseFloat(jobData.salaryMin),
          max: parseFloat(jobData.salaryMax)
        },
        experience: jobData.experienceLevel,
        applicationDeadline: jobData.applicationDeadline
          ? new Date(jobData.applicationDeadline).toISOString()
          : null
      };
      
      await onSave(formattedJobData);
      onClose();
    } catch (error) {
      console.error('Error creating job listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch skills list on mount for dropdown
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/api/skills');
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.skills)
            ? data.skills
            : [];
        setSkillsOptions(list.length ? list : DEFAULT_SKILLS);
      } catch (err) {
        console.error('Failed to fetch skills list', err);
      }
    };
    fetchSkills();
  }, []);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ color: '#FFD700' }}>Create New Job Listing</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Job Title"
              name="title"
              value={jobData.title}
              onChange={handleInputChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
          </Grid>
          
          <Grid item xs={12}>
            <JamaicaLocationAutocomplete
              value={jobData.location}
              onChange={handleLocationChange}
              error={!!formErrors.location}
              helperText={formErrors.location}
            />
          </Grid>

          {/* Template selector to auto-fill key fields */}
          <Grid item xs={12}>
            <StyledFormControl fullWidth>
              <InputLabel>Select Job Template</InputLabel>
              <Select
                value=""
                label="Select Job Template"
                onChange={(e) => applyTemplate(e.target.value)}
              >
                {Object.keys(JOB_TEMPLATES).map((sector) => (
                  <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            <Typography variant="caption" sx={{ color: '#FFD700' }}>
              Choosing a template will pre-fill the description, requirements, and responsibilities. You can edit them afterwards.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <StyledFormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={jobData.employmentType}
                label="Employment Type"
                name="employmentType"
                onChange={handleInputChange}
              >
                <MenuItem value="FULL_TIME">Full Time</MenuItem>
                <MenuItem value="PART_TIME">Part Time</MenuItem>
                <MenuItem value="CONTRACT">Contract</MenuItem>
                <MenuItem value="TEMPORARY">Temporary</MenuItem>
                <MenuItem value="INTERNSHIP">Internship</MenuItem>
              </Select>
            </StyledFormControl>
          </Grid>

          <Grid item xs={12}>
            <StyledFormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={jobData.experienceLevel}
                label="Experience Level"
                name="experienceLevel"
                onChange={handleInputChange}
              >
                <MenuItem value="ENTRY_LEVEL">Entry Level</MenuItem>
                <MenuItem value="MID_LEVEL">Mid Level</MenuItem>
                <MenuItem value="SENIOR_LEVEL">Senior Level</MenuItem>
                <MenuItem value="EXECUTIVE">Executive</MenuItem>
              </Select>
            </StyledFormControl>
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label="Minimum Salary (JMD)"
              name="salaryMin"
              type="number"
              value={jobData.salaryMin}
              onChange={handleInputChange}
              error={!!formErrors.salaryMin}
              helperText={formErrors.salaryMin}
            />
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label="Maximum Salary (JMD)"
              name="salaryMax"
              type="number"
              value={jobData.salaryMax}
              onChange={handleInputChange}
              error={!!formErrors.salaryMax}
              helperText={formErrors.salaryMax}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Application Deadline"
              name="applicationDeadline"
              type="date"
              value={jobData.applicationDeadline}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledFormControl fullWidth>
              <InputLabel>Skills (select multiple)</InputLabel>
              <Select
                multiple
                name="skills"
                value={jobData.skills}
                onChange={(e) => handleSkillsChange(e.target.value)}
                renderValue={(selected) => selected.join(', ')}
                label="Skills"
                error={!!formErrors.skills}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#1a1a1a',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                      maxHeight: 300
                    }
                  },
                  MenuListProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        color: '#FFFFFF',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255, 215, 0, 0.15)'
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: 'rgba(255, 215, 0, 0.25)'
                        }
                      }
                    }
                  },
                  disablePortal: true
                }}
              >
                {(Array.isArray(skillsOptions) ? skillsOptions : []).map((skill) => (
                  <MenuItem key={skill} value={skill} sx={{ color: '#FFFFFF' }}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            {formErrors.skills && (
              <Typography variant="caption" color="error">
                {formErrors.skills}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Job Description"
              name="description"
              multiline
              rows={4}
              value={jobData.description}
              onChange={handleInputChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Requirements"
              name="requirements"
              multiline
              rows={4}
              value={jobData.requirements}
              onChange={handleInputChange}
              error={!!formErrors.requirements}
              helperText={formErrors.requirements}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Responsibilities"
              name="responsibilities"
              multiline
              rows={4}
              value={jobData.responsibilities}
              onChange={handleInputChange}
              error={!!formErrors.responsibilities}
              helperText={formErrors.responsibilities}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={onClose} sx={{ color: '#FFD700' }}>
          Cancel
        </Button>
        <StyledButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
        >
          {isSubmitting ? 'Creating...' : 'Create Job Listing'}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

DialogCreateJobListing.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default DialogCreateJobListing;
