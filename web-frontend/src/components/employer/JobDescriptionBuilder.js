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

// Industry-specific templates
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
  'Healthcare': {
    descriptions: [
      'Join our healthcare team dedicated to improving the health and wellbeing of Jamaicans. We\'re looking for compassionate professionals committed to excellence in patient care.',
      'Our healthcare facility is seeking dedicated professionals to provide quality care to our patients. This role offers the opportunity to make a meaningful difference in people\'s lives.',
      'Be part of Jamaica\'s leading healthcare provider. We\'re looking for skilled individuals who are passionate about delivering exceptional patient care.'
    ],
    responsibilities: [
      'Provide patient care according to established protocols',
      'Maintain accurate medical records',
      'Collaborate with interdisciplinary healthcare teams',
      'Administer medications and treatments as prescribed',
      'Educate patients and families about health conditions',
      'Monitor patient progress and report changes in condition',
      'Adhere to all safety and infection control protocols'
    ],
    requirements: [
      'Degree in Nursing, Medicine, or related healthcare field',
      'Valid professional license or certification',
      'Experience in healthcare settings',
      'Strong communication skills',
      'Ability to work under pressure',
      'Compassionate and patient-centered approach',
      'Knowledge of medical terminology and procedures'
    ],
    benefits: [
      'Competitive salary',
      'Health and dental insurance',
      'Continuing education support',
      'Professional development opportunities',
      'Flexible scheduling options',
      'Employee wellness program',
      'Recognition programs'
    ]
  },
  'Hospitality': {
    descriptions: [
      'Join our team in showcasing the best of Jamaican hospitality. We\'re looking for enthusiastic individuals who are passionate about creating memorable experiences for our guests.',
      'Our hospitality establishment is seeking dedicated professionals to deliver exceptional service. This role offers the opportunity to work in one of Jamaica\'s premier destinations.',
      'Be part of Jamaica\'s renowned hospitality industry. We\'re looking for service-oriented individuals who can help us maintain our reputation for excellence.'
    ],
    responsibilities: [
      'Provide exceptional customer service to guests',
      'Maintain a clean and welcoming environment',
      'Process reservations and check-ins/check-outs',
      'Address guest inquiries and resolve issues promptly',
      'Promote hotel services and amenities',
      'Ensure compliance with safety and security procedures',
      'Collaborate with other departments to enhance guest experience'
    ],
    requirements: [
      'Previous experience in hospitality or customer service',
      'Excellent communication and interpersonal skills',
      'Ability to work flexible hours including weekends and holidays',
      'Professional appearance and demeanor',
      'Problem-solving abilities',
      'Knowledge of local attractions and culture',
      'Proficiency in hospitality management systems'
    ],
    benefits: [
      'Competitive salary and service charge',
      'Health insurance',
      'Meals during shifts',
      'Employee discounts on accommodations',
      'Career advancement opportunities',
      'Training and development programs',
      'Employee recognition programs'
    ]
  },
  'Finance': {
    descriptions: [
      'Join our financial services team and contribute to Jamaica\'s economic growth. We\'re looking for detail-oriented professionals with strong analytical skills.',
      'Our financial institution is seeking skilled professionals to support our clients\' financial needs. This role offers the opportunity to work in a dynamic and evolving industry.',
      'Be part of Jamaica\'s financial sector. We\'re looking for talented individuals who can help our clients achieve their financial goals.'
    ],
    responsibilities: [
      'Analyze financial data and prepare reports',
      'Process financial transactions accurately',
      'Maintain compliance with financial regulations',
      'Provide financial advice and guidance to clients',
      'Develop and implement financial strategies',
      'Monitor market trends and economic indicators',
      'Collaborate with team members on financial projects'
    ],
    requirements: [
      'Degree in Finance, Accounting, Economics, or related field',
      'Professional certification (e.g., CPA, CFA) preferred',
      'Experience in financial services or related industry',
      'Strong analytical and mathematical skills',
      'Attention to detail and accuracy',
      'Proficiency in financial software and MS Excel',
      'Knowledge of financial regulations and compliance'
    ],
    benefits: [
      'Competitive salary and performance bonuses',
      'Health and life insurance',
      'Retirement savings plan',
      'Professional development support',
      'Career advancement opportunities',
      'Employee banking benefits',
      'Work-life balance initiatives'
    ]
  },
  'Education': {
    descriptions: [
      'Join our educational institution dedicated to shaping the future of Jamaica. We\'re looking for passionate educators committed to student success.',
      'Our school is seeking dedicated professionals to inspire and educate the next generation. This role offers the opportunity to make a lasting impact on students\' lives.',
      'Be part of Jamaica\'s educational community. We\'re looking for innovative educators who can help our students reach their full potential.'
    ],
    responsibilities: [
      'Develop and implement engaging lesson plans',
      'Assess student progress and provide feedback',
      'Create a positive and inclusive learning environment',
      'Communicate with parents and guardians',
      'Participate in staff meetings and professional development',
      'Maintain accurate records of student performance',
      'Adapt teaching methods to meet diverse student needs'
    ],
    requirements: [
      'Degree in Education or relevant subject area',
      'Teaching certification or license',
      'Experience in educational settings',
      'Strong communication and presentation skills',
      'Patience and adaptability',
      'Knowledge of curriculum development',
      'Ability to inspire and motivate students'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Pension plan',
      'Professional development opportunities',
      'School holidays',
      'Supportive work environment',
      'Opportunity to make a difference in students\' lives'
    ]
  },
  'Other': {
    descriptions: [
      'Join our dynamic team and contribute to our company\'s success. We\'re looking for motivated professionals who can bring fresh ideas and energy to our organization.',
      'Our company is seeking talented individuals to support our growing business. This role offers the opportunity to develop your skills in a supportive environment.',
      'Be part of our diverse and inclusive workplace. We\'re looking for dedicated professionals who share our values and commitment to excellence.'
    ],
    responsibilities: [
      'Perform tasks related to core business functions',
      'Collaborate with team members to achieve goals',
      'Maintain high standards of quality and service',
      'Identify opportunities for improvement',
      'Communicate effectively with stakeholders',
      'Adhere to company policies and procedures',
      'Contribute to a positive work environment'
    ],
    requirements: [
      'Relevant education or experience',
      'Strong communication skills',
      'Ability to work independently and in teams',
      'Problem-solving abilities',
      'Attention to detail',
      'Time management skills',
      'Commitment to professional development'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Paid time off',
      'Professional development opportunities',
      'Supportive work environment',
      'Employee recognition programs',
      'Work-life balance'
    ]
  }
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
      
      // Parse responsibilities, requirements, and benefits if they exist
      if (initialData.responsibilities) {
        try {
          // Try to parse as JSON if it's a string
          if (typeof initialData.responsibilities === 'string') {
            setResponsibilities(JSON.parse(initialData.responsibilities));
          } else if (Array.isArray(initialData.responsibilities)) {
            setResponsibilities(initialData.responsibilities);
          }
        } catch (e) {
          // If it's not valid JSON, split by new lines
          setResponsibilities(initialData.responsibilities.split('\n').filter(item => item.trim()));
        }
      }
      
      if (initialData.requirements) {
        try {
          if (typeof initialData.requirements === 'string') {
            setRequirements(JSON.parse(initialData.requirements));
          } else if (Array.isArray(initialData.requirements)) {
            setRequirements(initialData.requirements);
          }
        } catch (e) {
          setRequirements(initialData.requirements.split('\n').filter(item => item.trim()));
        }
      }
      
      if (initialData.benefits) {
        try {
          if (typeof initialData.benefits === 'string') {
            setBenefits(JSON.parse(initialData.benefits));
          } else if (Array.isArray(initialData.benefits)) {
            setBenefits(initialData.benefits);
          }
        } catch (e) {
          setBenefits(initialData.benefits.split('\n').filter(item => item.trim()));
        }
      }
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
    
    // Get a random description from the template
    const randomIndex = Math.floor(Math.random() * template.descriptions.length);
    setDescription(template.descriptions[randomIndex]);
    
    // Set template responsibilities, requirements, and benefits
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
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={resp}
                    onDelete={() => removeResponsibility(index)}
                    sx={{ 
                      backgroundColor: 'rgba(44, 85, 48, 0.7)',
                      color: 'white',
                      flexGrow: 1,
                      justifyContent: 'space-between',
                      height: 'auto',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        padding: '8px 12px',
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          
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
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={req}
                    onDelete={() => removeRequirement(index)}
                    sx={{ 
                      backgroundColor: 'rgba(44, 85, 48, 0.7)',
                      color: 'white',
                      flexGrow: 1,
                      justifyContent: 'space-between',
                      height: 'auto',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        padding: '8px 12px',
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          
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
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={benefit}
                    onDelete={() => removeBenefit(index)}
                    sx={{ 
                      backgroundColor: 'rgba(44, 85, 48, 0.7)',
                      color: 'white',
                      flexGrow: 1,
                      justifyContent: 'space-between',
                      height: 'auto',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        padding: '8px 12px',
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Preview
          </Typography>
          
          <StyledPaper>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
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
            </Box>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDescriptionBuilder;
