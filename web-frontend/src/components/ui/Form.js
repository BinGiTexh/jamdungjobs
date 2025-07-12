import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  useTheme as useMuiTheme
} from '@mui/material';
import Button from './Button';
import Typography from './Typography';

/**
 * Standardized Form Component
 * Consistent form handling, validation, and submission patterns
 */
const Form = ({
  children,
  onSubmit,
  loading = false,
  error,
  success,
  title,
  subtitle,
  submitLabel = 'Submit',
  resetLabel = 'Reset',
  showReset = false,
  validation = {},
  touchOptimized = true,
  jamaican = false,
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const [_errors, setErrors] = useState({});
  const [_touched, setTouched] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (onSubmit) {
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      
      // Basic validation
      const validationErrors = validateForm(data);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length === 0) {
        await onSubmit(data, event);
      }
    }
  };

  const handleReset = () => {
    setErrors({});
    setTouched({});
  };

  const validateForm = (data) => {
    const errors = {};
    
    Object.entries(validation).forEach(([field, rules]) => {
      const value = data[field];
      
      if (rules.required && (!value || value.trim() === '')) {
        errors[field] = `${field} is required`;
      } else if (rules.email && value && !isValidEmail(value)) {
        errors[field] = 'Please enter a valid email address';
      } else if (rules.minLength && value && value.length < rules.minLength) {
        errors[field] = `Must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        errors[field] = `Must be no more than ${rules.maxLength} characters`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = rules.message || 'Invalid format';
      }
    });
    
    return errors;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onReset={handleReset}
      sx={{
        width: '100%',
        ...(touchOptimized && {
          '& .MuiFormControl-root': {
            mb: muiTheme.spacing(3)
          },
          '& .MuiTextField-root': {
            '& .MuiOutlinedInput-root': {
              minHeight: { xs: 48, sm: 44 } // Touch-friendly
            }
          }
        }),
        ...props.sx
      }}
      {...props}
    >
      {/* Form Header */}
      {(title || subtitle) && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {title && (
            <Typography
              variant="h4"
              component="h1"
              jamaican={jamaican}
              sx={{ mb: subtitle ? 2 : 0 }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: muiTheme.spacing(1)
          }}
        >
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: muiTheme.spacing(1)
          }}
        >
          {success}
        </Alert>
      )}

      {/* Form Fields */}
      <Box sx={{ mb: 4 }}>
        {children}
      </Box>

      {/* Form Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end'
        }}
      >
        {showReset && (
          <Button
            type="reset"
            variant="outlined"
            disabled={loading}
            touchOptimized={touchOptimized}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            {resetLabel}
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          loading={loading}
          jamaican={jamaican}
          touchOptimized={touchOptimized}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
};

/**
 * Form Field wrapper with consistent error handling
 */
export const FormField = ({
  children,
  label,
  error,
  helperText,
  required = false,
  touchOptimized = true,
  ...props
}) => {
  const muiTheme = useMuiTheme();

  return (
    <FormControl 
      fullWidth 
      error={!!error}
      sx={{
        mb: muiTheme.spacing(touchOptimized ? 3 : 2)
      }}
      {...props}
    >
      {label && (
        <FormLabel 
          required={required}
          sx={{
            mb: 1,
            fontWeight: 600,
            color: 'text.primary',
            '&.Mui-focused': {
              color: 'primary.main'
            }
          }}
        >
          {label}
        </FormLabel>
      )}
      {children}
      {(error || helperText) && (
        <FormHelperText sx={{ mt: 1 }}>
          {error || helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

/**
 * Specialized Form variants for common use cases
 */
export const LoginForm = (props) => (
  <Form
    title="Welcome Back"
    subtitle="Sign in to your account"
    submitLabel="Sign In"
    jamaican
    touchOptimized
    validation={{
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    }}
    {...props}
  />
);

export const RegistrationForm = (props) => (
  <Form
    title="Join JamDung Jobs"
    subtitle="Create your account to get started"
    submitLabel="Create Account"
    jamaican
    touchOptimized
    validation={{
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      password: { required: true, minLength: 8 }
    }}
    {...props}
  />
);

export const JobApplicationForm = (props) => (
  <Form
    title="Apply for Position"
    submitLabel="Submit Application"
    showReset
    touchOptimized
    validation={{
      coverLetter: { required: true, minLength: 100 },
      phone: { required: true }
    }}
    {...props}
  />
);

export const ContactForm = (props) => (
  <Form
    title="Get in Touch"
    subtitle="We'd love to hear from you"
    submitLabel="Send Message"
    touchOptimized
    validation={{
      name: { required: true },
      email: { required: true, email: true },
      message: { required: true, minLength: 10 }
    }}
    {...props}
  />
);

export default Form;
