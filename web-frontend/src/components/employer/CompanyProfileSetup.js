import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { JamaicaLocationAutocomplete } from '../common/JamaicaLocationAutocomplete';
import api from '../../utils/axiosConfig';
import { logError } from '../../utils/loggingUtils';
import CompanyDescriptionBuilder from './CompanyDescriptionBuilder';

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)'
  }
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  border: '2px dashed rgba(255, 215, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    border: '2px dashed #FFD700',
    '& .MuiBox-root': {
      opacity: 1
    }
  }
}));

const UploadOverlay = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out'
}));

// Utility function to safely format location values
const formatLocationValue = (location) => {
  if (!location) {
    return null;
  }

  try {
    // If it's already a properly formatted object, return it
    if (location.mainText && location.name) {
      return location;
    }

    // Handle string input
    const locationStr = typeof location === 'string' ? location.trim() : '';
    if (!locationStr) {
      return null;
    }

    // Parse the location string
    const parts = locationStr.split(',').map(part => part.trim()).filter(Boolean);
    if (!parts.length) {
      return null;
    }

    return {
      mainText: parts[0],
      secondaryText: parts.length > 1 ? parts.slice(1).join(', ') : 'Jamaica',
      name: parts[0],
      parish: parts.length > 1 ? parts[1] : 'Jamaica',
      formattedAddress: parts.join(', ')
    };
  } catch (error) {
    console.error('Error formatting location:', error);
    return null;
  }
};

const CompanyProfileSetup = ({
  open,
  onClose,
  initialData = null,
  onSave,
  loading: externalLoading = false,
  error: externalError = null,
  success: externalSuccess = false
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName ?? initialData?.name ?? '',
    industry: initialData?.industry || '',
    location: typeof initialData?.location === 'string' ? initialData.location : '',
    website: initialData?.website || '',
    description: initialData?.description || '',
    logoUrl: initialData?.logoUrl || null,
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({
    type: null,
    text: null
  });
  const [logoPreview, setLogoPreview] = useState(initialData?.logoUrl || null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({
    logo: false
  });

  // Predefined list of industries for dropdown
  const INDUSTRY_OPTIONS = [
    'Technology',
    'Manufacturing',
    'Construction',
    'Healthcare',
    'Finance',
    'Education',
    'Hospitality',
    'Retail',
    'Transportation',
    'Agriculture',
    'Telecommunications',
    'Energy',
    'Media',
    'Real Estate',
    'Government',
    'Legal',
    'Non-Profit',
    'Entertainment',
    'Sports',
    'Other'
  ];

  // Clear validation errors when dialog closes
  useEffect(() => {
    if (!open) {
      setValidationErrors({});
      setError(null);
      setMessage({ type: null, text: null });
    }
  }, [open]);

  // Handle external success/error states
  useEffect(() => {
    if (externalError) {
      setMessage({
        type: 'error',
        text: externalError
      });
    } else if (externalSuccess) {
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    }
  }, [externalError, externalSuccess]);

  // Initialize form with data if editing, or empty if creating new
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName ?? initialData.name ?? '',
        industry: initialData.industry || '',
        location: typeof initialData.location === 'string' ? initialData.location : '',
        website: initialData.website || '',
        description: initialData.description || '',
        logoUrl: initialData.logoUrl || null,
        logo: null
      });
      setLogoPreview(initialData.logoUrl || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for the field being changed
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleLocationChange = (newLocation) => {
    try {
      // Handle null/empty case
      if (!newLocation) {
        setFormData(prev => ({ ...prev, location: '' }));
        return;
      }

      // Build location string with all components
      const locationParts = [
        newLocation.name || newLocation.mainText,
        newLocation.parish,
        'Jamaica'
      ].filter(Boolean);

      const locationString = locationParts.join(', ');
      
      console.warn('Setting location:', {
        newLocation,
        locationString
      });

      setFormData(prev => ({
        ...prev,
        location: locationString
      }));

      // Clear any validation errors
      if (validationErrors.location) {
        setValidationErrors(prev => ({
          ...prev,
          location: null
        }));
      }
    } catch (error) {
      console.error('Error handling location change:', error);
      setError('Invalid location format');
      setFormData(prev => ({ ...prev, location: '' }));
    }
  };

  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and GIF images are allowed';
    }
    if (file.size > maxSize) {
      return 'Image size should not exceed 5MB';
    }
    return null;
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setImageLoading(prev => ({ ...prev, [type]: true }));
      try {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onloadend = resolve;
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setLogoPreview(reader.result);
        setFormData(prev => ({ 
          ...prev, 
          logo: file,
          logoUrl: reader.result 
        }));
      } catch (err) {
        setError(`Failed to load ${type} image. Please try again.`);
      } finally {
        setImageLoading(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  const handleRemoveImage = () => {
    setLogoPreview(null);
    setFormData(prev => ({ 
      ...prev, 
      logo: null,
      logoUrl: null 
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (!formData.industry?.trim()) {
      errors.industry = 'Industry is required';
    }
    if (!formData.description?.trim()) {
      errors.description = 'Company description is required';
    }
    if (formData.website?.trim() && !formData.website.trim().match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      errors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }
    
    // Validate location
    try {
      if (!formData.location) {
        errors.location = 'Location is required';
      } else if (typeof formData.location !== 'string') {
        errors.location = 'Location must be a valid text value';
      } else if (!formData.location.trim()) {
        errors.location = 'Location cannot be empty';
      } else {
        // Validate the location format
        const formattedLocation = formatLocationValue(formData.location);
        if (!formattedLocation) {
          errors.location = 'Invalid location format';
        }
      }
    } catch (error) {
      console.error('Error validating location:', error);
      errors.location = 'Invalid location format';
    }
    
    // Validate logo file if present
    if (formData.logo instanceof File) {
      const validationError = validateImageFile(formData.logo);
      if (validationError) {
        errors.logo = validationError;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear any existing errors first
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Validate and format all text fields
      const sanitizedData = {
        companyName: formData.companyName?.trim() || '',
        industry: formData.industry?.trim() || '',
        location: typeof formData.location === 'string' ? formData.location.trim() : '',
        website: formData.website?.trim() || '',
        description: formData.description?.trim() || ''
      };
      
      // Append sanitized text fields
      Object.entries(sanitizedData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Handle logo file upload - ensure it's a valid File object
      if (formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }

      // Use PUT if we have initialData (updating), POST if new profile
      const method = initialData ? 'put' : 'post';
      const response = await api[method]('/api/employer/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        console.warn(response.data);
        // Extract company object from API response (supports both nested and flat)
        const company = response.data.data?.company || response.data.company || response.data;
        // Map the response data back to our form structure
        const mappedData = {
          companyName: company.name,
          industry: company.industry,
          location: company.location,
          website: company.website,
          description: company.description,
          logoUrl: company.logoUrl,
          logo: null
        };
        
        setFormData(mappedData);
        setLogoPreview(company.logoUrl);
        
        if (onSave) {
          // Pass only the company object upwards for simplicity
          onSave(company);
        }
        
        // Show success message
        setMessage({
          type: 'success',
          text: `Company profile ${initialData ? 'updated' : 'created'} successfully!`
        });
        
        // Close dialog after a brief delay to show success message
        const timer = setTimeout(() => {
          handleCancel();
        }, 1500);

        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      logError('Error updating company profile:', err);
      setError(err.response?.data?.message || 'Failed to update company profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName ?? initialData.name ?? '',
        industry: initialData.industry || '',
        location: typeof initialData.location === 'string' ? initialData.location : '',
        website: initialData.website || '',
        description: initialData.description || '',
        logoUrl: initialData.logoUrl || null,
        logo: null
      });
      setLogoPreview(initialData.logoUrl || null);
    } else {
      setFormData({
        companyName: '',
        industry: '',
        location: '',
        website: '',
        description: '',
        logoUrl: null,
        logo: null
      });
      setLogoPreview(null);
    }
    setError(null);
    setMessage({ type: null, text: null });
    setValidationErrors({});
    setImageLoading({ logo: false });
  }, [initialData]);

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Reset form when dialog opens with initial data
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          backgroundImage: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#FFD700',
        fontSize: '1.5rem',
        fontWeight: 600,
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        pb: 2
      }}>
        Company Profile Setup
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {message.type && (
          <Alert 
            severity={message.type}
            sx={{ mb: 3 }} 
            onClose={() => setMessage({ type: null, text: null })}
          >
            {message.text}
          </Alert>
        )}

        {error && !message.type && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <form id="company-profile-form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Company Logo
              </Typography>
              <ImagePreview>
                {logoPreview ? (
                  <>
                    <Box
                      component="img"
                      src={logoPreview}
                      alt="Company Logo"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <UploadOverlay>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <input
                          accept="image/*"
                          type="file"
                          id="logo-upload"
                          hidden
                          onChange={(e) => handleImageUpload(e, 'logo')}
                        />
                        <label htmlFor="logo-upload">
                          <IconButton 
                            component="span" 
                            sx={{ color: '#FFD700' }}
                            disabled={imageLoading.logo}
                          >
                            {imageLoading.logo ? (
                              <CircularProgress size={24} sx={{ color: '#FFD700' }} />
                            ) : (
                              <CloudUploadIcon />
                            )}
                          </IconButton>
                        </label>
                        <IconButton
                          onClick={() => handleRemoveImage()}
                          sx={{ color: '#FFD700' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </UploadOverlay>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <input
                      accept="image/*"
                      type="file"
                      id="logo-upload"
                      hidden
                      onChange={(e) => handleImageUpload(e, 'logo')}
                    />
                    <label htmlFor="logo-upload">
                      <IconButton component="span" sx={{ color: '#FFD700' }}>
                        <CloudUploadIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </label>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                      Upload Company Logo
                    </Typography>
                  </Box>
                )}
              </ImagePreview>
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                error={!!validationErrors.companyName}
                helperText={validationErrors.companyName}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                select
                fullWidth
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                error={!!validationErrors.industry}
                helperText={validationErrors.industry}
                InputLabelProps={{
                  shrink: true
                }}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </StyledTextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                error={!!validationErrors.website}
                helperText={validationErrors.website}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <JamaicaLocationAutocomplete
                value={formData.location ? formatLocationValue(formData.location) : null}
                onChange={handleLocationChange}
                error={!!validationErrors.location}
                helperText={validationErrors.location}
                placeholder="Select location"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#FFD700' }}>
                Company Description
              </Typography>
              <CompanyDescriptionBuilder
                value={formData.description}
                onChange={(md) =>
                  setFormData((prev) => ({ ...prev, description: md }))
                }
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(255, 215, 0, 0.1)',
        gap: 2 
      }}>
        <Button
          onClick={handleCancel}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="company-profile-form"
          variant="contained"
          disabled={loading || externalLoading}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#FFE44D'
            },
            '&:disabled': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
              color: 'rgba(0, 0, 0, 0.4)'
            }
          }}
        >
          {(loading || externalLoading) ? (
            <CircularProgress size={24} sx={{ color: '#000000' }} />
          ) : (
            'Save Profile'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CompanyProfileSetup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.bool
};



export default CompanyProfileSetup;
