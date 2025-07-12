import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { buildApiUrl } from '../../config';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import { useJobAnalytics } from '../../hooks/usePlausible';

// Styled component for the file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

const JobApplicationForm = ({ jobId, jobTitle, onSuccess, onCancel }) => {
  // Analytics hook
  const { trackJobApplication } = useJobAnalytics();
  
  // Step state for the multi-step form
  const [activeStep, setActiveStep] = useState(0);
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumeOption, setResumeOption] = useState('upload');
  
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeFile: null,
    savedResumeId: '',
    phoneNumber: '',
    availability: 'IMMEDIATE',
    salary: '',
    additionalInfo: '',
    // Source tracking
    applicationSource: '',
    sourceDetails: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  
  // Define the steps
  const steps = ['Resume & Details', 'Review & Submit'];
  
  // Availability options
  const availabilityOptions = [
    { value: 'IMMEDIATE', label: 'Immediately' },
    { value: 'ONE_WEEK', label: 'One Week' },
    { value: 'TWO_WEEKS', label: 'Two Weeks' },
    { value: 'ONE_MONTH', label: 'One Month' },
    { value: 'NEGOTIABLE', label: 'Negotiable' }
  ];

  // Application source options for tracking
  const applicationSourceOptions = [
    { value: 'GOOGLE_SEARCH', label: 'Google Search' },
    { value: 'FACEBOOK_SOCIAL', label: 'Facebook/Social Media' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'JOB_BOARD', label: 'Job Board/Website' },
    { value: 'COMPANY_WEBSITE', label: 'Company Website' },
    { value: 'FRIEND_REFERRAL', label: 'Friend/Referral' },
    { value: 'EMAIL_NEWSLETTER', label: 'Email Newsletter' },
    { value: 'DIRECT_TRAFFIC', label: 'Direct (typed URL)' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  // Fetch user's saved resumes
  useEffect(() => {
    const fetchSavedResumes = async () => {
      try {
        const response = await axios.get(buildApiUrl('/candidate/resumes'));
        if (response.data && response.data.length > 0) {
          setSavedResumes(response.data);
        }
      } catch (err) {
        logError('Error fetching saved resumes', err, {
          module: 'JobApplicationForm',
          function: 'fetchSavedResumes',
          status: err.response?.status
        });
        // Don't show error for this, just fall back to upload only
      }
    };
    
    fetchSavedResumes();
  }, []);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const fileType = file.type;
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resumeFile: file
      }));
      setResumeFileName(file.name);
      setError(null);
      
      // Log file selection in development
      logDev('debug', 'Resume file selected', {
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)}KB`,
        fileType: file.type
      });
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      resumeFile: null
    }));
    setResumeFileName('');
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      // First step validation
      if (resumeOption === 'upload' && !formData.resumeFile && savedResumes.length === 0) {
        setError('Please upload your resume or select a saved resume');
        return;
      } else if (resumeOption === 'saved' && !formData.savedResumeId && savedResumes.length > 0) {
        setError('Please select a saved resume');
        return;
      }
      
      // Validate mandatory source tracking
      if (!formData.applicationSource) {
        setError('Please select how you heard about this job');
        return;
      }
      
      // If "Other" is selected, ensure details are provided
      if (formData.applicationSource === 'OTHER' && !formData.sourceDetails.trim()) {
        setError('Please specify where you heard about this job');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
    
    // Log step navigation in development
    logDev('debug', `Moving to step ${activeStep + 1}`, {
      formProgress: `${activeStep + 1}/${steps.length}`,
      hasResume: resumeOption === 'upload' ? !!formData.resumeFile : !!formData.savedResumeId,
      coverLetterLength: formData.coverLetter?.length || 0
    });
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };
  
  // Handle resume option change
  const handleResumeOptionChange = (event) => {
    setResumeOption(event.target.value);
    if (event.target.value === 'upload') {
      setFormData(prev => ({ ...prev, savedResumeId: '' }));
    } else {
      setFormData(prev => ({ ...prev, resumeFile: null }));
      setResumeFileName('');
    }
  };
  
  // Handle saved resume selection
  const handleSavedResumeSelect = (resumeId) => {
    setFormData(prev => ({ ...prev, savedResumeId: resumeId }));
    
    // Log saved resume selection in development
    logDev('debug', 'Saved resume selected', { resumeId });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create form data for file upload
      const applicationData = new FormData();
      applicationData.append('jobId', jobId);
      applicationData.append('coverLetter', formData.coverLetter);
      
      // Handle resume based on option selected
      if (resumeOption === 'upload' && formData.resumeFile) {
        applicationData.append('resume', formData.resumeFile);
      } else if (resumeOption === 'saved' && formData.savedResumeId) {
        applicationData.append('savedResumeId', formData.savedResumeId);
      } else {
        setError('Please provide a resume');
        setLoading(false);
        logDev('warn', 'Application submission failed - no resume provided', {
          resumeOption,
          hasFile: !!formData.resumeFile,
          hasSavedResumeId: !!formData.savedResumeId
        });
        return;
      }
      
      applicationData.append('phoneNumber', formData.phoneNumber);
      applicationData.append('availability', formData.availability);
      applicationData.append('salary', formData.salary);
      applicationData.append('additionalInfo', formData.additionalInfo);
      
      // Add source tracking data
      applicationData.append('applicationSource', formData.applicationSource);
      if (formData.sourceDetails) {
        applicationData.append('sourceDetails', formData.sourceDetails);
      }

      // Log application submission with sanitized data
      logDev('debug', 'Submitting job application', sanitizeForLogging({
        jobId,
        resumeProvided: resumeOption === 'upload' ? !!formData.resumeFile : !!formData.savedResumeId,
        resumeType: resumeOption,
        coverLetterLength: formData.coverLetter?.length || 0,
        salary: formData.salary,
        availability: formData.availability
      }));

      // Submit application
      const response = await axios.post(
        buildApiUrl('/applications'), 
        applicationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201) {
        // Log successful submission with sanitized data
        logDev('info', 'Application submitted successfully', sanitizeForLogging({
          jobId,
          applicationId: response.data?.id,
          resumeType: resumeOption,
          status: response.status
        }));
        
        // Track application submission in analytics
        trackJobApplication(jobId, jobTitle, formData.applicationSource);
        
        onSuccess(response.data);
      }
    } catch (err) {
      logError('Application submission failed', err, sanitizeForLogging({
        module: 'JobApplicationForm',
        function: 'handleSubmit',
        jobId,
        resumeType: resumeOption,
        formFields: Object.keys(formData),
        status: err.response?.status,
        errorMessage: err.response?.data?.message
      }));
      
      // Determine specific error type for better user feedback
      let errorMessage = 'Failed to submit application. Please try again.';
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Missing required information for application.';
      } else if (err.response?.status === 409) {
        errorMessage = 'You have already applied for this job.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to apply for this job.';
      }
      
      setError(errorMessage);
      setActiveStep(0); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Render resume selection options
  const renderResumeOptions = () => (
    <Box sx={{ mt: 2 }}>
      {savedResumes.length > 0 && (
        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Resume Options
          </Typography>
          <RadioGroup
            value={resumeOption}
            onChange={handleResumeOptionChange}
            sx={{ display: 'flex', flexDirection: 'row' }}
          >
            <FormControlLabel value="upload" control={<Radio />} label="Upload New Resume" />
            <FormControlLabel value="saved" control={<Radio />} label="Use Saved Resume" />
          </RadioGroup>
        </FormControl>
      )}
      
      {resumeOption === 'upload' && (
        <Box sx={{ mb: 3 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{
              mb: 2,
              borderColor: '#2C5530',
              color: '#2C5530',
              '&:hover': {
                borderColor: '#FFD700',
                color: '#FFD700',
                backgroundColor: 'rgba(44, 85, 48, 0.05)'
              }
            }}
          >
            Upload Resume
            <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          </Button>
          
          {formData.resumeFile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={resumeFileName} 
                onDelete={removeFile} 
                variant="outlined"
                sx={{ 
                  borderColor: '#2C5530',
                  color: '#2C5530'
                }}
              />
            </Box>
          )}
        </Box>
      )}
      
      {resumeOption === 'saved' && savedResumes.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {savedResumes.map(resume => (
            <Card 
              key={resume.id} 
              variant="outlined"
              sx={{ 
                cursor: 'pointer',
                borderColor: formData.savedResumeId === resume.id ? '#FFD700' : 'rgba(0,0,0,0.12)',
                borderWidth: formData.savedResumeId === resume.id ? 2 : 1,
                '&:hover': {
                  borderColor: '#FFD700',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)'
                }
              }}
              onClick={() => handleSavedResumeSelect(resume.id)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1">{resume.fileName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
                {formData.savedResumeId === resume.id && (
                  <CheckCircleIcon sx={{ ml: 'auto', color: '#FFD700' }} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
  
  // Render application preview
  const renderApplicationPreview = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Application Preview
      </Typography>
      
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Job Title</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{jobTitle}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Resume</Typography>
            <Typography variant="body1">
              {resumeOption === 'upload' ? resumeFileName : 
               savedResumes.find(r => r.id === formData.savedResumeId)?.fileName || 'No resume selected'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Phone Number</Typography>
            <Typography variant="body1">{formData.phoneNumber || 'Not provided'}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Availability</Typography>
            <Typography variant="body1">
              {availabilityOptions.find(opt => opt.value === formData.availability)?.label || 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Expected Salary</Typography>
            <Typography variant="body1">{formData.salary || 'Not specified'}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Cover Letter</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {formData.coverLetter || 'No cover letter provided'}
              </Typography>
            </Paper>
          </Grid>
          
          {formData.additionalInfo && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary">Additional Information</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {formData.additionalInfo}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">How did you hear about this job?</Typography>
            <Typography variant="body1">
              {formData.applicationSource 
                ? applicationSourceOptions.find(opt => opt.value === formData.applicationSource)?.label || 'Not specified'
                : 'Not specified'
              }
              {formData.applicationSource === 'OTHER' && formData.sourceDetails && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Details: {formData.sourceDetails}
                </Typography>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
  
  return (
    <Fade in={true} timeout={800}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(255, 215, 0, 0.1)'
        }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={(e) => { e.preventDefault(); activeStep === steps.length - 1 ? handleSubmit() : handleNext(); }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: '#2C5530',
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: 0,
                    width: '80px',
                    height: '4px',
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    borderRadius: '2px'
                  }
                }}
              >
                Apply for {jobTitle}
              </Typography>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              </Grid>
            )}
            
            {activeStep === 0 ? (
              <>
                <Grid item xs={12}>
                  {renderResumeOptions()}
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Cover Letter"
                    value={formData.coverLetter}
                    onChange={handleChange('coverLetter')}
                    placeholder="Introduce yourself and explain why you're a good fit for this position..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    placeholder="+1 (876) 123-4567"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Availability</InputLabel>
                    <Select
                      value={formData.availability}
                      onChange={handleChange('availability')}
                      label="Availability"
                    >
                      {availabilityOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expected Salary"
                    value={formData.salary}
                    onChange={handleChange('salary')}
                    placeholder="e.g., $60,000 - $70,000"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Information"
                    value={formData.additionalInfo}
                    onChange={handleChange('additionalInfo')}
                    placeholder="Any other information you'd like to share with the employer..."
                  />
                </Grid>

                {/* Application Source Tracking - Mandatory */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2C5530', fontWeight: 600 }}>
                    🇯🇲 Help Us Improve JamDung Jobs
                  </Typography>
                  <FormControl fullWidth required>
                    <InputLabel>How did you hear about this job? *</InputLabel>
                    <Select
                      value={formData.applicationSource}
                      label="How did you hear about this job? *"
                      onChange={handleChange('applicationSource')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#2C5530'
                          }
                        }
                      }}
                    >
                      {applicationSourceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Show details field when "Other" is selected */}
                {formData.applicationSource === 'OTHER' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Please specify"
                      value={formData.sourceDetails}
                      onChange={handleChange('sourceDetails')}
                      placeholder="Please tell us where you heard about this job..."
                      required
                    />
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={12}>
                {renderApplicationPreview()}
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {activeStep === 0 ? (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                      borderColor: '#2C5530',
                      color: '#2C5530',
                      '&:hover': {
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        backgroundColor: 'rgba(44, 85, 48, 0.05)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderColor: '#2C5530',
                      color: '#2C5530',
                      '&:hover': {
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        backgroundColor: 'rgba(44, 85, 48, 0.05)'
                      }
                    }}
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={activeStep < steps.length - 1 ? <ArrowForwardIcon /> : undefined}
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    },
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                      Submitting...
                    </>
                  ) : (
                    activeStep === steps.length - 1 ? 'Submit Application' : 'Continue'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Fade>
  );
};

export default JobApplicationForm;
