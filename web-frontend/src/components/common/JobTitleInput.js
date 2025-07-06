import React, { useState, useEffect } from 'react';
import { 
  Autocomplete, 
  TextField, 
  InputAdornment, 
  Box, 
  Typography 
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

// Common job titles and roles
const commonJobTitles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'UI Designer',
  'Content Writer',
  'Account Manager',
  'HR Manager',
  'Financial Analyst',
  'Operations Manager',
  'Customer Success Manager',
  // Jamaican-specific job titles
  'Tourism Officer',
  'Hospitality Manager',
  'Agricultural Specialist',
  'Cultural Events Coordinator',
  'Reggae Music Producer',
  'Cruise Ship Liaison',
  'Resort Staff Manager',
  'Jamaican Cuisine Chef',
  'Tour Guide',
  'Craft Artisan'
];

/**
 * A Material-UI based job title autocomplete component
 * Allows users to search for job titles with autocomplete suggestions
 */
export const JobTitleInput = ({ value, onChange, sx }) => {
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    // Initialize input value from prop
    if (value) {
      setInputValue(value);
    }
  }, []);

  return (
    <Autocomplete
      freeSolo
      options={commonJobTitles}
      value={value}
      inputValue={inputValue}
      isOptionEqualToValue={(option, value) => option === value}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        onChange(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Job Title or Keyword"
          placeholder="Search for job titles..."
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <WorkIcon sx={{ color: '#FFD700' }} />
              </InputAdornment>
            ),
            sx: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
                borderWidth: '2px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.8)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFD700',
                borderWidth: '2px'
              }
            }
          }}
          InputLabelProps={{
            sx: { color: '#FFD700', fontWeight: 500 }
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Typography sx={{ color: 'white', fontWeight: 500 }}>
            {option}
          </Typography>
        </Box>
      )}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          '& .MuiAutocomplete-option': {
            '&:hover': {
              backgroundColor: 'rgba(44, 85, 48, 0.2)'
            },
            '&[aria-selected="true"]': {
              backgroundColor: 'rgba(44, 85, 48, 0.4)'
            }
          }
        }
      }}
      sx={sx}
    />
  );
};

export default JobTitleInput;
