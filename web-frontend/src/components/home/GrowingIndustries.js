import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Hotel as TourismIcon,
  Agriculture as AgricultureIcon,
  Factory as ManufacturingIcon,
  Computer as TechIcon,
  LocalHospital as HealthcareIcon,
  School as EducationIcon,
  AccountBalance as FinanceIcon,
  Palette as CreativeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#0F0F0F',
  padding: theme.spacing(8, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, rgba(0, 150, 57, 0.03) 100%)',
    zIndex: 0
  }
}));

const IndustryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 215, 0, 0.15)',
  borderRadius: '12px',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-6px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.12)',
    '& .industry-icon': {
      transform: 'scale(1.15)',
      color: '#FFD700'
    },
    '& .industry-title': {
      color: '#FFD700'
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(0, 150, 57, 0.08) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    zIndex: 0
  },
  '&:hover::before': {
    opacity: 1
  }
}));

const GrowingIndustries = () => {
  const navigate = useNavigate();

  const industries = [
    {
      icon: TourismIcon,
      title: 'Tourism & Hospitality',
      description: 'Hotels, restaurants, tour operations, and entertainment venues',
      jobCount: '2,500+',
      color: '#FFD700'
    },
    {
      icon: AgricultureIcon,
      title: 'Agriculture & Farming',
      description: 'Sustainable farming, agri-tech, and food processing',
      jobCount: '1,800+',
      color: '#009639'
    },
    {
      icon: ManufacturingIcon,
      title: 'Manufacturing',
      description: 'Textiles, food processing, and industrial production',
      jobCount: '1,200+',
      color: '#FFD700'
    },
    {
      icon: TechIcon,
      title: 'Information Technology',
      description: 'Software development, digital services, and tech startups',
      jobCount: '900+',
      color: '#009639'
    },
    {
      icon: HealthcareIcon,
      title: 'Healthcare',
      description: 'Medical services, nursing, and health administration',
      jobCount: '1,500+',
      color: '#FFD700'
    },
    {
      icon: EducationIcon,
      title: 'Education',
      description: 'Teaching, training, and educational administration',
      jobCount: '1,100+',
      color: '#009639'
    },
    {
      icon: FinanceIcon,
      title: 'Financial Services',
      description: 'Banking, insurance, and investment services',
      jobCount: '800+',
      color: '#FFD700'
    },
    {
      icon: CreativeIcon,
      title: 'Creative Industries',
      description: 'Music, film, design, and digital media',
      jobCount: '600+',
      color: '#009639'
    }
  ];

  const handleIndustryClick = (industry) => {
    navigate(`/jobs?industry=${encodeURIComponent(industry.title)}`);
  };

  return (
    <SectionContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
            color: '#FFD700',
            textAlign: 'center'
          }}
        >
          Growing Industries in Jamaica
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#FFFFFF',
            opacity: 0.8,
            mb: 6,
            textAlign: 'center',
            maxWidth: '700px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            lineHeight: 1.6
          }}
        >
          Explore opportunities in Jamaica's most dynamic and fastest-growing sectors
        </Typography>

        <Grid container spacing={3}>
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <IndustryCard onClick={() => handleIndustryClick(industry)}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: '100%'
                      }}
                    >
                      <IconComponent
                        className="industry-icon"
                        sx={{
                          fontSize: { xs: '2.5rem', sm: '3rem' },
                          color: industry.color,
                          mb: 2,
                          transition: 'all 0.3s ease-in-out'
                        }}
                      />
                      
                      <Typography
                        className="industry-title"
                        variant="h6"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          mb: 1.5,
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          lineHeight: 1.3,
                          transition: 'color 0.3s ease-in-out'
                        }}
                      >
                        {industry.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#FFFFFF',
                          opacity: 0.7,
                          mb: 2,
                          fontSize: '0.9rem',
                          lineHeight: 1.4,
                          flexGrow: 1
                        }}
                      >
                        {industry.description}
                      </Typography>
                      
                      <Box
                        sx={{
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          mt: 'auto'
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#FFD700',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        >
                          {industry.jobCount} jobs
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </IndustryCard>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography
            variant="body1"
            sx={{
              color: '#FFFFFF',
              opacity: 0.6,
              mb: 2
            }}
          >
            Can't find your industry? We have opportunities across all sectors.
          </Typography>
          
          <Box
            component="button"
            onClick={() => navigate('/jobs')}
            sx={{
              background: 'linear-gradient(90deg, #FFD700, #009639)',
              color: '#000000',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '8px',
              textTransform: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #009639, #FFD700)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
              }
            }}
          >
            View All Jobs
          </Box>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default GrowingIndustries;