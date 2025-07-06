import React from 'react';
import { Box, Typography } from '@mui/material';
import BasicJobSearch from './BasicJobSearch';

/**
 * Compact Job Search Component
 * For embedding in homepage or other pages
 */
const CompactJobSearch = ({ 
  title = 'Find Your Next Job',
  subtitle = 'Search thousands of jobs across Jamaica'
}) => {
  return (
    <Box sx={{ 
      py: 4,
      px: 2,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: '#00A651',
            mb: 1
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      <BasicJobSearch 
        showTitle={false}
        variant="compact"
        maxWidth="md"
      />
    </Box>
  );
};

export default CompactJobSearch;
