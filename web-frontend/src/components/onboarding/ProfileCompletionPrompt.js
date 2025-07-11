import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Collapse
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Person as PersonIcon,
  Description as ResumeIcon,
  Work as SkillsIcon,
  School as EducationIcon,
  Business as ExperienceIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { calculateProfileCompletion } from '../../utils/profileCompletion';

const ProgressCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  '&.completed': {
    borderColor: 'rgba(0, 150, 57, 0.4)',
    background: 'linear-gradient(135deg, #2D3D2D 0%, #1A2A1A 100%)'
  }
}));

const StyledLinearProgress = styled(LinearProgress)(() => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #FFD700, #009639)',
    borderRadius: 4
  }
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 16px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
  },
  transition: 'all 0.2s ease'
}));

const ProfileCompletionPrompt = ({ profileData, onComplete }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('profile_completion_dismissed') === 'true';
  });

  const completionData = calculateProfileCompletion(profileData);
  const isComplete = completionData.percentage >= 80;

  // Auto-dismiss if profile is complete
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Don't show if dismissed or complete
  if (dismissed || isComplete) {
    return null;
  }

  const completionItems = [
    {
      id: 'basicInfo',
      label: 'Basic Information',
      description: 'Name, email, phone number',
      icon: <PersonIcon />,
      completed: completionData.completedFields.includes('Basic Information'),
      action: () => navigate('/profile')
    },
    {
      id: 'resume',
      label: 'Resume Upload',
      description: 'Upload your CV or resume',
      icon: <ResumeIcon />,
      completed: completionData.completedFields.includes('Resume Upload'),
      action: () => navigate('/profile')
    },
    {
      id: 'skills',
      label: 'Skills',
      description: 'Add your key skills and expertise',
      icon: <SkillsIcon />,
      completed: completionData.completedFields.includes('Skills'),
      action: () => navigate('/profile')
    },
    {
      id: 'education',
      label: 'Education',
      description: 'Educational background and qualifications',
      icon: <EducationIcon />,
      completed: completionData.completedFields.includes('Education'),
      action: () => navigate('/profile')
    },
    {
      id: 'experience',
      label: 'Work Experience',
      description: 'Previous work experience and achievements',
      icon: <ExperienceIcon />,
      completed: completionData.completedFields.includes('Work Experience'),
      action: () => navigate('/profile')
    }
  ];

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage to persist across sessions
    localStorage.setItem('profile_completion_dismissed', 'true');
  };


  return (
    <ProgressCard className={isComplete ? 'completed' : ''}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {completionData.percentage}% Complete
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <StyledLinearProgress 
            variant="determinate" 
            value={completionData.percentage} 
            aria-label={`Profile completion: ${completionData.percentage}%`}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
          A complete profile increases your chances of getting hired by up to 5x!
        </Typography>

        {completionData.missingFields.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              mb: 2
            }}
          >
            Complete these sections: {completionData.missingFields.join(', ')}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ActionButton
            onClick={() => navigate('/profile')}
            size="small"
          >
            Complete Profile
          </ActionButton>
          
          <Button
            variant="text"
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {expanded ? 'Show Less' : 'Show Details'}
          </Button>
          
          <Button
            variant="text"
            size="small"
            onClick={handleDismiss}
            sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 'auto' }}
          >
            Dismiss
          </Button>
        </Box>

        <Collapse in={expanded}>
          <List sx={{ mt: 2 }}>
            {completionItems.map((item) => (
              <ListItem
                key={item.id}
                button
                onClick={item.action}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.05)'
                  }
                }}
              >
                <ListItemIcon>
                  {item.completed ? (
                    <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  )}
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {React.cloneElement(item.icon, { 
                    sx: { color: item.completed ? '#4CAF50' : '#FFD700' } 
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: item.completed ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      {item.description}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </ProgressCard>
  );
};

export default ProfileCompletionPrompt;