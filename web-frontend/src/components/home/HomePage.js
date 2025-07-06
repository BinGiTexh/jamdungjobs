// JamDung Jobs v1.2 - Deployment verification commit
import React from 'react';
import { Box } from '@mui/material';
import Seo from '../common/Seo';
import HeroSection from './HeroSection';
import UserTypeCards from './UserTypeCards';
import GrowingIndustries from './GrowingIndustries';
import HowItWorks from './HowItWorks';

const HomePage = () => {
  return (
    <>
      <Seo 
        title="Jamaica Job Board – Find Jobs & Hire Talent" 
        description="Discover the latest job opportunities across Jamaica or post vacancies for top local talent on JamDung Jobs." 
      />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0A'
        }}
      >
        <HeroSection />
        <UserTypeCards />
        <GrowingIndustries />
        <HowItWorks />
      </Box>
    </>
  );
};

export default HomePage;
