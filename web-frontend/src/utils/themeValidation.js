/**
 * Theme Validation Utility
 * Helps ensure consistent usage of theme values across components
 */

import { themeConfig } from '../theme/themeConfig';

/**
 * Extract hardcoded color patterns from component code
 */
export const HARDCODED_COLOR_PATTERNS = [
  /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g, // Hex colors
  /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // RGB colors
  /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA colors
  /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g, // HSL colors
  /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g // HSLA colors
];

/**
 * Allowed color values that should use theme instead
 */
export const THEME_COLOR_MAP = {
  // Primary colors
  '#009639': 'theme.palette.primary.main',
  '#4CAF50': 'theme.palette.primary.light',
  '#006D2C': 'theme.palette.primary.dark',
  
  // Secondary colors
  '#FFD700': 'theme.palette.secondary.main',
  '#FFEB3B': 'theme.palette.secondary.light',
  '#FFA000': 'theme.palette.secondary.dark',
  
  // Common colors that should be themed
  '#000000': 'theme.palette.text.primary',
  '#ffffff': 'theme.palette.background.paper',
  '#f5f5f5': 'theme.palette.background.elevated',
  '#fafafa': 'theme.palette.background.default'
};

/**
 * Validate if a component follows theme consistency rules
 */
export const validateThemeUsage = (componentCode, componentName) => {
  const issues = [];
  
  // Check for hardcoded colors
  HARDCODED_COLOR_PATTERNS.forEach(pattern => {
    const matches = componentCode.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const suggestion = THEME_COLOR_MAP[match];
        issues.push({
          type: 'hardcoded-color',
          value: match,
          suggestion: suggestion || 'Use theme.palette values',
          severity: 'error',
          component: componentName
        });
      });
    }
  });
  
  // Check for hardcoded spacing values
  const spacingPattern = /(?:margin|padding|gap):\s*['"]\d+px['"]/g;
  const spacingMatches = componentCode.match(spacingPattern);
  if (spacingMatches) {
    spacingMatches.forEach(match => {
      issues.push({
        type: 'hardcoded-spacing',
        value: match,
        suggestion: 'Use theme.spacing() function',
        severity: 'warning',
        component: componentName
      });
    });
  }
  
  // Check for hardcoded typography
  const fontSizePattern = /fontSize:\s*['"]\d+(?:px|rem|em)['"]/g;
  const fontMatches = componentCode.match(fontSizePattern);
  if (fontMatches) {
    fontMatches.forEach(match => {
      issues.push({
        type: 'hardcoded-typography',
        value: match,
        suggestion: 'Use theme.typography variants',
        severity: 'warning',
        component: componentName
      });
    });
  }
  
  return issues;
};

/**
 * Generate theme-compliant replacements
 */
export const generateThemeReplacements = (hardcodedValue) => {
  // Color replacements
  if (THEME_COLOR_MAP[hardcodedValue]) {
    return THEME_COLOR_MAP[hardcodedValue];
  }
  
  // Spacing replacements (convert px to theme.spacing)
  const pxMatch = hardcodedValue.match(/(\d+)px/);
  if (pxMatch) {
    const pixels = parseInt(pxMatch[1]);
    const spacingUnits = Math.round(pixels / 8); // Assuming 8px base spacing
    return `theme.spacing(${spacingUnits})`;
  }
  
  return null;
};

/**
 * Check if component properly imports theme
 */
export const validateThemeImports = (componentCode) => {
  const hasUseTheme = componentCode.includes('useTheme');
  const hasThemeImport = componentCode.includes("from '@mui/material/styles'") || 
                        componentCode.includes("from '../theme/") ||
                        componentCode.includes("from '../../theme/");
  
  return {
    hasUseTheme,
    hasThemeImport,
    isValid: hasUseTheme && hasThemeImport
  };
};

/**
 * Validate breakpoint usage
 */
export const validateBreakpointUsage = (componentCode) => {
  const issues = [];
  
  // Check for hardcoded breakpoint values
  const hardcodedBreakpoints = [
    /768px/g,
    /960px/g,
    /1024px/g,
    /1200px/g,
    /600px/g
  ];
  
  hardcodedBreakpoints.forEach(pattern => {
    const matches = componentCode.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'hardcoded-breakpoint',
          value: match,
          suggestion: 'Use theme.breakpoints.down() or theme.breakpoints.up()',
          severity: 'warning'
        });
      });
    }
  });
  
  return issues;
};

/**
 * Get theme-compliant touch target recommendations
 */
export const getTouchTargetRecommendations = () => {
  return {
    minimumSize: '44px', // WCAG AA minimum
    recommendedSize: '48px', // Better UX
    buttonMinHeight: 'theme.spacing(6)', // 48px with default spacing
    iconButtonMinSize: 'theme.spacing(5.5)' // 44px with default spacing
  };
};

/**
 * Export theme constants for easy access
 */
export const THEME_CONSTANTS = {
  JAMAICAN_COLORS: themeConfig.jamaicanColors,
  SPACING_UNIT: 8, // Base spacing unit in pixels
  BORDER_RADIUS: 8, // Base border radius
  TOUCH_TARGET_MIN: 44, // Minimum touch target size
  TOUCH_TARGET_RECOMMENDED: 48 // Recommended touch target size
};

export default {
  validateThemeUsage,
  validateThemeImports,
  validateBreakpointUsage,
  generateThemeReplacements,
  getTouchTargetRecommendations,
  THEME_CONSTANTS
};
