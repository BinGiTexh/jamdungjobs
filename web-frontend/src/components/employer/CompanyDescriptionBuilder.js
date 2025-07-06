import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

// Styled components
const SectionField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(1),
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

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  '.MuiFormControlLabel-label': {
    color: '#FFD700',
    fontWeight: 600
  },
  '.MuiRadio-root': {
    color: 'rgba(255, 215, 0, 0.7)',
    '&.Mui-checked': {
      color: '#FFD700'
    }
  }
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  overflowY: 'auto',
  backgroundColor: '#0A0A0A',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 215, 0, 0.2)'
}));

const TEMPLATE_SECTIONS = {
  Generic: {
    about: 'We are a leading company in our industry committed to excellence.',
    mission: '- Provide outstanding products and services.\n- Foster a culture of innovation.\n- Empower our team to thrive.',
    culture: 'Our workplace is collaborative, inclusive, and growth-oriented.',
    numbers: '- **Founded:** 20XX\n- **Employees:** 50+\n- **Locations:** 2',
    cta: 'Join us and be part of our exciting journey!'
  },
  'Tech Startup': {
    about: 'Founded by passionate technologists, we are disrupting the status quo with groundbreaking solutions.',
    mission: '- Innovate rapidly.\n- Deliver customer-centric products.\n- Scale sustainably.',
    culture: 'Fast-paced, data-driven, and remote-friendly environment where creativity shines.',
    numbers: '- **Founded:** 2023\n- **Employees:** 15\n- **Funding:** Seed-round backed',
    cta: 'If you love solving complex problems at scale, let’s build the future together.'
  },
  Hospitality: {
    about: 'We provide unforgettable guest experiences through warm Jamaican hospitality.',
    mission: '- Deliver world-class service.\n- Celebrate local culture.\n- Sustain our community.',
    culture: 'Our team values respect, teamwork, and genuine care for guests.',
    numbers: '- **Founded:** 1998\n- **Properties:** 3 resorts\n- **Employees:** 200+',
    cta: 'Come create lasting memories with us — one guest at a time.'
  }
};

const compileMarkdown = (sections) => {
  const { about, mission, culture, numbers, cta } = sections;
  return `### About Us\n${about}\n\n### Mission & Values\n${mission}\n\n### Culture & Perks\n${culture}\n\n### Key Numbers\n${numbers}\n\n### Why Join Us\n${cta}`;
};

const CompanyDescriptionBuilder = ({ value, onChange }) => {
  const [template, setTemplate] = useState('Generic');
  const [sections, setSections] = useState(TEMPLATE_SECTIONS['Generic']);

  // On mount or external value change, derive sections if possible
  useEffect(() => {
    if (!value) return;
    // Do not parse markdown back to sections; keep current sections if user edited after load
  }, [value]);

  // Update parent whenever sections mutate
  useEffect(() => {
    const markdown = compileMarkdown(sections);
    onChange(markdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const handleTemplateChange = (e) => {
    const selected = e.target.value;
    setTemplate(selected);
    setSections(TEMPLATE_SECTIONS[selected]);
  };

  const handleSectionChange = (key, newVal) => {
    setSections((prev) => ({ ...prev, [key]: newVal }));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, color: '#FFD700', fontWeight: 600 }}>
            Choose a template
          </Typography>
          <RadioGroup row value={template} onChange={handleTemplateChange}>
            {Object.keys(TEMPLATE_SECTIONS).map((tpl) => (
              <StyledFormControlLabel key={tpl} value={tpl} control={<Radio />} label={tpl} />
            ))}
          </RadioGroup>
          <Divider sx={{ my: 2 }} />
          {Object.entries(sections).map(([key, text]) => (
            <Accordion key={key} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />} sx={{ backgroundColor: 'rgba(255, 215, 0, 0.05)' }}>
                <Typography sx={{ textTransform: 'capitalize', color: '#FFD700', fontWeight: 600 }}>
                  {key}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SectionField
                  multiline
                  fullWidth
                  minRows={key === 'mission' || key === 'numbers' ? 4 : 3}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={text}
                  onChange={(e) => handleSectionChange(key, e.target.value)}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" sx={{ mb: 1, color: '#FFD700', fontWeight: 600 }}>
          Live Preview
        </Typography>
        <PreviewContainer variant="outlined">
          <ReactMarkdown>{compileMarkdown(sections)}</ReactMarkdown>
        </PreviewContainer>
      </Grid>
    </Grid>
  );
};

CompanyDescriptionBuilder.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

CompanyDescriptionBuilder.defaultProps = {
  value: ''
};

export default CompanyDescriptionBuilder;
