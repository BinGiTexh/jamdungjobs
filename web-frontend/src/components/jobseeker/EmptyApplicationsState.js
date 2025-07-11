import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  Container
} from '@mui/material';
import {
  Work as WorkIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from '../profile/ProfileEditModal';

const EmptyApplicationsState = () => {
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const actionCards = [
    {
      title: 'Browse Jobs',
      description: 'Discover thousands of opportunities across Jamaica',
      icon: SearchIcon,
      action: () => navigate('/jobs'),
      buttonText: 'Find Jobs',
      color: '#007E1B'
    },
    {
      title: 'Complete Profile',
      description: 'Stand out with a complete professional profile',
      icon: PersonIcon,
      action: () => setProfileModalOpen(true),
      buttonText: 'Complete Profile',
      color: '#FFD700'
    },
    {
      title: 'Upload Resume',
      description: 'Let employers find you with an updated resume',
      icon: UploadIcon,
      action: () => navigate('/profile'),
      buttonText: 'Upload Resume',
      color: '#009921'
    }
  ];

  const tips = [
    'Complete your profile to increase visibility by 70%',
    'Upload a professional photo to get 3x more profile views',
    'Add relevant skills to match with better job opportunities',
    'Set up job alerts to never miss new opportunities'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Hero Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              background: 'linear-gradient(135deg, rgba(0, 126, 27, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
              borderRadius: 3,
              p: 4,
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}
          >
            <WorkIcon 
              sx={{ 
                fontSize: 80, 
                color: '#FFD700',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))'
              }} 
            />
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #007E1B 30%, #FFD700 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Ready to Start Your Career Journey?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
            >
              You haven't applied to any jobs yet. Let's change that! 
              Take the first step towards your dream career in Jamaica.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/jobs')}
              sx={{
                background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(0, 126, 27, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)',
                  boxShadow: '0 6px 20px rgba(0, 126, 27, 0.6)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Job Search
            </Button>
          </Box>

          {/* Action Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {actionCards.map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)',
                      border: `1px solid ${card.color}40`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 30px ${card.color}30`,
                        border: `1px solid ${card.color}80`
                      }
                    }}
                    onClick={card.action}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${card.color}20, ${card.color}40)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <card.icon sx={{ fontSize: 30, color: card.color }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ color: 'white', fontWeight: 600 }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {card.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderColor: card.color,
                          color: card.color,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: `${card.color}20`,
                            borderColor: card.color
                          }
                        }}
                      >
                        {card.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Success Tips */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 126, 27, 0.1) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LightbulbIcon sx={{ color: '#FFD700', fontSize: 32, mr: 2 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#FFD700'
                  }}
                >
                  Success Tips
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {tips.map((tip, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <TrendingUpIcon 
                        sx={{ 
                          color: '#007E1B', 
                          fontSize: 20, 
                          mr: 1.5, 
                          mt: 0.5,
                          flexShrink: 0
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.primary',
                          lineHeight: 1.6,
                          fontWeight: 500
                        }}
                      >
                        {tip}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Call to Action Footer */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                color: 'text.primary',
                opacity: 0.8
              }}
            >
              Need help getting started? Check out our career resources.
            </Typography>
            <Button
              variant="text"
              sx={{
                color: '#FFD700',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              View Career Guide
            </Button>
          </Box>
        </Box>
      </Fade>
      <ProfileEditModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={() => {
          setProfileModalOpen(false);
          // Optionally refresh parent component data
        }}
      />
    </Container>
  );
};

export default EmptyApplicationsState;
