import React from 'react';
import {
  Box,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery,
  Slide
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { HeroLayout, PageLayout, SectionLayout, CardLayout } from './ResponsiveLayout';

const PageTemplate = ({
  title,
  subtitle,
  heroContent,
  children,
  showHero = true,
  heroHeight = 'auto',
  maxWidth = 'lg',
  fadeIn = true,
  slideDirection: _slideDirection = 'up',
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode: _isDarkMode, jamaicanColors: _jamaicanColors } = useTheme();
  const _isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const heroSection = showHero && (
    <HeroLayout
      sx={{
        minHeight: heroHeight === 'auto' 
          ? { xs: '50vh', sm: '60vh', md: '70vh' }
          : heroHeight,
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <Box sx={{ width: '100%' }}>
        {title && (
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: subtitle ? 2 : 4,
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem', lg: '4rem' }
            }}
          >
            {title}
          </Typography>
        )}
        
        {subtitle && (
          <Typography
            variant="h5"
            component="p"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 500,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {heroContent && (
          <Slide direction="up" in timeout={1200}>
            <Box>{heroContent}</Box>
          </Slide>
        )}
      </Box>
    </HeroLayout>
  );

  const mainContent = (
    <PageLayout maxWidth={maxWidth} {...props}>
      {children}
    </PageLayout>
  );

  if (fadeIn) {
    return (
      <Box>
        {heroSection}
        {mainContent}
      </Box>
    );
  }

  return (
    <Box>
      {heroSection}
      {mainContent}
    </Box>
  );
};

// Specialized page templates for common use cases
export const DashboardTemplate = ({ children, title, subtitle, actions, ...props }) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode: _isDarkMode } = useTheme();
  
  return (
    <PageLayout {...props}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          {title && (
            <Typography
              variant="h3"
              component="h1"
              sx={{
                mb: subtitle ? 1 : 0,
                fontWeight: 700,
                background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
      {children}
    </PageLayout>
  );
};

export const FormTemplate = ({ 
  children, 
  title, 
  subtitle, 
  maxWidth = 'sm',
  showCard = true,
  ...props 
}) => {
  const content = (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      {title && (
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: subtitle ? 2 : 0, fontWeight: 700 }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  if (showCard) {
    return (
      <PageLayout maxWidth={maxWidth} {...props}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh'
          }}
        >
          <CardLayout sx={{ width: '100%', maxWidth: 500 }}>
            {content}
            {children}
          </CardLayout>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth={maxWidth} {...props}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}
      >
        {content}
        {children}
      </Box>
    </PageLayout>
  );
};

export const ListTemplate = ({ 
  children, 
  title, 
  subtitle, 
  filters,
  actions,
  emptyState,
  loading = false,
  ...props 
}) => {
  return (
    <PageLayout {...props}>
      <SectionLayout title={title} subtitle={subtitle}>
        {(filters || actions) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 4,
              gap: 2
            }}
          >
            {filters && <Box sx={{ flex: 1 }}>{filters}</Box>}
            {actions && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {actions}
              </Box>
            )}
          </Box>
        )}
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : children ? (
          children
        ) : emptyState ? (
          emptyState
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No items found
            </Typography>
          </Box>
        )}
      </SectionLayout>
    </PageLayout>
  );
};

export default PageTemplate;
