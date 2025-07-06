import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  styled,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import ResumePreview from './ResumePreview';
import ResumeBuilder from './ResumeBuilder';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1300px'
  }
}));

const ResumeBuilderPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      title: '',
      summary: ''
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
    skills: user?.skills || [],
    achievements: [
      {
        title: '',
        description: ''
      }
    ]
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load existing resume data if available
  useEffect(() => {
    const fetchResumeData = async () => {
      logDev('debug', 'Fetching resume data', { 
        userId: user?.id,
        source: 'localStorage' 
      });
      try {
        // Check if we have saved resume data in localStorage
        const savedResume = localStorage.getItem('candidateResumeData');
        
        if (savedResume) {
          // Use the saved resume data
          setResumeData(JSON.parse(savedResume));
        } else {
          // In a real application, you would fetch from API
          // For demo purposes, we'll just use the default data with user info
          logDev('debug', 'No saved resume found, using default template', {
            userId: user?.id,
            defaultFields: Object.keys(resumeData)
          });
        }
      } catch (error) {
        logError('Error fetching resume data', error, {
          module: 'ResumeBuilderPage',
          function: 'fetchResumeData',
          userId: user?.id
        });
      }
    };
    
    fetchResumeData();
  }, [user]);

  const handleSaveResume = (data) => {
    try {
      setLoading(true);
      
      logDev('debug', 'Saving resume data', {
        userId: user?.id,
        sections: Object.keys(data),
        skillsCount: data.skills?.length || 0,
        educationCount: data.education?.length || 0,
        experienceCount: data.workExperience?.length || 0
      });
      
      // Save to localStorage for persistence during demo
      localStorage.setItem('candidateResumeData', JSON.stringify(data));
      
      // In a real application, you would also save to your backend
      // const response = await axios.post('/api/candidate/resume', data);
      
      setResumeData(data);
      setMessage({
        type: 'success',
        text: 'Resume saved successfully!'
      });
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      logError('Error saving resume', error, {
        module: 'ResumeBuilderPage',
        function: 'handleSaveResume',
        userId: user?.id,
        dataSize: JSON.stringify(data).length
      });
      setMessage({
        type: 'error',
        text: 'Failed to save resume. Please try again.'
      });
    }
  };

  const handleExportResume = async (data, format) => {
    try {
      setLoading(true);
      
      logDev('debug', 'Exporting resume', { 
        userId: user?.id,
        format,
        sections: Object.keys(data)
      });
      
      // Update resume data first
      setResumeData(data);
      
      // Simple export functionality without PDF generation
      if (format === 'pdf') {
        // Store the resume data in localStorage
        localStorage.setItem('candidateResumeData', JSON.stringify(data));
        
        // Show a message to the user
        setMessage({
          type: 'success',
          text: 'Your resume has been saved! PDF export will be available soon.'
        });
        
        // In a real implementation, we would send the data to the server
        // and generate a PDF there, then provide a download link
        logDev('info', 'Resume data prepared for export', sanitizeForLogging({
          userId: user?.id,
          format: 'pdf',
          sections: Object.keys(data),
          personalInfo: {
            name: data.personalInfo?.fullName,
            email: data.personalInfo?.email ? '[EMAIL REDACTED]' : 'Not provided',
            phone: data.personalInfo?.phone ? '[PHONE REDACTED]' : 'Not provided'
          }
        }));
      } else {
        // For other formats (future implementation)
        logDev('warn', 'Export format not supported', { format });
        setMessage({
          type: 'error',
          text: `Export as ${format} not supported yet.`
        });
      }
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      logError('Error exporting resume', error, {
        module: 'ResumeBuilderPage',
        function: 'handleExportResume',
        userId: user?.id,
        format,
        dataSize: JSON.stringify(data).length
      });
      setLoading(false);
      setMessage({
        type: 'error',
        text: 'Failed to export resume. Please try again.'
      });
    }
  };

  const handlePreviewOpen = () => {
    logDev('debug', 'Opening resume preview', { userId: user?.id });
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    logDev('debug', 'Closing resume preview', { userId: user?.id });
    setPreviewOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative'
      }}
    >
      {/* Background image with Jamaican styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 1
        }}
      />
      
      <StyledContainer maxWidth="lg">
        <Box sx={{ py: 4, position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 4
            }}
          >
            Resume Builder
          </Typography>

          {message && (
            <Box 
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: message.type === 'success' ? 'rgba(44, 85, 48, 0.1)' : 'rgba(205, 43, 43, 0.1)',
                color: message.type === 'success' ? '#E8F5E9' : '#f8d7da',
                border: message.type === 'success' ? '1px solid rgba(44, 85, 48, 0.3)' : '1px solid rgba(205, 43, 43, 0.3)',
                borderRadius: 1
              }}
            >
              {message.text}
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={isMobile ? 12 : 7}>
              <ResumeBuilder 
                onSave={handleSaveResume} 
                onExport={handleExportResume} 
                initialData={resumeData}
              />
            </Grid>
            
            {!isMobile && (
              <Grid item md={5}>
                <Box 
                  sx={{ 
                    position: 'sticky', 
                    top: 20, 
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto',
                    pr: 2
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#FFD700',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Live Preview</span>
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GetAppIcon />}
                        onClick={() => handleExportResume(resumeData, 'pdf')}
                        sx={{
                          ml: 1,
                          color: '#FFD700',
                          borderColor: '#FFD700',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                          }
                        }}
                      >
                        Export PDF
                        {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveResume(resumeData)}
                        disabled={loading}
                        sx={{
                          ml: 1,
                          color: '#2C5530',
                          borderColor: '#2C5530',
                          '&:hover': {
                            borderColor: '#2C5530',
                            backgroundColor: 'rgba(44, 85, 48, 0.1)'
                          }
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Typography>
                  
                  <Box 
                    id="resume-preview-container"
                    sx={{ 
                      transform: 'scale(0.8)',
                      transformOrigin: 'top center',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <ResumePreview resumeData={resumeData} />
                  </Box>
                </Box>
              </Grid>
            )}
            
            {isMobile && (
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={handlePreviewOpen}
                  sx={{
                    backgroundColor: '#2C5530',
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: '#1E3D23'
                    }
                  }}
                >
                  Preview Resume
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </StyledContainer>
      
      {/* Preview Dialog for Mobile */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
            color: '#FFFFFF'
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFD700' }}>
          Resume Preview
        </DialogTitle>
        <DialogContent>
          <Box 
            id="resume-preview-dialog"
            sx={{ 
              p: 2,
              backgroundColor: '#FFFFFF',
              borderRadius: 1
            }}
          >
            <ResumePreview resumeData={resumeData} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => handleExportResume(resumeData, 'pdf')}
            startIcon={<GetAppIcon />}
            sx={{
              color: '#FFD700',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Export PDF
            {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Button>
          <Button
            onClick={handlePreviewClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#FFFFFF'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeBuilderPage;
