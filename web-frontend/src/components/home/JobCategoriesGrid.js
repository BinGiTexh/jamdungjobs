import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const JobCategoriesGrid = ({ onCategorySelect }) => {
  const muiTheme = useMuiTheme();
  const { jamaicanColors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Use theme-aware colors for better visibility
  const isDarkMode = muiTheme.palette.mode === 'dark';

  const jobCategories = [
    {
      name: 'Tourism & Hospitality',
      icon: '🏖️',
      count: '250+',
      color: jamaicanColors.green,
      description: 'Hotels, restaurants, attractions'
    },
    {
      name: 'Banking & Finance',
      icon: '🏦',
      count: '180+',
      color: jamaicanColors.gold,
      description: 'Banks, credit unions, insurance'
    },
    {
      name: 'Technology',
      icon: '💻',
      count: '120+',
      color: jamaicanColors.green,
      description: 'Software, IT support, digital'
    },
    {
      name: 'Healthcare',
      icon: '🏥',
      count: '200+',
      color: jamaicanColors.gold,
      description: 'Hospitals, clinics, nursing'
    },
    {
      name: 'Education',
      icon: '📚',
      count: '150+',
      color: jamaicanColors.green,
      description: 'Schools, universities, training'
    },
    {
      name: 'Retail & Sales',
      icon: '🛍️',
      count: '300+',
      color: jamaicanColors.gold,
      description: 'Stores, malls, customer service'
    },
    {
      name: 'Construction',
      icon: '🏗️',
      count: '90+',
      color: jamaicanColors.green,
      description: 'Building, engineering, trades'
    },
    {
      name: 'Government',
      icon: '🏛️',
      count: '80+',
      color: jamaicanColors.gold,
      description: 'Public service, administration'
    }
  ];

  const handleCategoryClick = (category) => {
    console.warn('🏢 Category Selected:', category.name);
    if (onCategorySelect) {
      onCategorySelect(category.name);
    }
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontWeight: 700,
          color: jamaicanColors.green
        }}
      >
        Browse Jobs by Industry 🇯🇲
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: 'text.secondary',
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        Find opportunities in Jamaica's top industries - just tap to explore!
      </Typography>

      <Grid container spacing={3}>
        {jobCategories.map((category, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                border: '2px solid transparent',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                backgroundColor: muiTheme.palette.background.paper,
                // Enhanced focus indicator for accessibility
                '&:focus': {
                  outline: `2px solid ${category.color}`,
                  outlineOffset: '2px',
                  backgroundColor: muiTheme.palette.action.focus
                },
                '&:hover': {
                  border: `2px solid ${category.color}`,
                  transform: 'translateY(-4px)',
                  backgroundColor: muiTheme.palette.action.hover,
                  boxShadow: isDarkMode 
                    ? '0 8px 24px rgba(76, 175, 80, 0.2)' 
                    : `0 8px 24px ${category.color}20`
                },
                '&:active': {
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => handleCategoryClick(category)}
              tabIndex={0} // Make keyboard accessible
              role="button"
              aria-label={`Browse ${category.name} jobs - ${category.count} available`}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    mb: 1
                  }}
                >
                  {category.icon}
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    color: muiTheme.palette.text.primary // Use theme-aware primary text
                  }}
                >
                  {category.name}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: muiTheme.palette.text.secondary, // Theme-aware secondary text
                    mb: 1,
                    fontSize: isMobile ? '0.75rem' : '0.8rem'
                  }}
                >
                  {category.description}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: category.color, // Keep accent color for job count
                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                  }}
                >
                  {category.count} jobs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default JobCategoriesGrid;
