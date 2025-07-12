import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Fade,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getGrowingIndustries } from '../../data/industryStats';
import IndustryCard from './IndustryCard';

const IndustryStatsSection = () => {
  const navigate = useNavigate();
  const growingIndustries = getGrowingIndustries().slice(0, 6); // Show top 6 growing industries

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <InsightsIcon 
                sx={{ 
                  fontSize: 40, 
                  color: '#FFD700',
                  mr: 1,
                  filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                }} 
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #007E1B 30%, #FFD700 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Growing Industries in Jamaica
              </Typography>
            </Box>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 3, 
                maxWidth: 800, 
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Discover career opportunities in Jamaica's fastest-growing sectors. 
              Based on Q1 2025 GDP data from the Statistical Institute of Jamaica.
            </Typography>

            {/* Stats Summary */}
            <Paper
              elevation={0}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, rgba(0, 126, 27, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: 3,
                mb: 4
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#007E1B', fontWeight: 700 }}>
                  6.4%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Top Growth Rate
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 30, backgroundColor: 'rgba(255, 215, 0, 0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700 }}>
                  11
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Growing Sectors
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 30, backgroundColor: 'rgba(255, 215, 0, 0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: '#009921', fontWeight: 700 }}>
                  1000+
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Job Opportunities
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Industry Cards Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {growingIndustries.map((industry, index) => (
              <Grid item xs={12} sm={6} lg={4} key={industry.id}>
                <Fade in timeout={1000 + index * 200}>
                  <Box>
                    <IndustryCard industry={industry} showJobCount={true} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Call to Action */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Ready to explore all industries and find your perfect career match?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/industries')}
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
                View All Industries
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                endIcon={<TrendingUpIcon />}
                onClick={() => navigate('/jobs?sort=industry_growth')}
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#FFD700',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Browse Hot Jobs
              </Button>
            </Box>
          </Box>

          {/* Data Source Attribution */}
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(255, 215, 0, 0.1)' }}>
            <Typography variant="caption" color="text.secondary">
              Industry growth data sourced from Statistical Institute of Jamaica (STATIN) - Q1 2025 GDP Report
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default IndustryStatsSection;
