import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  MenuItem,
  IconButton,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(10, 10, 10, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
    opacity: 0.3,
    zIndex: 0,
  },
}));

// Industry templates
const industryTemplates = {
  'Technology': {
    descriptions: [
      'We are seeking a talented professional to join our innovative technology team. This role offers the opportunity to work on cutting-edge projects in a dynamic environment.',
      'Join our tech team and be part of Jamaica\'s digital transformation. We\'re looking for someone passionate about technology who can help drive our mission forward.',
      'Our company is at the forefront of technological innovation in Jamaica. We\'re seeking a skilled individual to contribute to our growing team.'
    ],
    responsibilities: [
      'Develop and maintain software applications',
      'Collaborate with cross-functional teams',
      'Debug and troubleshoot technical issues',
      'Implement new features and functionality',
      'Participate in code reviews and technical discussions',
      'Write clean, maintainable, and efficient code',
      'Stay updated with the latest industry trends'
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Experience with modern programming languages',
      'Strong problem-solving skills',
      'Excellent communication abilities',
      'Ability to work in a team environment',
      'Knowledge of software development methodologies'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Flexible working hours',
      'Professional development opportunities',
      'Modern office environment',
      'Team building activities',
      'Performance bonuses'
    ]
  },
  // Add other industry templates from the backup file
};

const JobDescriptionBuilder = ({ initialData, onSave }) => {
  const [industry, setIndustry] = useState('Technology');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      if (initialData.responsibilities) {
        try {
          if (typeof initialData.responsibilities === 'string') {
            setResponsibilities(JSON.parse(initialData.responsibilities));
          } else if (Array.isArray(initialData.responsibilities)) {
            setResponsibilities(initialData.responsibilities);
          }
        } catch (e) {
          setResponsibilities(initialData.responsibilities.split('\n').filter(item => item.trim()));
        }
      }
      // Similar parsing for requirements and benefits
    }
  }, [initialData]);

  useEffect(() => {
    generatePreview();
  }, [description, responsibilities, requirements, benefits]);

  const handleIndustryChange = (e) => {
    setIndustry(e.target.value);
  };

  const applyTemplate = () => {
    const template = industryTemplates[industry] || industryTemplates['Other'];
    const randomIndex = Math.floor(Math.random() * template.descriptions.length);
    setDescription(template.descriptions[randomIndex]);
    setResponsibilities([...template.responsibilities]);
    setRequirements([...template.requirements]);
    setBenefits([...template.benefits]);
  };

  const shuffleDescription = () => {
    const template = industryTemplates[industry] || industryTemplates['Other'];
    const randomIndex = Math.floor(Math.random() * template.descriptions.length);
    setDescription(template.descriptions[randomIndex]);
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const generatePreview = () => {
    let previewText = description + '\n\n';
    
    if (responsibilities.length > 0) {
      previewText += 'Responsibilities:\n';
      responsibilities.forEach(resp => {
        previewText += `• ${resp}\n`;
      });
      previewText += '\n';
    }
    
    if (requirements.length > 0) {
      previewText += 'Requirements:\n';
      requirements.forEach(req => {
        previewText += `• ${req}\n`;
      });
      previewText += '\n';
    }
    
    if (benefits.length > 0) {
      previewText += 'Benefits:\n';
      benefits.forEach(benefit => {
        previewText += `• ${benefit}\n`;
      });
    }
    
    setPreview(previewText);
  };

  const handleSave = () => {
    const formattedData = {
      description,
      responsibilities: JSON.stringify(responsibilities),
      requirements: JSON.stringify(requirements),
      benefits: JSON.stringify(benefits),
      formattedDescription: preview
    };
    
    if (onSave && typeof onSave === 'function') {
      onSave(formattedData);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <StyledTextField
              select
              label="Industry Template"
              value={industry}
              onChange={handleIndustryChange}
              sx={{ minWidth: 200 }}
            >
              {Object.keys(industryTemplates).map((ind) => (
                <MenuItem key={ind} value={ind}>
                  {ind}
                </MenuItem>
              ))}
            </StyledTextField>
            
            <Button
              variant="contained"
              onClick={applyTemplate}
              startIcon={<AutoFixHighIcon />}
              sx={{
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                }
              }}
            >
              Apply Template
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Job Description Builder
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700' }}>
                Description
              </Typography>
              <IconButton 
                onClick={shuffleDescription}
                size="small"
                sx={{ color: '#FFD700' }}
              >
                <ShuffleIcon />
              </IconButton>
            </Box>
            <StyledTextField
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description or use a template"
            />
          </Box>
          
          {/* Responsibilities Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
              Responsibilities
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <StyledTextField
                fullWidth
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add a responsibility"
                onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
              />
              <IconButton 
                onClick={addResponsibility}
                sx={{ ml: 1, color: '#FFD700' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {responsibilities.map((resp, index) => (
                <Chip 
                  key={index}
                  label={resp}
                  onDelete={() => removeResponsibility(index)}
                  sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Requirements Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
              Requirements
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <StyledTextField
                fullWidth
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              />
              <IconButton 
                onClick={addRequirement}
                sx={{ ml: 1, color: '#FFD700' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {requirements.map((req, index) => (
                <Chip 
                  key={index}
                  label={req}
                  onDelete={() => removeRequirement(index)}
                  sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Benefits Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
              Benefits
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <StyledTextField
                fullWidth
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit"
                onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
              />
              <IconButton 
                onClick={addBenefit}
                sx={{ ml: 1, color: '#FFD700' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {benefits.map((benefit, index) => (
                <Chip 
                  key={index}
                  label={benefit}
                  onDelete={() => removeBenefit(index)}
                  sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>
        
        {/* Preview Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
              Preview
            </Typography>
            <StyledPaper>
              <Typography 
                variant="body1" 
                component="pre"
                sx={{ 
                  color: 'white', 
                  whiteSpace: 'pre-line',
                  fontFamily: 'inherit'
                }}
              >
                {preview}
              </Typography>
            </StyledPaper>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  }
                }}
              >
                Use This Description
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDescriptionBuilder;
