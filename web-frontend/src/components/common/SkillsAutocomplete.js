import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../utils/axiosConfig';

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
    backgroundColor: theme.palette.mode === 'dark' ? '#2D2D2D' : '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 107, 47, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(0, 107, 47, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? '#FFD700' : '#006B2F'
    }
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.7)' : 'rgba(0, 107, 47, 0.7)'
  },
  '& .MuiChip-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 107, 47, 0.1)',
    color: theme.palette.mode === 'dark' ? '#FFD700' : '#006B2F',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 107, 47, 0.3)'}`,
    '& .MuiChip-deleteIcon': {
      color: theme.palette.mode === 'dark' ? '#FFD700' : '#006B2F',
      '&:hover': {
        color: theme.palette.mode === 'dark' ? '#FFF' : '#004D21'
      }
    }
  }
}));

export const SkillsAutocomplete = ({ 
  value = [], 
  onChange, 
  placeholder = "Select your skills...",
  maxTags = 10,
  error = false,
  helperText = "",
  required = false,
  ...props 
}) => {
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/skills');
        if (response.data && response.data.success) {
          setSkillsOptions(response.data.data || []);
        } else {
          // Fallback skills if API fails
          setSkillsOptions([
            'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'CSS', 'HTML',
            'SQL', 'Git', 'Project Management', 'Communication', 'Leadership',
            'Customer Service', 'Digital Marketing', 'Graphic Design'
          ]);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback skills if API fails
        setSkillsOptions([
          'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'CSS', 'HTML',
          'SQL', 'Git', 'Project Management', 'Communication', 'Leadership',
          'Customer Service', 'Digital Marketing', 'Graphic Design'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Handle value changes
  const handleChange = (event, newValue) => {
    // Limit the number of selected skills
    if (newValue.length <= maxTags) {
      onChange(newValue);
    }
  };

  // Convert array to ensure compatibility with different data formats
  const normalizedValue = Array.isArray(value) ? value : 
    (typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <StyledAutocomplete
      multiple
      options={skillsOptions}
      value={normalizedValue}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      filterSelectedOptions
      loading={loading}
      limitTags={5}
      disableCloseOnSelect
      getOptionLabel={(option) => option}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Skills"
          placeholder={normalizedValue.length === 0 ? placeholder : "Add more skills..."}
          error={error}
          helperText={
            helperText || 
            (normalizedValue.length >= maxTags ? `Maximum ${maxTags} skills allowed` : 
             `${normalizedValue.length}/${maxTags} skills selected`)
          }
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} sx={{ color: '#FFD700' }} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
            key={option}
            size="small"
          />
        ))
      }
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...otherProps}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              },
              '&[aria-selected="true"]': {
                backgroundColor: 'rgba(0, 107, 47, 0.1)',
                color: '#006B2F'
              }
            }}
          >
            {option}
          </Box>
        );
      }}
      {...props}
    />
  );
};

export default SkillsAutocomplete;