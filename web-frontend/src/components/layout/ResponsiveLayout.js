import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery,
  Fade,
  Paper
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const ResponsiveLayout = ({ 
  children, 
  maxWidth = 'lg',
  disableGutters = false,
  sx = {},
  containerSx = {},
  enableFade = true,
  backgroundPattern = false,
  ...props 
}) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode, jamaicanColors: _jamaicanColors } = useTheme();
  const _isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const _isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const _isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));

  const getBackgroundPattern = () => {
    if (!backgroundPattern) return {};
    
    return {
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode 
          ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.5,
        zIndex: -1,
        pointerEvents: 'none'
      }
    };
  };

  const layoutStyles = {
    minHeight: '100vh',
    backgroundColor: muiTheme.palette.background.default,
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    ...getBackgroundPattern(),
    ...sx
  };

  const containerStyles = {
    py: { xs: 2, sm: 3, md: 4 },
    px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
    position: 'relative',
    zIndex: 1,
    ...containerSx
  };

  const content = (
    <Box sx={layoutStyles} {...props}>
      <Container 
        maxWidth={maxWidth} 
        sx={containerStyles}
        disableGutters={disableGutters}
      >
        {children}
      </Container>
    </Box>
  );

  if (enableFade) {
    return (
      <Fade in timeout={600}>
        {content}
      </Fade>
    );
  }

  return content;
};

// Specialized layout components for common use cases
export const PageLayout = ({ children, ...props }) => (
  <ResponsiveLayout 
    maxWidth="lg" 
    backgroundPattern 
    enableFade 
    {...props}
  >
    {children}
  </ResponsiveLayout>
);

export const HeroLayout = ({ children, ...props }) => {
  const { isDarkMode, jamaicanColors } = useTheme();
  
  return (
    <Box
      sx={{
        background: isDarkMode 
          ? `linear-gradient(135deg, ${jamaicanColors.darkGreen} 0%, ${jamaicanColors.goldDark} 100%)`
          : `linear-gradient(135deg, ${jamaicanColors.green} 0%, ${jamaicanColors.gold} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode 
            ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        },
        ...props.sx
      }}
      {...props}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          py: { xs: 6, sm: 8, md: 10, lg: 12 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export const CardLayout = ({ children, elevation = 2, ...props }) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode } = useTheme();
  
  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 3, md: 4 },
        transition: 'all 0.3s ease-in-out',
        backgroundColor: isDarkMode 
          ? muiTheme.palette.background.paper 
          : muiTheme.palette.background.paper,
        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0,0,0,0.4)' 
            : '0 4px 20px rgba(0,0,0,0.12)'
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export const SectionLayout = ({ children, title, subtitle, ...props }) => {
  const muiTheme = useMuiTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        ...props.sx
      }}
      {...props}
    >
      {title && (
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 6 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: subtitle ? 2 : 0,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default ResponsiveLayout;
