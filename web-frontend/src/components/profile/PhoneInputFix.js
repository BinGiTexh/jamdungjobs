import React, { useState, useCallback, memo } from 'react';
import { TextField } from '@mui/material';

// Memoized phone input component to prevent unnecessary re-renders
export const PhoneInputFixed = memo(({ 
  value, 
  onChange, 
  label = 'Phone Number',
  name = 'phone',
  ...props 
}) => {
  // Use local state to manage input value for smoother typing
  const [localValue, setLocalValue] = useState(value || '');
  
  // Update local value when prop value changes
  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  // Handle input changes with debouncing to parent
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce the parent update to prevent focus issues
    if (onChange) {
      // Use setTimeout to defer the parent update
      setTimeout(() => {
        onChange(e);
      }, 0);
    }
  }, [onChange]);
  
  return (
    <TextField
      {...props}
      label={label}
      name={name}
      value={localValue}
      onChange={handleChange}
      type="tel"
      autoComplete="tel"
      // Prevent iOS zoom on focus
      inputProps={{
        ...props.inputProps,
        style: {
          fontSize: '16px', // Prevents zoom on iOS
          ...props.inputProps?.style
        }
      }}
      // Add key to prevent remounting
      key={`phone-input-${name}`}
    />
  );
});

PhoneInputFixed.displayName = 'PhoneInputFixed';

// Alternative solution using uncontrolled component
export const PhoneInputUncontrolled = ({ 
  defaultValue, 
  onBlur,
  label = 'Phone Number',
  name = 'phone',
  ...props 
}) => {
  const handleBlur = useCallback((e) => {
    if (onBlur) {
      onBlur(e);
    }
  }, [onBlur]);
  
  return (
    <TextField
      {...props}
      label={label}
      name={name}
      defaultValue={defaultValue}
      onBlur={handleBlur}
      type="tel"
      autoComplete="tel"
      inputProps={{
        ...props.inputProps,
        style: {
          fontSize: '16px',
          ...props.inputProps?.style
        }
      }}
    />
  );
};

// Usage examples:
/*
// Controlled with fix:
<PhoneInputFixed
  value={formData.phone}
  onChange={(e) => handleInputChange('phone', e.target.value)}
  fullWidth
  sx={textFieldSx}
/>

// Uncontrolled alternative:
<PhoneInputUncontrolled
  defaultValue={formData.phone}
  onBlur={(e) => handleInputChange('phone', e.target.value)}
  fullWidth
  sx={textFieldSx}
/>
*/
