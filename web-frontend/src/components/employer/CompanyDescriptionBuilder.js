import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const DESCRIPTION_TEMPLATES = [
  {
    id: 'standard',
    name: 'Standard Company Description',
    template: '{companyName} is a {companyAge} {industry} company based in {location}. We specialize in {specialties} and are committed to {mission}. With a team of {teamSize}, we pride ourselves on {values}.'
  },
  {
    id: 'mission',
    name: 'Mission-Focused Description',
    template: 'At {companyName}, our mission is {mission}. Founded in {founded}, we have been {industry} leaders in {location} for {companyAge}. We are dedicated to {values} while delivering exceptional {specialties}.'
  },
  {
    id: 'brief',
    name: 'Brief Introduction',
    template: '{companyName} ({founded}) is a {industry} company providing {specialties} solutions. Based in {location}, our team of {teamSize} is driven by {values}.'
  },
  {
    id: 'custom',
    name: 'Custom Template',
    template: ''
  }
];

const INDUSTRY_OPTIONS = [
  'Tourism & Hospitality', 'Agriculture & Farming', 'Financial Services', 
  'Bauxite & Mining', 'Information Technology', 'Manufacturing', 
  'Retail & Distribution', 'Construction', 'Education', 'Healthcare', 
  'Entertainment & Music', 'Transportation & Logistics', 'Energy', 
  'Food & Beverage', 'Telecommunications'
];

const COMPANY_SIZE_OPTIONS = [
  'Startup (1-10 employees)',
  'Small (11-50 employees)',
  'Medium (51-200 employees)',
  'Large (201-500 employees)',
  'Enterprise (500+ employees)'
];

const COMPANY_VALUES = [
  'Innovation', 'Quality', 'Integrity', 'Customer Satisfaction', 
  'Sustainability', 'Diversity', 'Excellence', 'Teamwork', 
  'Accountability', 'Creativity', 'Reliability', 'Transparency'
];

const JAMAICAN_SPECIALTIES = [
  'Sustainable Tourism', 'Eco-Tourism', 'All-Inclusive Resorts', 'Boutique Hospitality',
  'Organic Farming', 'Coffee Production', 'Rum Distillation', 'Spice Production',
  'Microfinance Services', 'Digital Banking', 'Investment Management',
  'Bauxite Processing', 'Mineral Extraction', 'Environmental Remediation',
  'Software Development', 'Digital Content Creation', 'IT Consulting', 'App Development',
  'Textile Manufacturing', 'Food Processing', 'Craft Production', 'Furniture Making',
  'Import/Export', 'Wholesale Distribution', 'Retail Chains', 'E-commerce',
  'Commercial Construction', 'Residential Development', 'Infrastructure Projects',
  'Private Education', 'Vocational Training', 'Educational Technology',
  'Medical Services', 'Pharmaceutical Distribution', 'Wellness Programs',
  'Music Production', 'Event Management', 'Film Production', 'Cultural Festivals',
  'Logistics Services', 'Fleet Management', 'Shipping Services', 'Courier Services',
  'Renewable Energy', 'Solar Installation', 'Energy Efficiency Consulting',
  'Restaurant Chains', 'Catering Services', 'Specialty Food Production',
  'Mobile Services', 'Broadband Provision', 'Telecommunications Infrastructure'
];

const CompanyDescriptionBuilder = ({ initialDescription = '', onSave }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(DESCRIPTION_TEMPLATES[0]);
  const [customTemplate, setCustomTemplate] = useState('');
  const [templateFields, setTemplateFields] = useState({
    companyName: '',
    industry: '',
    location: '',
    founded: '',
    companyAge: '',
    teamSize: '',
    specialties: '',
    mission: '',
    values: ''
  });
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [generatedDescription, setGeneratedDescription] = useState(initialDescription);

  // Parse initial description to populate fields if possible
  React.useEffect(() => {
    if (initialDescription) {
      setGeneratedDescription(initialDescription);
      
      // Try to extract some basic info from the description
      // This is a simple implementation - in a real app, you might use more sophisticated parsing
      const extractCompanyName = /([A-Z][a-zA-Z0-9\s]+) is a/;
      const extractIndustry = /in the ([a-zA-Z\s]+) industry/;
      const extractLocation = /based in ([a-zA-Z\s,]+)/;
      
      const nameMatch = initialDescription.match(extractCompanyName);
      const industryMatch = initialDescription.match(extractIndustry);
      const locationMatch = initialDescription.match(extractLocation);
      
      const updatedFields = { ...templateFields };
      
      if (nameMatch) updatedFields.companyName = nameMatch[1].trim();
      if (industryMatch) updatedFields.industry = industryMatch[1].trim();
      if (locationMatch) updatedFields.location = locationMatch[1].trim();
      
      setTemplateFields(updatedFields);
    }
  }, [initialDescription]);

  const handleTemplateChange = (event) => {
    const selected = DESCRIPTION_TEMPLATES.find(template => template.id === event.target.value);
    setSelectedTemplate(selected);
    
    if (selected.id === 'custom') {
      setCustomTemplate(customTemplate || 'Write about {companyName} in {location} specializing in {specialties}.');
    }
  };

  const handleFieldChange = (field, value) => {
    setTemplateFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleValueSelect = (value) => {
    if (!selectedValues.includes(value)) {
      setSelectedValues([...selectedValues, value]);
      
      // Update the values field
      const valuesString = [...selectedValues, value].join(', ');
      handleFieldChange('values', valuesString);
    }
  };

  const handleValueRemove = (valueToRemove) => {
    const updatedValues = selectedValues.filter(value => value !== valueToRemove);
    setSelectedValues(updatedValues);
    
    // Update the values field
    const valuesString = updatedValues.join(', ');
    handleFieldChange('values', valuesString);
  };
  
  const handleSpecialtySelect = (specialty) => {
    if (!selectedSpecialties.includes(specialty)) {
      const updatedSpecialties = [...selectedSpecialties, specialty];
      setSelectedSpecialties(updatedSpecialties);
      
      // Update the specialties field
      const specialtiesString = updatedSpecialties.join(', ');
      handleFieldChange('specialties', specialtiesString);
    }
  };

  const handleSpecialtyRemove = (specialtyToRemove) => {
    const updatedSpecialties = selectedSpecialties.filter(specialty => specialty !== specialtyToRemove);
    setSelectedSpecialties(updatedSpecialties);
    
    // Update the specialties field
    const specialtiesString = updatedSpecialties.join(', ');
    handleFieldChange('specialties', specialtiesString);
  };

  const generateDescription = () => {
    let template = selectedTemplate.id === 'custom' 
      ? customTemplate 
      : selectedTemplate.template;
    
    // Replace all placeholders with actual values
    Object.keys(templateFields).forEach(key => {
      const placeholder = `{${key}}`;
      if (template.includes(placeholder)) {
        template = template.replace(placeholder, templateFields[key] || `[${key}]`);
      }
    });
    
    setGeneratedDescription(template);
  };

  const handleSave = () => {
    if (onSave && typeof onSave === 'function') {
      onSave(generatedDescription);
    }
  };

  const calculateCompanyAge = () => {
    if (templateFields.founded && !isNaN(templateFields.founded)) {
      const foundedYear = parseInt(templateFields.founded);
      const currentYear = new Date().getFullYear();
      const age = currentYear - foundedYear;
      
      let ageDescription = '';
      if (age <= 1) {
        ageDescription = 'newly established';
      } else if (age <= 5) {
        ageDescription = 'young';
      } else if (age <= 10) {
        ageDescription = `${age}-year-old`;
      } else if (age <= 25) {
        ageDescription = 'established';
      } else {
        ageDescription = 'well-established';
      }
      
      handleFieldChange('companyAge', ageDescription);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ 
        p: 3, 
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
      }}>
        <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center' }}>
          Company Description Builder
          <Tooltip title="This tool helps you create a professional company description by filling in a few key details.">
            <IconButton size="small" sx={{ ml: 1, color: 'rgba(255, 215, 0, 0.7)' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
            }}>
              <InputLabel>Description Template</InputLabel>
              <Select
                value={selectedTemplate.id}
                onChange={handleTemplateChange}
                label="Description Template"
              >
                {DESCRIPTION_TEMPLATES.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {selectedTemplate.id === 'custom' && (
            <Grid item xs={12}>
              <TextField
                label="Custom Template"
                fullWidth
                multiline
                rows={3}
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                helperText="Use {placeholders} like {companyName}, {industry}, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
                  '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' },
                }}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 2 }}>
              Fill in the details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company Name"
              fullWidth
              value={templateFields.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
            }}>
              <InputLabel>Industry</InputLabel>
              <Select
                value={templateFields.industry}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                label="Industry"
              >
                {INDUSTRY_OPTIONS.map(industry => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              fullWidth
              value={templateFields.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="e.g., Kingston, Jamaica"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Founded Year"
              fullWidth
              type="number"
              value={templateFields.founded}
              onChange={(e) => {
                handleFieldChange('founded', e.target.value);
                // We'll calculate the company age after a short delay
                setTimeout(calculateCompanyAge, 500);
              }}
              placeholder="e.g., 2010"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
            }}>
              <InputLabel>Company Size</InputLabel>
              <Select
                value={templateFields.teamSize}
                onChange={(e) => handleFieldChange('teamSize', e.target.value)}
                label="Company Size"
              >
                {COMPANY_SIZE_OPTIONS.map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
              Company Specialties
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedSpecialties.map(specialty => (
                <Chip
                  key={specialty}
                  label={specialty}
                  onDelete={() => handleSpecialtyRemove(specialty)}
                  sx={{
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: '#FFFFFF',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { color: '#FFFFFF' }
                    }
                  }}
                />
              ))}
              {selectedSpecialties.length === 0 && (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  No specialties selected
                </Typography>
              )}
            </Box>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto', mb: 2, pr: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {JAMAICAN_SPECIALTIES.filter(specialty => !selectedSpecialties.includes(specialty)).map(specialty => (
                  <Chip
                    key={specialty}
                    label={specialty}
                    onClick={() => handleSpecialtySelect(specialty)}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Mission Statement"
              fullWidth
              value={templateFields.mission}
              onChange={(e) => handleFieldChange('mission', e.target.value)}
              placeholder="e.g., providing innovative solutions that empower businesses"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 215, 0, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
              Company Values
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedValues.map(value => (
                <Chip
                  key={value}
                  label={value}
                  onDelete={() => handleValueRemove(value)}
                  sx={{
                    backgroundColor: 'rgba(44, 85, 48, 0.7)',
                    color: '#FFFFFF',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { color: '#FFFFFF' }
                    }
                  }}
                />
              ))}
              {selectedValues.length === 0 && (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  No values selected
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COMPANY_VALUES.filter(value => !selectedValues.includes(value)).map(value => (
                <Chip
                  key={value}
                  label={value}
                  onClick={() => handleValueSelect(value)}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                onClick={generateDescription}
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: '#2C5530',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#1E3D23',
                  }
                }}
              >
                Generate Description
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 215, 0, 0.2)' }} />
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
              Generated Description
            </Typography>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              minHeight: '100px'
            }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {generatedDescription || 'Your description will appear here after you generate it.'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#E6C200',
                  }
                }}
              >
                Use This Description
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyDescriptionBuilder;
