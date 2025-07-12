import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocationOn,
  Work,
  AttachMoney,
  Bookmark,
  Share,
  ArrowForward
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const EnhancedFeaturedJobs = ({ featuredJobs, onJobSelect }) => {
  const muiTheme = useMuiTheme();
  const { jamaicanColors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Use theme-aware colors for better visibility
  const isDarkMode = muiTheme.palette.mode === 'dark';

  const handleJobClick = (jobId) => {
    console.warn('💼 Job Selected:', jobId);
    if (onJobSelect) {
      onJobSelect(jobId);
    }
  };

  const handleSaveJob = (e, jobId) => {
    e.stopPropagation();
    console.warn('💾 Job Saved:', jobId);
    // TODO: Implement save job functionality
  };

  const handleShareJob = (e, jobId) => {
    e.stopPropagation();
    console.warn('📤 Job Shared:', jobId);
    // TODO: Implement share job functionality
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: muiTheme.palette.text.primary, // Use theme-aware primary text
            mb: 2
          }}
        >
          Featured Jobs in Jamaica 🌟
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: muiTheme.palette.text.secondary, // Theme-aware secondary text
            maxWidth: 600,
            mx: 'auto',
            mb: 2
          }}
        >
          Top opportunities from leading Jamaican companies
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: jamaicanColors.gold,
            fontWeight: 600
          }}
        >
          1,000+ jobs available • Updated daily
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {featuredJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid transparent',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                backgroundColor: muiTheme.palette.background.paper,
                // Enhanced focus indicator for accessibility
                '&:focus': {
                  outline: `2px solid ${jamaicanColors.green}`,
                  outlineOffset: '2px',
                  backgroundColor: muiTheme.palette.action.focus
                },
                '&:hover': {
                  border: `1px solid ${jamaicanColors.green}`,
                  transform: 'translateY(-4px)',
                  backgroundColor: muiTheme.palette.action.hover,
                  boxShadow: isDarkMode 
                    ? '0 8px 24px rgba(76, 175, 80, 0.2)' 
                    : `0 8px 24px ${jamaicanColors.green}15`
                },
                '&:active': {
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => handleJobClick(job.id)}
              tabIndex={0} // Make keyboard accessible
              role="button"
              aria-label={`View details for ${job.title} at ${job.company?.name || 'Company'}`}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Company Logo and Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontSize: '2rem' }}
                  >
                    {job.logo}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleSaveJob(e, job.id)}
                      sx={{
                        color: muiTheme.palette.text.secondary, // Theme-aware secondary text
                        '&:hover': {
                          color: jamaicanColors.gold,
                          backgroundColor: muiTheme.palette.action.hover
                        },
                        '&:focus': {
                          outline: `2px solid ${jamaicanColors.gold}`,
                          outlineOffset: '2px'
                        }
                      }}
                      aria-label="Save job"
                    >
                      <Bookmark fontSize="small" />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => handleShareJob(e, job.id)}
                      sx={{
                        color: muiTheme.palette.text.secondary, // Theme-aware secondary text
                        '&:hover': {
                          color: jamaicanColors.green,
                          backgroundColor: `${jamaicanColors.green}10`
                        }
                      }}
                    >
                      <Share fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Job Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: muiTheme.palette.text.primary, // Use theme-aware primary text
                    fontSize: isMobile ? '1.1rem' : '1.25rem'
                  }}
                >
                  {job.title}
                </Typography>

                {/* Company Name */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: muiTheme.palette.text.secondary // Theme-aware secondary text
                  }}
                >
                  {job.company?.name || 'Company'}
                </Typography>

                {/* Job Details */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: muiTheme.palette.text.secondary, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: muiTheme.palette.text.secondary }}>
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work sx={{ fontSize: 16, color: muiTheme.palette.text.secondary, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: muiTheme.palette.text.secondary }}>
                      {job.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ fontSize: 16, color: jamaicanColors.gold, mr: 0.5 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: jamaicanColors.gold,
                        fontWeight: 600
                      }}
                    >
                      {job.salary}
                    </Typography>
                  </Box>
                </Box>

                {/* Skills */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{
                          backgroundColor: `${jamaicanColors.green}10`,
                          color: jamaicanColors.green,
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                    {job.skills.length > 3 && (
                      <Chip
                        label={`+${job.skills.length - 3} more`}
                        size="small"
                        sx={{
                          backgroundColor: `${jamaicanColors.gold}10`,
                          color: jamaicanColors.gold,
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Apply Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: jamaicanColors.green,
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    minHeight: 44, // Touch-friendly
                    '&:hover': {
                      backgroundColor: jamaicanColors.green,
                      opacity: 0.9,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* View All Jobs Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          endIcon={<ArrowForward />}
          sx={{
            borderColor: jamaicanColors.green,
            color: jamaicanColors.green,
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            minHeight: 44,
            '&:hover': {
              borderColor: jamaicanColors.green,
              backgroundColor: `${jamaicanColors.green}10`
            }
          }}
        >
          View All Jobs
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedFeaturedJobs;
