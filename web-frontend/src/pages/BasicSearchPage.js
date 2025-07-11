import React from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import BasicJobSearch from '../components/search/BasicJobSearch';

/**
 * Basic Search Page
 * Simple, focused search experience for all users
 */
const BasicSearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || '';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      pt: 2
    }}>
      <BasicJobSearch 
        initialQuery={initialQuery}
        initialLocation={initialLocation}
        showTitle={true}
        variant="full"
      />
    </Box>
  );
};

export default BasicSearchPage;
