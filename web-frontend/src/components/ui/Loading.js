import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  useTheme as useMuiTheme
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import Typography from './Typography';

/**
 * Standardized Loading Component
 * Consistent loading states across the application
 */
const Loading = ({
  variant = 'circular', // 'circular' | 'linear' | 'skeleton' | 'dots'
  size = 'medium', // 'small' | 'medium' | 'large'
  message,
  jamaican = false,
  fullScreen = false,
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode, jamaicanColors } = useTheme();

  // Size mapping
  const getSizeProps = () => {
    const sizeMap = {
      small: { width: 24, height: 24 },
      medium: { width: 40, height: 40 },
      large: { width: 60, height: 60 }
    };
    return sizeMap[size] || sizeMap.medium;
  };

  // Jamaican colors
  const getJamaicanStyles = () => {
    if (!jamaican) return {};
    
    return {
      '& .MuiCircularProgress-circle': {
        stroke: `url(#jamaican-gradient-${Date.now()})`
      }
    };
  };

  const renderJamaicanGradient = () => (
    <svg width="0" height="0">
      <defs>
        <linearGradient id={`jamaican-gradient-${Date.now()}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={jamaicanColors.green} />
          <stop offset="100%" stopColor={jamaicanColors.gold} />
        </linearGradient>
      </defs>
    </svg>
  );

  const renderCircular = () => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {jamaican && renderJamaicanGradient()}
      <CircularProgress
        size={getSizeProps().width}
        sx={{
          color: jamaican ? jamaicanColors.green : 'primary.main',
          ...getJamaicanStyles()
        }}
        {...props}
      />
    </Box>
  );

  const renderLinear = () => (
    <LinearProgress
      sx={{
        width: '100%',
        borderRadius: 1,
        backgroundColor: muiTheme.palette.action.hover,
        '& .MuiLinearProgress-bar': {
          background: jamaican 
            ? `linear-gradient(90deg, ${jamaicanColors.green}, ${jamaicanColors.gold})`
            : muiTheme.palette.primary.main
        }
      }}
      {...props}
    />
  );

  const renderSkeleton = () => (
    <Box>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={getSizeProps().height}
        sx={{ borderRadius: 1 }}
      />
      {message && (
        <Skeleton 
          variant="text" 
          width="60%" 
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );

  const renderDots = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center'
      }}
    >
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: size === 'small' ? 6 : size === 'large' ? 12 : 8,
            height: size === 'small' ? 6 : size === 'large' ? 12 : 8,
            borderRadius: '50%',
            backgroundColor: jamaican ? jamaicanColors.green : 'primary.main',
            animation: `jamaicanDots 1.4s ease-in-out ${dot * 0.16}s infinite both`,
            '@keyframes jamaicanDots': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
                opacity: 0.5
              },
              '40%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        />
      ))}
    </Box>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'linear':
        return renderLinear();
      case 'skeleton':
        return renderSkeleton();
      case 'dots':
        return renderDots();
      default:
        return renderCircular();
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          justifyContent: 'center'
        }),
        ...props.sx
      }}
    >
      {renderVariant()}
      {message && variant !== 'skeleton' && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
};

/**
 * Specialized Loading variants
 */
export const PageLoader = (props) => (
  <Loading
    variant="circular"
    size="large"
    jamaican
    message="Loading..."
    fullScreen
    {...props}
  />
);

export const ButtonLoader = (props) => (
  <Loading
    variant="circular"
    size="small"
    {...props}
  />
);

export const ContentLoader = (props) => (
  <Loading
    variant="skeleton"
    size="medium"
    {...props}
  />
);

export const InlineLoader = (props) => (
  <Loading
    variant="dots"
    size="small"
    jamaican
    {...props}
  />
);

export default Loading;
