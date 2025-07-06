import React from 'react';
import {
  Typography as MuiTypography,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

/**
 * Standardized Typography Component
 * Ensures consistent typography hierarchy and theme usage
 */
const Typography = ({
  variant = 'body1',
  component,
  jamaican = false, // Use Jamaican gradient styling
  responsive = true, // Auto-adjust for mobile
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const { jamaicanColors } = useTheme();
  const _isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Auto-determine component if not specified
  const getComponent = () => {
    if (component) return component;
    
    const componentMap = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      subtitle1: 'h6',
      subtitle2: 'h6',
      body1: 'p',
      body2: 'p',
      caption: 'span',
      overline: 'span',
      button: 'span'
    };
    
    return componentMap[variant] || 'span';
  };

  // Jamaican theme styling
  const getJamaicanStyling = () => {
    if (!jamaican) return {};

    return {
      sx: {
        background: `linear-gradient(45deg, ${jamaicanColors.green}, ${jamaicanColors.gold})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        ...props.sx
      }
    };
  };

  // Responsive adjustments
  const getResponsiveProps = () => {
    if (!responsive) return {};
    
    // Apply responsive typography from theme
    return {
      sx: {
        ...muiTheme.typography[variant],
        ...props.sx
      }
    };
  };

  const typographyProps = {
    variant,
    component: getComponent(),
    ...(jamaican ? getJamaicanStyling() : {}),
    ...(responsive ? getResponsiveProps() : {}),
    ...props
  };

  return <MuiTypography {...typographyProps} />;
};

/**
 * Specialized Typography variants for common use cases
 */
export const PageTitle = (props) => (
  <Typography
    variant="h1"
    component="h1"
    jamaican
    responsive
    sx={{
      textAlign: 'center',
      mb: 4,
      fontWeight: 800,
      ...props.sx
    }}
    {...props}
  />
);

export const SectionTitle = (props) => (
  <Typography
    variant="h2"
    component="h2"
    jamaican
    responsive
    sx={{
      textAlign: 'center',
      mb: 3,
      fontWeight: 700,
      ...props.sx
    }}
    {...props}
  />
);

export const CardTitle = (props) => (
  <Typography
    variant="h5"
    component="h3"
    responsive
    sx={{
      fontWeight: 600,
      mb: 1,
      ...props.sx
    }}
    {...props}
  />
);

export const JobTitle = (props) => (
  <Typography
    variant="h6"
    component="h4"
    responsive
    sx={{
      fontWeight: 600,
      color: 'primary.main',
      ...props.sx
    }}
    {...props}
  />
);

export const CompanyName = (props) => (
  <Typography
    variant="subtitle1"
    component="span"
    responsive
    sx={{
      fontWeight: 500,
      color: 'text.secondary',
      ...props.sx
    }}
    {...props}
  />
);

export const Tagline = (props) => (
  <Typography
    variant="tagline" // Custom variant from theme
    component="p"
    responsive
    sx={{
      textAlign: 'center',
      fontStyle: 'italic',
      color: 'text.secondary',
      ...props.sx
    }}
    {...props}
  />
);

export const Label = (props) => (
  <Typography
    variant="body2"
    component="label"
    responsive
    sx={{
      fontWeight: 600,
      color: 'text.primary',
      ...props.sx
    }}
    {...props}
  />
);

export const Caption = (props) => (
  <Typography
    variant="caption"
    component="span"
    responsive
    sx={{
      color: 'text.secondary',
      ...props.sx
    }}
    {...props}
  />
);

export const ButtonText = (props) => (
  <Typography
    variant="button"
    component="span"
    responsive
    sx={{
      fontWeight: 600,
      ...props.sx
    }}
    {...props}
  />
);

export default Typography;
