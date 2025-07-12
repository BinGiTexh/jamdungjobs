import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

  styled,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import { LocationAutocomplete } from '../common/LocationAutocomplete';

// Function to log only in development environment
const logDev = (level, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console[level](...args); // eslint-disable-line no-console
  }
};

// Styled components for Jamaican theme
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
    zIndex: 0
  }
}));

// Jamaican educational institutions
const JAMAICAN_EDUCATION_INSTITUTIONS = [
  'University of the West Indies (UWI)',
  'University of Technology (UTech)',
  'Northern Caribbean University (NCU)',
  'Caribbean Maritime University (CMU)',
  'Edna Manley College of the Visual and Performing Arts',
  'G.C. Foster College of Physical Education and Sport',
  'College of Agriculture, Science and Education (CASE)',
  'Excelsior Community College',
  'Knox Community College',
  'Montego Bay Community College',
  'Brown\'s Town Community College',
  'Moneague College',
  'Shortwood Teachers\' College',
  'Sam Sharpe Teachers\' College',
  'Bethlehem Moravian College',
  'Mico University College',
  'Jamaica Theological Seminary',
  'Caribbean Graduate School of Theology',
  'International University of the Caribbean',
  'University College of the Caribbean'
];

// Jamaican qualifications
const JAMAICAN_QUALIFICATIONS = [
  'Caribbean Secondary Education Certificate (CSEC)',
  'Caribbean Advanced Proficiency Examination (CAPE)',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctoral Degree (PhD)',
  'Diploma',
  'Certificate',
  'Professional Certification',
  'Vocational Training Certificate',
  'HEART Trust/NTA Certification',
  'City & Guilds Certification',
  'Teaching Diploma',
  'Nursing Diploma',
  'Technical Diploma',
  'National Council on Technical and Vocational Education and Training (NCTVET) Certification'
];

// Resume sections
const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills & Achievements'];

const ResumeBuilder = ({ onSave, onExport }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
      photoUrl: null,
      resumeFile: null,
      resumeFileName: ''
    },
    education: [
      {
        institution: '',
        qualification: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        present: false,
        description: ''
      }
    ],
    workExperience: [
      {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        present: false,
        description: ''
      }
    ],
    skills: [],
    achievements: [
      {
        title: '',
        description: ''
      }
    ]
  });

  // Handle form field changes
  const handlePersonalInfoChange = (field, value) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    });
  };
  
  // Handle photo upload
  const handlePhotoUpload = (file) => {
    if (!file) return;
    
    // Create a FileReader to read the image file as a data URL
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // e.target.result contains the data URL (base64 encoded image)
      const photoDataUrl = e.target.result;
      
      // Update the resumeData state with the photo URL
      handlePersonalInfoChange('photoUrl', photoDataUrl);
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  };
  
  // Handle resume file upload
  const handleResumeUpload = (file) => {
    if (!file) return;
    
    // Store the file object and filename
    handlePersonalInfoChange('resumeFile', file);
    handlePersonalInfoChange('resumeFileName', file.name);
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    // If present is checked, clear the end date
    if (field === 'present' && value === true) {
      updatedEducation[index].endDate = '';
    }
    
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperience = [...resumeData.workExperience];
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [field]: value
    };
    
    // If present is checked, clear the end date
    if (field === 'present' && value === true) {
      updatedWorkExperience[index].endDate = '';
    }
    
    setResumeData({
      ...resumeData,
      workExperience: updatedWorkExperience
    });
  };

  const handleSkillsChange = (newSkills) => {
    setResumeData({
      ...resumeData,
      skills: newSkills
    });
  };

  const handleAchievementChange = (index, field, value) => {
    const updatedAchievements = [...resumeData.achievements];
    updatedAchievements[index] = {
      ...updatedAchievements[index],
      [field]: value
    };
    
    setResumeData({
      ...resumeData,
      achievements: updatedAchievements
    });
  };

  // Add/remove education entries
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          institution: '',
          qualification: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          present: false,
          description: ''
        }
      ]
    });
  };

  const removeEducation = (index) => {
    if (resumeData.education.length > 1) {
      const updatedEducation = resumeData.education.filter((_, i) => i !== index);
      setResumeData({
        ...resumeData,
        education: updatedEducation
      });
    }
  };

  // Add/remove work experience entries
  const addWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...resumeData.workExperience,
        {
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          present: false,
          description: ''
        }
      ]
    });
  };

  const removeWorkExperience = (index) => {
    if (resumeData.workExperience.length > 1) {
      const updatedWorkExperience = resumeData.workExperience.filter((_, i) => i !== index);
      setResumeData({
        ...resumeData,
        workExperience: updatedWorkExperience
      });
    }
  };

  // Add/remove achievement entries
  const addAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [
        ...resumeData.achievements,
        {
          title: '',
          description: ''
        }
      ]
    });
  };

  const removeAchievement = (index) => {
    if (resumeData.achievements.length > 1) {
      const updatedAchievements = resumeData.achievements.filter((_, i) => i !== index);
      setResumeData({
        ...resumeData,
        achievements: updatedAchievements
      });
    }
  };

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = () => {
    if (onSave && typeof onSave === 'function') {
      onSave(resumeData);
    }
  };

  // Placeholder for export functionality - will be implemented in the next phase
  const handleExport = (format) => {
    if (onExport && typeof onExport === 'function') {
      onExport(resumeData, format);
    } else {
      logDev('info', 'Export functionality will be implemented in the next phase');
      logDev('debug', 'Resume data:', resumeData);
      logDev('debug', 'Export format:', format);
    }
  };

  // Render form sections based on active step
  const renderStepContent = (step) => {
    const formStyles = {
      '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
        '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
        '&.Mui-focused fieldset': { borderColor: '#FFD700' }
      },
      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
      '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' },
      mb: 2
    };

    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Tell us about yourself
              </Typography>
            </Grid>
            
            {/* Photo Upload Section */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    mb: 2,
                    mx: 'auto',
                    position: 'relative'
                  }}
                >
                  {resumeData.personalInfo.photoUrl ? (
                    <Avatar
                      src={resumeData.personalInfo.photoUrl}
                      alt="Profile Photo"
                      sx={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      No photo selected
                    </Typography>
                  )}
                </Box>
                
                <input
                  accept="image/*"
                  type="file"
                  id="photo-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                    sx={{
                      color: '#FFD700',
                      borderColor: '#FFD700',
                      '&:hover': {
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)'
                      }
                    }}
                  >
                    Upload Photo
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                  Recommended: Square image, 300x300 pixels or larger
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={resumeData.personalInfo.fullName}
                onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                sx={formStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Professional Title"
                fullWidth
                placeholder="e.g., Software Developer, Marketing Specialist"
                value={resumeData.personalInfo.title}
                onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                sx={formStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={resumeData.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                sx={formStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                required
                value={resumeData.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                sx={formStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <LocationAutocomplete
                value={resumeData.personalInfo.location}
                onChange={(newValue) => handlePersonalInfoChange('location', newValue)}
                label="Location"
                sx={formStyles}
              />
            </Grid>
            
            {/* Resume Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ 
                border: '1px dashed rgba(255, 215, 0, 0.5)', 
                borderRadius: 1, 
                p: 2, 
                mb: 2,
                backgroundColor: 'rgba(255, 215, 0, 0.05)'
              }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                  Upload Existing Resume (Optional)
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <input
                    accept=".pdf,.doc,.docx"
                    type="file"
                    id="resume-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files[0] && handleResumeUpload(e.target.files[0])}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        color: '#2C5530',
                        borderColor: '#2C5530',
                        '&:hover': {
                          borderColor: '#2C5530',
                          backgroundColor: 'rgba(44, 85, 48, 0.1)'
                        }
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                  
                  {resumeData.personalInfo.resumeFileName && (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Selected: {resumeData.personalInfo.resumeFileName}
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                  Supported formats: PDF, DOC, DOCX (Max size: 5MB)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Professional Summary"
                fullWidth
                multiline
                rows={4}
                value={resumeData.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                helperText="Briefly describe your professional background, key skills, and career goals."
                sx={formStyles}
              />
            </Grid>
          </Grid>
        );

      case 1: // Education
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>
                Education Background
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addEducation}
                sx={{
                  color: '#2C5530',
                  '&:hover': {
                    backgroundColor: 'rgba(44, 85, 48, 0.1)'
                  }
                }}
              >
                Add Education
              </Button>
            </Box>
            
            {resumeData.education.map((edu, index) => (
              <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                {index > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => removeEducation(index)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        color: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={formStyles}>
                      <InputLabel>Institution</InputLabel>
                      <Select
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        label="Institution"
                      >
                        <MenuItem value="">
                          <em>Select or type an institution</em>
                        </MenuItem>
                        {JAMAICAN_EDUCATION_INSTITUTIONS.map((institution) => (
                          <MenuItem key={institution} value={institution}>
                            {institution}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={formStyles}>
                      <InputLabel>Qualification</InputLabel>
                      <Select
                        value={edu.qualification}
                        onChange={(e) => handleEducationChange(index, 'qualification', e.target.value)}
                        label="Qualification"
                      >
                        <MenuItem value="">
                          <em>Select a qualification</em>
                        </MenuItem>
                        {JAMAICAN_QUALIFICATIONS.map((qualification) => (
                          <MenuItem key={qualification} value={qualification}>
                            {qualification}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Field of Study"
                      fullWidth
                      placeholder="e.g., Computer Science, Business Administration"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date"
                      type="month"
                      fullWidth
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        label="End Date"
                        type="month"
                        fullWidth
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        disabled={edu.present}
                        InputLabelProps={{ shrink: true }}
                        sx={formStyles}
                      />
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          id={`present-edu-${index}`}
                          checked={edu.present}
                          onChange={(e) => handleEducationChange(index, 'present', e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor={`present-edu-${index}`} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Present
                        </label>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={edu.description}
                      onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      placeholder="Describe your studies, achievements, relevant coursework, etc."
                      sx={formStyles}
                    />
                  </Grid>
                </Grid>
                
                {index < resumeData.education.length - 1 && (
                  <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />
                )}
              </Box>
            ))}
          </Box>
        );

      case 2: // Work Experience
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>
                Work Experience
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addWorkExperience}
                sx={{
                  color: '#2C5530',
                  '&:hover': {
                    backgroundColor: 'rgba(44, 85, 48, 0.1)'
                  }
                }}
              >
                Add Experience
              </Button>
            </Box>
            
            {resumeData.workExperience.map((exp, index) => (
              <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                {index > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => removeWorkExperience(index)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        color: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Company/Organization"
                      fullWidth
                      required
                      value={exp.company}
                      onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Position/Title"
                      fullWidth
                      required
                      value={exp.position}
                      onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <LocationAutocomplete
                      value={exp.location}
                      onChange={(newValue) => handleWorkExperienceChange(index, 'location', newValue)}
                      label="Location"
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date"
                      type="month"
                      fullWidth
                      value={exp.startDate}
                      onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={formStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        label="End Date"
                        type="month"
                        fullWidth
                        value={exp.endDate}
                        onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                        disabled={exp.present}
                        InputLabelProps={{ shrink: true }}
                        sx={formStyles}
                      />
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          id={`present-exp-${index}`}
                          checked={exp.present}
                          onChange={(e) => handleWorkExperienceChange(index, 'present', e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor={`present-exp-${index}`} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Present
                        </label>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                      placeholder="Describe your responsibilities, achievements, and the skills you utilized in this role."
                      sx={formStyles}
                    />
                  </Grid>
                </Grid>
                
                {index < resumeData.workExperience.length - 1 && (
                  <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />
                )}
              </Box>
            ))}
          </Box>
        );

      case 3: // Skills & Achievements
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Skills
              </Typography>
              <SkillsAutocomplete
                value={resumeData.skills}
                onChange={handleSkillsChange}
                label="Skills"
                sx={formStyles}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                Add relevant skills that showcase your expertise. These will help employers find you for matching positions.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>
                  Achievements & Certifications
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addAchievement}
                  sx={{
                    color: '#2C5530',
                    '&:hover': {
                      backgroundColor: 'rgba(44, 85, 48, 0.1)'
                    }
                  }}
                >
                  Add Achievement
                </Button>
              </Box>
              
              {resumeData.achievements.map((achievement, index) => (
                <Box key={index} sx={{ mb: 3, position: 'relative' }}>
                  {index > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => removeAchievement(index)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          color: '#f44336',
                          backgroundColor: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Achievement/Certification Title"
                        fullWidth
                        value={achievement.title}
                        onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                        placeholder="e.g., Employee of the Year, AWS Certification"
                        sx={formStyles}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={achievement.description}
                        onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                        placeholder="Provide details about this achievement or certification."
                        sx={formStyles}
                      />
                    </Grid>
                  </Grid>
                  
                  {index < resumeData.achievements.length - 1 && (
                    <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />
                  )}
                </Box>
              ))}
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <StyledPaper>
      <Typography variant="h5" sx={{ color: '#FFD700', mb: 3 }}>
        Resume Builder
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  color: activeStep === steps.indexOf(label) ? '#FFD700' : 'rgba(255, 255, 255, 0.7)'
                },
                '& .MuiStepIcon-root': {
                  color: activeStep === steps.indexOf(label) ? '#2C5530' : 'rgba(255, 255, 255, 0.3)'
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#2C5530'
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 2, mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<NavigateBeforeIcon />}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: '#2C5530',
                  color: '#FFFFFF',
                  mr: 2,
                  '&:hover': {
                    backgroundColor: '#1E3D23'
                  }
                }}
              >
                Save Resume
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('pdf')}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#E6C200'
                  }
                }}
              >
                Export as PDF
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NavigateNextIcon />}
              sx={{
                backgroundColor: '#2C5530',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#1E3D23'
                }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default ResumeBuilder;
