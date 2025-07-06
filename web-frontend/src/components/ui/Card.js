import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardHeader,
  CardMedia,
  Paper,
  useTheme as useMuiTheme
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive, getResponsivePadding, getResponsiveTransitions } from '../../utils/responsive';
import Button from './Button';

/**
 * Standardized Card Component
 * Ensures consistent spacing, elevation, and responsive behavior
 */
const Card = ({
  children,
  variant = 'elevation', // 'elevation' | 'outlined' | 'jamaican'
  elevation = 2,
  interactive = false, // Adds hover effects
  padding = 'medium', // 'small' | 'medium' | 'large' | 'none'
  borderRadius = 'medium', // 'small' | 'medium' | 'large' | 'round'
  header,
  actions,
  media,
  fullHeight = false,
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const { isDarkMode, jamaicanColors } = useTheme();
  const { isMobile } = useResponsive();
  const transitions = getResponsiveTransitions(isMobile);

  // Padding mapping using responsive utilities
  const getPadding = () => {
    return getResponsivePadding(padding);
  };

  // Border radius mapping
  const getBorderRadius = () => {
    const radiusMap = {
      small: muiTheme.spacing(1),
      medium: muiTheme.spacing(1.5),
      large: muiTheme.spacing(3),
      round: muiTheme.spacing(6)
    };
    return radiusMap[borderRadius] || radiusMap.medium;
  };

  // Interactive hover effects
  const getInteractiveStyles = () => {
    if (!interactive) return {};
    
    return {
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(0,0,0,0.4)' 
          : '0 8px 32px rgba(0,0,0,0.15)',
        borderColor: variant === 'outlined' ? muiTheme.palette.primary.main : undefined
      },
      '&:active': {
        transform: 'translateY(-2px)'
      }
    };
  };

  // Jamaican theme styling
  const getJamaicanStyles = () => {
    if (variant !== 'jamaican') return {};

    return {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${jamaicanColors.darkGreen}15, ${jamaicanColors.gold}10)`
        : `linear-gradient(135deg, ${jamaicanColors.green}08, ${jamaicanColors.gold}05)`,
      border: `2px solid ${isDarkMode ? jamaicanColors.gold : jamaicanColors.green}`,
      backdropFilter: 'blur(10px)'
    };
  };

  const cardStyles = {
    borderRadius: getBorderRadius(),
    height: fullHeight ? '100%' : 'auto',
    display: fullHeight ? 'flex' : 'block',
    flexDirection: fullHeight ? 'column' : undefined,
    backgroundColor: isDarkMode 
      ? muiTheme.palette.background.paper 
      : muiTheme.palette.background.paper,
    ...getInteractiveStyles(),
    ...getJamaicanStyles(),
    ...props.sx
  };

  const CardComponent = variant === 'outlined' ? Paper : MuiCard;
  const cardProps = {
    elevation: variant === 'elevation' ? elevation : 0,
    variant: variant === 'outlined' ? 'outlined' : undefined,
    sx: cardStyles,
    ...props
  };

  return (
    <CardComponent {...cardProps}>
      {header && <CardHeader {...header} />}
      {media && <CardMedia {...media} />}
      
      <CardContent 
        sx={{ 
          p: getPadding(),
          flex: fullHeight ? 1 : undefined,
          '&:last-child': {
            paddingBottom: actions ? getPadding() : getPadding()
          }
        }}
      >
        {children}
      </CardContent>
      
      {actions && (
        <CardActions 
          sx={{ 
            p: getPadding(),
            pt: 0,
            justifyContent: 'flex-end',
            gap: muiTheme.spacing(1)
          }}
        >
          {actions}
        </CardActions>
      )}
    </CardComponent>
  );
};

/**
 * Specialized Card variants for common use cases
 */
export const JobCard = ({ job, onApply, onView, ...props }) => (
  <Card
    variant="elevation"
    interactive
    padding="medium"
    fullHeight
    actions={[
      <Button key="view" variant="outlined" size="small" onClick={onView}>
        View Details
      </Button>,
      <Button key="apply" variant="contained" size="small" onClick={onApply}>
        Apply Now
      </Button>
    ]}
    {...props}
  >
    {props.children}
  </Card>
);

export const FeatureCard = (props) => (
  <Card
    variant="jamaican"
    interactive
    padding="large"
    borderRadius="large"
    {...props}
  />
);

export const SimpleCard = (props) => (
  <Card
    variant="outlined"
    padding="medium"
    borderRadius="medium"
    {...props}
  />
);

export const CompactCard = (props) => (
  <Card
    variant="elevation"
    elevation={1}
    padding="small"
    borderRadius="small"
    {...props}
  />
);

export default Card;
