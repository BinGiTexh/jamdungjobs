import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import BasicJobSearch from '../components/search/BasicJobSearch';
import CompactJobSearch from '../components/search/CompactJobSearch';

/**
 * Search Test Page
 * Demonstrates different variants of the basic search component
 */
const SearchTestPage = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 700,
            color: '#00A651',
            mb: 1
          }}
        >
          Basic Search Component Test
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            color: 'text.secondary',
            mb: 6
          }}
        >
          Testing different variants of the universal job search component
        </Typography>

        {/* Full Search Component */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#00A651' }}>
            Full Search Component
          </Typography>
          <BasicJobSearch 
            showTitle={false}
            variant="full"
          />
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Compact Search Component */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#00A651' }}>
            Compact Search Component
          </Typography>
          <CompactJobSearch 
            title="Quick Job Search"
            subtitle="Find jobs quickly and easily"
          />
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Embedded Search Component */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#00A651' }}>
            Embedded Search Component
          </Typography>
          <BasicJobSearch 
            showTitle={false}
            variant="embedded"
            maxWidth="md"
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default SearchTestPage;
