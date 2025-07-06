import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const EmptyApplicationsState = ({ 
  variant = 'no-applications', // 'no-applications', 'error', 'loading-error'
  onBrowseJobs,
  onCompleteProfile 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleBrowseJobs = () => {
    if (onBrowseJobs) {
      onBrowseJobs();
    } else {
      navigate('/jobs');
    }
  };

  const handleCompleteProfile = () => {
    if (onCompleteProfile) {
      onCompleteProfile();
    } else {
      navigate('/profile');
    }
  };

  const getContent = () => {
    switch (variant) {
      case 'error':
        return {
          icon: <SearchIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />,
          title: "Ready to Start Your Job Search Journey?",
          subtitle: "Your applications will appear here once you start applying to jobs.",
          tip: "💡 Complete your profile to get better job recommendations"
        };
      case 'loading-error':
        return {
          icon: <TrendingUpIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />,
          title: "Discover Amazing Job Opportunities",
          subtitle: "Jamaica's job market is growing! Start exploring positions that match your skills.",
          tip: "🌟 Tip: Set up job alerts to never miss the perfect opportunity"
        };
      default:
        return {
          icon: <SearchIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />,
          title: "Ready to Find Your Dream Job?",
          subtitle: "Your job applications will appear here once you start applying.",
          tip: "💡 Tip: Complete your profile to get better job recommendations"
        };
    }
  };

  const content = getContent();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          py={4}
          px={2}
        >
          {content.icon}
          
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            {content.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="textSecondary" 
            sx={{ mb: 3, maxWidth: 400 }}
          >
            {content.subtitle}
          </Typography>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={handleBrowseJobs}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                }
              }}
            >
              Browse Available Jobs
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<PersonIcon />}
              onClick={handleCompleteProfile}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: `${theme.palette.primary.main}08`
                }
              }}
            >
              Complete Your Profile
            </Button>
          </Stack>

          {/* Quick Stats/Tips */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ 
                backgroundColor: theme.palette.background.default,
                padding: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              {content.tip}
            </Typography>
          </Box>

          {/* Popular Categories */}
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Popular job categories in Jamaica:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {['Technology', 'Healthcare', 'Finance', 'Tourism', 'Education'].map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  onClick={() => navigate(`/jobs?category=${category.toLowerCase()}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmptyApplicationsState;
