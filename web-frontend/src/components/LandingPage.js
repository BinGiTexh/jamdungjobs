import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
  color: '#FFFFFF',
  padding: theme.spacing(15, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/images/pattern.svg) repeat',
    opacity: 0.1
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  background: theme.palette.background.paper,
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2)
  }
}));

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <HeroSection>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom>
                Find Your Dream Job in Jamaica
              </Typography>
              <Typography variant="h3" sx={{ mb: 4, fontWeight: 400 }}>
                Connect with top employers and opportunities across the island
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<SearchIcon />}
                sx={{ mr: 2 }}
              >
                Search Jobs
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
                size="large"
              >
                Post a Job
              </Button>
            </Grid>
            {!isMobile && (
              <Grid item md={6}>
                <Box
                  component="img"
                  src="/images/hero-illustration.svg"
                  alt="Job Search"
                  sx={{ width: '100%', maxWidth: 500 }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </HeroSection>

      <Container sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose JamDung Jobs?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <WorkIcon />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Latest Opportunities
                </Typography>
                <Typography color="text.secondary">
                  Access the newest job postings from top companies across Jamaica
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <BusinessIcon />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Top Employers
                </Typography>
                <Typography color="text.secondary">
                  Connect with leading companies looking for talent like you
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard>
              <SearchIcon />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Smart Search
                </Typography>
                <Typography color="text.secondary">
                  Find the perfect job match with our intelligent search system
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
