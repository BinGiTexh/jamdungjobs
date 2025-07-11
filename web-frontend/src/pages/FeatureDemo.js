import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/system';
// Import our new components
import JobShareButton from '../components/common/JobShareButton';
import RecentlyViewedJobs, { trackJobView } from '../components/common/RecentlyViewedJobs';
import DeadlineWarning, { hasApproachingDeadline, getDeadlineUrgency } from '../components/common/DeadlineWarning';

// Styled components for consistent theming
const StyledCard = styled(Card)(({ theme }) => ({
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
    opacity: 0.2,
    zIndex: 0
  }
}));

const FeatureDemo = () => {
  const [sampleJobs] = useState([
    {
      id: '1',
      title: 'Senior React Developer',
      company: {
        id: '1',
        name: 'TechCorp Jamaica',
        logoUrl: null
      },
      location: 'Kingston, Jamaica',
      type: 'FULL_TIME',
      salary: { min: 80000, max: 120000, currency: 'JMD' },
      skills: ['React', 'JavaScript', 'Node.js'],
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      description: 'We are looking for an experienced React developer to join our team.'
    },
    {
      id: '2',
      title: 'Digital Marketing Specialist',
      company: {
        id: '2',
        name: 'Creative Solutions Ltd',
        logoUrl: null
      },
      location: 'Montego Bay, Jamaica',
      type: 'FULL_TIME',
      salary: { min: 60000, max: 90000, currency: 'JMD' },
      skills: ['Marketing', 'SEO', 'Social Media'],
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      description: 'Join our creative team and help brands grow their digital presence.'
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: {
        id: '3',
        name: 'CloudTech Jamaica',
        logoUrl: null
      },
      location: 'Spanish Town, Jamaica',
      type: 'CONTRACT',
      salary: { min: 100000, max: 150000, currency: 'JMD' },
      skills: ['AWS', 'Docker', 'Kubernetes'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      description: 'Help us build and maintain scalable cloud infrastructure.'
    },
    {
      id: '4',
      title: 'UX/UI Designer',
      company: {
        id: '4',
        name: 'Design Studio JA',
        logoUrl: null
      },
      location: 'Kingston, Jamaica',
      type: 'PART_TIME',
      salary: { min: 50000, max: 75000, currency: 'JMD' },
      skills: ['Figma', 'Adobe XD', 'User Research'],
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired (1 day ago)
      description: 'Create amazing user experiences for our digital products.'
    }
  ]);

  const handleTrackJobView = (job) => {
    trackJobView(job);
    // eslint-disable-next-line no-console
    console.log(`Tracked view for: ${job.title}`);
  };

  const clearRecentViews = () => {
    localStorage.removeItem('recentlyViewedJobs');
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2C5530 50%, #1a1a1a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/jamaica-flag-bg.png") center/cover',
          opacity: 0.05,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Page Header */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              color: '#FFD700', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              mb: 2
            }}
          >
            JamDung Jobs - New Features Demo
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2
            }}
          >
            Showcasing Job Sharing, Recently Viewed Jobs, and Deadline Warnings
          </Typography>
          <Alert severity="info" sx={{ mt: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
            This demo page shows the new features. Click around to test functionality!
          </Alert>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Job Listings with New Features */}
          <Grid item xs={12} md={8}>
            <Typography 
              variant="h5" 
              sx={{ color: '#FFD700', mb: 3, fontWeight: 'bold' }}
            >
              Job Listings with New Features
            </Typography>

            {sampleJobs.map((job) => {
              const urgency = getDeadlineUrgency(job);
              const _hasDeadline = hasApproachingDeadline(job);

              return (
                <StyledCard key={job.id}>
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                          {job.title}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                          {job.company.name} • {job.location}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                          {job.description}
                        </Typography>
                        
                        {/* Skills */}
                        <Box sx={{ mb: 2 }}>
                          {job.skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.7)'
                              }}
                            />
                          ))}
                        </Box>

                        {/* Urgency Badge */}
                        {urgency && (
                          <Chip
                            label={`Urgency: ${urgency.toUpperCase()}`}
                            color={urgency === 'critical' ? 'error' : urgency === 'urgent' ? 'warning' : 'info'}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                        {/* Salary */}
                        <Typography sx={{ color: '#FFD700', fontWeight: 'bold', mb: 1 }}>
                          ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                        </Typography>
                        
                        {/* Job Type */}
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                          {job.type.replace('_', ' ')}
                        </Typography>
                        
                        {/* Deadline Warning - NEW FEATURE */}
                        <Box sx={{ mb: 2 }}>
                          <DeadlineWarning job={job} />
                        </Box>
                        
                        {/* Job Share Button - NEW FEATURE */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                          <JobShareButton job={job} />
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleTrackJobView(job)}
                            sx={{
                              borderColor: '#FFD700',
                              color: '#FFD700',
                              '&:hover': {
                                borderColor: '#2C5530',
                                color: '#2C5530',
                                backgroundColor: 'rgba(255, 215, 0, 0.1)'
                              }
                            }}
                          >
                            View & Track
                          </Button>
                          
                          <Button
                            variant="contained"
                            disabled={urgency === 'expired'}
                            sx={{
                              backgroundColor: urgency === 'expired' ? 'rgba(244, 67, 54, 0.3)' : '#2C5530',
                              '&:hover': {
                                backgroundColor: urgency === 'expired' ? 'rgba(244, 67, 54, 0.3)' : '#1a3d21'
                              }
                            }}
                          >
                            {urgency === 'expired' ? 'Expired' : 'Apply Now'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              );
            })}
          </Grid>

          {/* Right Column - Recently Viewed Jobs */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ color: '#FFD700', mb: 3, fontWeight: 'bold' }}
            >
              Recently Viewed Jobs
            </Typography>
            
            {/* Recently Viewed Component - NEW FEATURE */}
            <RecentlyViewedJobs limit={5} />
            
            {/* Demo Controls */}
            <StyledCard sx={{ mt: 3 }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                  Demo Controls
                </Typography>
                <Button
                  variant="outlined"
                  onClick={clearRecentViews}
                  fullWidth
                  sx={{
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#2C5530',
                      color: '#2C5530',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  Clear Recent Views
                </Button>
              </CardContent>
            </StyledCard>

            {/* Feature Explanations */}
            <StyledCard sx={{ mt: 3 }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                  New Features
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    🔗 Job Sharing
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Share jobs via WhatsApp, LinkedIn, Twitter, or copy link
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 215, 0, 0.3)' }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    👁️ Recently Viewed
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Track and display recently viewed jobs with timestamps
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 215, 0, 0.3)' }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    ⏰ Deadline Warnings
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Visual warnings for application deadlines with urgency levels
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureDemo;
