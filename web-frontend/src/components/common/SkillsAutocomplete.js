import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';
import { buildApiUrl } from '../../config';

// Function to log only in development environment
const logDev = (level, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console[level](...args);
  }
};

// Common tech skills and frameworks
const commonSkills = [
  // Programming Languages
  'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go',
  // Frontend
  'React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'TypeScript', 'Next.js', 'Gatsby',
  // Backend
  'Node.js', 'Django', 'Ruby on Rails', 'Spring Boot', 'Express.js', 'FastAPI',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  // Mobile
  'React Native', 'Flutter', 'iOS', 'Android',
  // Other
  'Git', 'REST API', 'GraphQL', 'Machine Learning', 'AI', 'Data Science',
  // Soft Skills
  'Project Management', 'Team Leadership', 'Agile', 'Scrum', 'Communication',
  // Jamaican-specific skills
  'Caribbean Tourism', 'Hospitality Management', 'Jamaican Accounting Standards',
  'Jamaican Tax Law', 'Jamaican Business Law', 'Caribbean Marketing',
  'Patois', 'Cultural Tourism', 'Caribbean Cuisine', 'Reggae Production',
  'Jamaican Agriculture', 'Caribbean Logistics', 'Island Sustainability',
  'Tropical Agriculture', 'Caribbean Healthcare', 'Jamaican Education System'
];

export const SkillsAutocomplete = ({ value = [], onChange, label = 'Skills', placeholder = 'Add skills', multiple = true, freeSolo = true, required = false, helperText = '', error = false }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Fetch skills from API or use common skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        const response = await axios.get(buildApiUrl('/skills'));
        if (response.data && Array.isArray(response.data)) {
          setOptions(response.data.map(skill => typeof skill === 'string' ? skill : skill.name));
        }
      } catch (error) {
        // Fall back to common skills if API fails
        logDev('debug', 'Using default skills list');
        setOptions(commonSkills);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkills();
  }, []);
  
  // Filter options based on input
  const getFilteredOptions = () => {
    if (!inputValue) return options;
    
    return options.filter(option => {
      const skillName = typeof option === 'string' ? option : option.name;
      return skillName.toLowerCase().includes(inputValue.toLowerCase());
    });
  };
  
  // Calculate skill match score (for future use in job matching)
  const calculateSkillMatch = (jobSkills, userSkills) => {
    if (!jobSkills || !userSkills || jobSkills.length === 0 || userSkills.length === 0) {
      return 0;
    }
    
    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    return (matchedSkills.length / jobSkills.length) * 100;
  };

  return (
    <Autocomplete
      multiple={multiple}
      freeSolo={freeSolo}
      options={getFilteredOptions()}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} /> : <CodeIcon sx={{ mr: 1, color: '#FFD700' }} />}
                {params.InputProps.startAdornment}
              </>
            ),
            sx: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.8)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFD700',
                borderWidth: '2px',
              },
            }
          }}
          InputLabelProps={{
            sx: { color: '#FFD700', fontWeight: 500 },
          }}
          FormHelperTextProps={{
            sx: { color: 'rgba(255, 215, 0, 0.7)' }
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
            sx={{
              backgroundColor: 'rgba(44, 85, 48, 0.8)',
              color: '#FFD700',
              fontWeight: 500,
              border: '1px solid rgba(255, 215, 0, 0.5)',
              '& .MuiChip-deleteIcon': {
                color: '#FFD700',
                '&:hover': {
                  color: '#FFFFFF',
                },
              },
            }}
          />
        ))
      }
      renderOption={(props, option) => (
        <li {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ mr: 1, fontSize: 20, color: '#FFD700' }} />
            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{typeof option === 'string' ? option : option.name}</Typography>
          </Box>
        </li>
      )}
      PaperComponent={(props) => (
        <Paper 
          elevation={3} 
          {...props} 
          sx={{ 
            ...props.sx,
            borderRadius: 2,
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }} 
        />
      )}
      filterOptions={(options, params) => {
        const filtered = options.filter(option => {
          const skillName = typeof option === 'string' ? option : option.name;
          return skillName.toLowerCase().includes(params.inputValue.toLowerCase());
        });
        
        // Add the current input as an option if it's not in the list
        if (params.inputValue !== '' && freeSolo && !filtered.some(option => {
          const skillName = typeof option === 'string' ? option : option.name;
          return skillName.toLowerCase() === params.inputValue.toLowerCase();
        })) {
          filtered.push(params.inputValue);
        }
        
        return filtered;
      }}
    />
  );
};
