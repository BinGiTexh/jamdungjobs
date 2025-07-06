import React from 'react';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  CircularProgress,
  useTheme as useMuiTheme
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive, getTouchTargetSize } from '../../utils/responsive';

/**
 * Standardized Button Component
 * Ensures consistent styling, touch targets, and theme usage
 */
const Button = ({
  children,
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  jamaican = false, // Use Jamaican-specific styling
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'start',
  touchOptimized = true, // Auto-optimize for mobile touch
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode, jamaicanColors } = useTheme();
  const { isMobile: _isMobile } = useResponsive();

  // Touch-optimized sizing using responsive utilities
  const getTouchOptimizedProps = () => {
    if (!touchOptimized) return {};
    
    const touchTargets = getTouchTargetSize(size, touchOptimized);
    
    return {
      sx: {
        ...touchTargets,
        fontSize: _isMobile ? '1.1rem' : undefined,
        ...props.sx
      }
    };
  };

  // Jamaican theme styling
  const getJamaicanStyling = () => {
    if (!jamaican) return {};

    const jamaicanStyle = {
      background: isDarkMode 
        ? `linear-gradient(45deg, ${jamaicanColors.darkGreen}, ${jamaicanColors.gold})`
        : `linear-gradient(45deg, ${jamaicanColors.green}, ${jamaicanColors.gold})`,
      color: 'white',
      fontWeight: 700,
      textTransform: 'none',
      boxShadow: '0 4px 12px rgba(0,150,57,0.3)',
      '&:hover': {
        background: isDarkMode 
          ? `linear-gradient(45deg, ${jamaicanColors.green}, ${jamaicanColors.goldDark})`
          : `linear-gradient(45deg, ${jamaicanColors.darkGreen}, ${jamaicanColors.goldDark})`,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,150,57,0.4)'
      },
      '&:active': {
        transform: 'translateY(0px)'
      },
      '&:disabled': {
        background: muiTheme.palette.action.disabledBackground,
        color: muiTheme.palette.action.disabled
      }
    };

    return { sx: { ...jamaicanStyle, ...props.sx } };
  };

  // Loading state
  const getLoadingProps = () => {
    if (!loading) return {};
    
    return {
      disabled: true,
      startIcon: <CircularProgress size={20} color="inherit" />
    };
  };

  // Icon positioning
  const getIconProps = () => {
    if (!icon) return {};
    
    return iconPosition === 'start' 
      ? { startIcon: icon }
      : { endIcon: icon };
  };

  const buttonProps = {
    variant,
    size,
    color,
    fullWidth,
    disabled: disabled || loading,
    ...getIconProps(),
    ...getLoadingProps(),
    ...(touchOptimized ? getTouchOptimizedProps() : {}),
    ...(jamaican ? getJamaicanStyling() : {}),
    ...props
  };

  return (
    <MuiButton {...buttonProps}>
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
};

/**
 * Standardized IconButton Component
 * Optimized for touch interfaces with consistent sizing
 */
export const IconButton = ({
  children,
  size = 'medium',
  color = 'default',
  touchOptimized = true,
  ...props
}) => {
  const { isMobile: _isMobile } = useResponsive();

  const getTouchOptimizedProps = () => {
    if (!touchOptimized) return {};
    
    const touchTargets = getTouchTargetSize(size, touchOptimized);
    return {
      sx: {
        ...touchTargets,
        ...props.sx
      }
    };
  };

  return (
    <MuiIconButton
      size={size}
      color={color}
      {...(touchOptimized ? getTouchOptimizedProps() : {})}
      {...props}
    >
      {children}
    </MuiIconButton>
  );
};

// Export variants for common use cases
export const JamaicanButton = (props) => (
  <Button jamaican touchOptimized {...props} />
);

export const TouchButton = (props) => (
  <Button touchOptimized size="large" {...props} />
);

export default Button;
