import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  styled,
  Chip,
  Avatar
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const PreviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#FFFFFF',
  color: '#000000',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  minHeight: '800px',
  position: 'relative'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#2C5530',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  borderBottom: '2px solid #FFD700',
  paddingBottom: theme.spacing(0.5)
}));

const ResumePreview = ({ resumeData }) => {
  const { personalInfo, education, workExperience, skills, achievements } = resumeData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <PreviewPaper>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          {personalInfo.photoUrl && (
            <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar 
                src={personalInfo.photoUrl} 
                alt={personalInfo.fullName || 'Profile Photo'}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  border: '2px solid #2C5530',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            </Grid>
          )}
          
          <Grid item xs={12} sm={personalInfo.photoUrl ? 9 : 12} sx={{ textAlign: personalInfo.photoUrl ? 'left' : 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#2C5530' }}>
              {personalInfo.fullName || 'Your Name'}
            </Typography>
            
            {personalInfo.title && (
              <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                {personalInfo.title}
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          {personalInfo.email && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ fontSize: 18, mr: 0.5, color: '#2C5530' }} />
              <Typography variant="body2">{personalInfo.email}</Typography>
            </Box>
          )}
          
          {personalInfo.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ fontSize: 18, mr: 0.5, color: '#2C5530' }} />
              <Typography variant="body2">{personalInfo.phone}</Typography>
            </Box>
          )}
          
          {personalInfo.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ fontSize: 18, mr: 0.5, color: '#2C5530' }} />
              <Typography variant="body2">{personalInfo.location}</Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Summary */}
      {personalInfo.summary && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Professional Summary</SectionTitle>
          <Typography variant="body1" sx={{ textAlign: 'justify' }}>
            {personalInfo.summary}
          </Typography>
        </Box>
      )}
      
      {/* Work Experience */}
      {workExperience.length > 0 && workExperience[0].company && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Work Experience</SectionTitle>
          
          {workExperience.map((exp, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container>
                <Grid item xs={8}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {exp.position || 'Position'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>
                    {exp.company || 'Company'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    {formatDate(exp.startDate)} - {exp.present ? 'Present' : formatDate(exp.endDate)}
                  </Typography>
                  {exp.location && (
                    <Typography variant="body2" sx={{ color: '#777' }}>
                      {exp.location}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              {exp.description && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'justify' }}>
                  {exp.description}
                </Typography>
              )}
              
              {index < workExperience.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Education */}
      {education.length > 0 && education[0].institution && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Education</SectionTitle>
          
          {education.map((edu, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container>
                <Grid item xs={8}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {edu.qualification || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#555' }}>
                    {edu.institution || 'Institution'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    {formatDate(edu.startDate)} - {edu.present ? 'Present' : formatDate(edu.endDate)}
                  </Typography>
                </Grid>
              </Grid>
              
              {edu.description && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'justify' }}>
                  {edu.description}
                </Typography>
              )}
              
              {index < education.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Skills */}
      {skills.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Skills</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: 'rgba(44, 85, 48, 0.1)',
                  color: '#2C5530',
                  border: '1px solid rgba(44, 85, 48, 0.3)'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Achievements */}
      {achievements.length > 0 && achievements[0].title && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle variant="h6">Achievements & Certifications</SectionTitle>
          
          {achievements.map((achievement, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {achievement.title}
              </Typography>
              
              {achievement.description && (
                <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                  {achievement.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Typography variant="caption" sx={{ color: '#777' }}>
          Created with JamDung Jobs Resume Builder
        </Typography>
      </Box>
    </PreviewPaper>
  );
};

export default ResumePreview;
