import React from 'react';
import {
  TextField as MuiTextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive, getTouchTargetSize } from '../../utils/responsive';

/**
 * Standardized Input Component
 * Ensures consistent styling, touch optimization, and theme usage
 */
const Input = ({
  variant = 'outlined',
  size = 'medium',
  touchOptimized = true,
  startIcon,
  endIcon,
  jamaican = false, // Use Jamaican theme colors
  ...props
}) => {
  const { isDarkMode, jamaicanColors } = useTheme();
  const { isMobile } = useResponsive();

  // Touch-optimized sizing using responsive utilities
  const getTouchOptimizedProps = () => {
    if (!touchOptimized) return {};
    
    const touchTargets = getTouchTargetSize(size, touchOptimized);
    
    return {
      sx: {
        '& .MuiOutlinedInput-root': {
          ...touchTargets,
          '& input': {
            fontSize: isMobile ? '1rem' : undefined,
            padding: { xs: '12px 16px', sm: '10px 14px' },
          },
        },
        ...props.sx,
      }
    };
  };

  // Jamaican theme styling
  const getJamaicanStyling = () => {
    if (!jamaican) return {};

    return {
      sx: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isDarkMode ? jamaicanColors.gold : jamaicanColors.green,
          },
          '&:hover fieldset': {
            borderColor: isDarkMode ? jamaicanColors.goldLight : jamaicanColors.lightGreen,
          },
          '&.Mui-focused fieldset': {
            borderColor: isDarkMode ? jamaicanColors.gold : jamaicanColors.green,
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': {
            color: isDarkMode ? jamaicanColors.gold : jamaicanColors.green,
          },
        },
        ...props.sx,
      }
    };
  };

  // Icon adornments
  const getAdornments = () => {
    const adornments = {};
    
    if (startIcon) {
      adornments.startAdornment = (
        <InputAdornment position="start">
          {startIcon}
        </InputAdornment>
      );
    }
    
    if (endIcon) {
      adornments.endAdornment = (
        <InputAdornment position="end">
          {endIcon}
        </InputAdornment>
      );
    }
    
    return Object.keys(adornments).length > 0 ? { InputProps: adornments } : {};
  };

  const inputProps = {
    variant,
    size,
    fullWidth: true,
    ...getAdornments(),
    ...(touchOptimized ? getTouchOptimizedProps() : {}),
    ...(jamaican ? getJamaicanStyling() : {}),
    ...props,
  };

  return <MuiTextField {...inputProps} />;
};

/**
 * Standardized Select Component
 */
export const Select = ({
  options = [],
  multiple = false,
  touchOptimized = true,
  jamaican = false,
  renderValue,
  ...props
}) => {
  const { isMobile } = useResponsive();

  const getTouchOptimizedProps = () => {
    if (!touchOptimized) return {};
    
    return {
      MenuProps: {
        PaperProps: {
          sx: {
            '& .MuiMenuItem-root': {
              minHeight: { xs: 48, sm: 44 },
              fontSize: isMobile ? '1rem' : undefined,
            },
          },
        },
      },
    };
  };

  const defaultRenderValue = (selected) => {
    if (multiple && Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => (
            <Chip key={value} label={value} size="small" />
          ))}
        </Box>
      );
    }
    return selected;
  };

  return (
    <Input
      select
      touchOptimized={touchOptimized}
      jamaican={jamaican}
      SelectProps={{
        multiple,
        renderValue: renderValue || (multiple ? defaultRenderValue : undefined),
        ...(touchOptimized ? getTouchOptimizedProps() : {}),
      }}
      {...props}
    >
      {options.map((option) => (
        <MenuItem 
          key={option.value || option} 
          value={option.value || option}
          sx={{
            minHeight: touchOptimized ? { xs: 48, sm: 44 } : undefined,
          }}
        >
          {option.label || option}
        </MenuItem>
      ))}
    </Input>
  );
};

/**
 * Specialized Input variants for common use cases
 */
export const SearchInput = (props) => (
  <Input
    placeholder="Search..."
    touchOptimized
    jamaican
    {...props}
  />
);

export const PasswordInput = (props) => (
  <Input
    type="password"
    touchOptimized
    {...props}
  />
);

export const EmailInput = (props) => (
  <Input
    type="email"
    touchOptimized
    {...props}
  />
);

export const PhoneInput = (props) => (
  <Input
    type="tel"
    touchOptimized
    {...props}
  />
);

export const NumberInput = (props) => (
  <Input
    type="number"
    touchOptimized
    {...props}
  />
);

export const TextArea = (props) => (
  <Input
    multiline
    rows={4}
    touchOptimized
    {...props}
  />
);

export default Input;
