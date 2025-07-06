/**
 * Responsive Architecture Utilities
 * Provides consistent breakpoints, touch targets, and responsive patterns
 */

import { useTheme as useMuiTheme, useMediaQuery } from '@mui/material';

/**
 * Standard breakpoint values (consistent with theme)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 768,
  lg: 1024,
  xl: 1200
};

/**
 * Touch target constants (WCAG AA compliant)
 */
export const TOUCH_TARGETS = {
  MINIMUM: 44, // WCAG AA minimum
  RECOMMENDED: 48, // Better UX
  LARGE: 56, // For primary actions
  SMALL: 40 // For secondary actions (minimum viable)
};

/**
 * Standard spacing scale based on 8px grid
 */
export const SPACING_SCALE = {
  xs: 4,   // 0.5 * 8px
  sm: 8,   // 1 * 8px
  md: 16,  // 2 * 8px
  lg: 24,  // 3 * 8px
  xl: 32,  // 4 * 8px
  xxl: 48 // 6 * 8px
};

/**
 * Custom hook for responsive breakpoints
 */
export const useResponsive = () => {
  const muiTheme = useMuiTheme();
  
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(muiTheme.breakpoints.up('xl'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    
    // For breakpoint checks, we'll provide the theme object instead
    theme: muiTheme
  };
};

/**
 * Utility functions for breakpoint checks (non-hook versions)
 */
export const createBreakpointCheckers = (theme) => ({
  up: (breakpoint) => theme.breakpoints.up(breakpoint),
  down: (breakpoint) => theme.breakpoints.down(breakpoint),
  between: (start, end) => theme.breakpoints.between(start, end),
  only: (breakpoint) => theme.breakpoints.only(breakpoint)
});

/**
 * Get responsive touch target sizing
 */
export const getTouchTargetSize = (size = 'medium', touchOptimized = true) => {
  if (!touchOptimized) return {};

  const sizeMap = {
    small: {
      minHeight: { xs: TOUCH_TARGETS.MINIMUM, sm: TOUCH_TARGETS.SMALL },
      minWidth: { xs: TOUCH_TARGETS.MINIMUM, sm: TOUCH_TARGETS.SMALL }
    },
    medium: {
      minHeight: { xs: TOUCH_TARGETS.RECOMMENDED, sm: TOUCH_TARGETS.MINIMUM },
      minWidth: { xs: TOUCH_TARGETS.RECOMMENDED, sm: TOUCH_TARGETS.MINIMUM }
    },
    large: {
      minHeight: { xs: TOUCH_TARGETS.LARGE, sm: TOUCH_TARGETS.RECOMMENDED },
      minWidth: { xs: TOUCH_TARGETS.LARGE, sm: TOUCH_TARGETS.RECOMMENDED }
    }
  };

  return sizeMap[size] || sizeMap.medium;
};

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (spacing) => {
  if (typeof spacing === 'object') {
    return spacing; // Already responsive
  }

  // Convert single value to responsive object
  const baseSpacing = SPACING_SCALE[spacing] || spacing;
  
  return {
    xs: Math.max(baseSpacing * 0.75, SPACING_SCALE.xs),
    sm: baseSpacing,
    md: baseSpacing * 1.25,
    lg: baseSpacing * 1.5
  };
};

/**
 * Get responsive padding with touch-friendly adjustments
 */
export const getResponsivePadding = (size = 'medium') => {
  const paddingMap = {
    small: {
      xs: 1.5, // 12px
      sm: 2,   // 16px
      md: 2.5 // 20px
    },
    medium: {
      xs: 2,   // 16px
      sm: 3,   // 24px
      md: 4   // 32px
    },
    large: {
      xs: 3,   // 24px
      sm: 4,   // 32px
      md: 6   // 48px
    },
    none: 0
  };

  return paddingMap[size] || paddingMap.medium;
};

/**
 * Get responsive typography scale
 */
export const getResponsiveTypography = (variant) => {
  const typographyMap = {
    h1: {
      fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
      lineHeight: { xs: 1.2, sm: 1.1, md: 1.1 }
    },
    h2: {
      fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
      lineHeight: { xs: 1.3, sm: 1.2, md: 1.2 }
    },
    h3: {
      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
      lineHeight: { xs: 1.3, sm: 1.3, md: 1.3 }
    },
    h4: {
      fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
      lineHeight: { xs: 1.4, sm: 1.4, md: 1.4 }
    },
    h5: {
      fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.4rem' },
      lineHeight: { xs: 1.4, sm: 1.4, md: 1.4 }
    },
    h6: {
      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.2rem' },
      lineHeight: { xs: 1.5, sm: 1.5, md: 1.5 }
    },
    body1: {
      fontSize: { xs: '1rem', sm: '1.1rem' },
      lineHeight: { xs: 1.6, sm: 1.7 }
    },
    body2: {
      fontSize: { xs: '0.9rem', sm: '1rem' },
      lineHeight: { xs: 1.5, sm: 1.6 }
    },
    button: {
      fontSize: { xs: '1rem', sm: '1rem' },
      fontWeight: 600
    }
  };

  return typographyMap[variant] || {};
};

/**
 * Get responsive container max widths
 */
export const getResponsiveContainer = (size = 'lg') => {
  const containerMap = {
    xs: { maxWidth: 444 },
    sm: { maxWidth: 600 },
    md: { maxWidth: 960 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1920 },
    fluid: { maxWidth: '100%' }
  };

  return containerMap[size] || containerMap.lg;
};

/**
 * Navigation drawer configuration for different screen sizes
 * Pass isMobile state from useResponsive hook
 */
export const getDrawerConfig = (isMobile = false) => {
  return {
    width: isMobile ? 280 : 320,
    variant: isMobile ? 'temporary' : 'persistent',
    anchor: 'left',
    elevation: isMobile ? 16 : 8,
    
    // Touch-friendly item heights
    itemHeight: isMobile ? TOUCH_TARGETS.RECOMMENDED : TOUCH_TARGETS.MINIMUM,
    
    // Responsive spacing
    padding: isMobile ? 2 : 3,
    gap: isMobile ? 1 : 1.5
  };
};

/**
 * Grid system utilities
 */
export const getResponsiveGrid = (columns = { xs: 1, sm: 2, md: 3, lg: 4 }) => {
  return {
    container: true,
    spacing: { xs: 2, sm: 3, md: 4 },
    columns: { xs: 12 },
    ...columns
  };
};

/**
 * Form layout utilities
 */
export const getFormLayout = (variant = 'default') => {
  const layouts = {
    default: {
      spacing: { xs: 3, sm: 4 },
      maxWidth: { xs: '100%', sm: 600 },
      padding: getResponsivePadding('medium')
    },
    compact: {
      spacing: { xs: 2, sm: 3 },
      maxWidth: { xs: '100%', sm: 480 },
      padding: getResponsivePadding('small')
    },
    wide: {
      spacing: { xs: 4, sm: 5 },
      maxWidth: { xs: '100%', sm: 800 },
      padding: getResponsivePadding('large')
    }
  };

  return layouts[variant] || layouts.default;
};

/**
 * Animation and transition utilities for responsive components
 * Pass isMobile state from useResponsive hook
 */
export const getResponsiveTransitions = (isMobile = false) => {
  return {
    // Reduce motion on mobile for better performance
    duration: isMobile ? 200 : 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Common transitions
    transform: `transform ${isMobile ? 200 : 300}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    opacity: `opacity ${isMobile ? 150 : 250}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    shadow: `box-shadow ${isMobile ? 150 : 250}ms cubic-bezier(0.4, 0, 0.2, 1)`
  };
};

/**
 * Export everything for easy access
 */
const ResponsiveUtils = {
  BREAKPOINTS,
  TOUCH_TARGETS,
  SPACING_SCALE,
  useResponsive,
  getTouchTargetSize,
  getResponsiveSpacing,
  getResponsivePadding,
  getResponsiveTypography,
  getResponsiveContainer,
  getDrawerConfig,
  getResponsiveGrid,
  getFormLayout,
  getResponsiveTransitions
};

export default ResponsiveUtils;
