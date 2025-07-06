import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  List as ListIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ProfileEditModal from '../profile/ProfileEditModal';

const WelcomeHeader = ({ userType = 'jobseeker' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  
  const quickActions = userType === 'jobseeker' ? [
    { label: 'Search Jobs', icon: SearchIcon, path: '/jobs' },
    { label: 'Complete Profile', icon: PersonIcon, action: () => setProfileModalOpen(true) },
    { label: 'View Applications', icon: ListIcon, path: '/applications' }
  ] : [
    { label: 'Post New Job', icon: AddIcon, path: '/employer/post-job' },
    { label: 'Review Applications', icon: PersonIcon, path: '/employer/applications' },
    { label: 'Manage Jobs', icon: WorkIcon, path: '/employer/jobs' }
  ];

  return (
    <Card sx={{ 
      mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white' 
    }}>
      <CardContent sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {greeting}, {user?.firstName || 'User'}!
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {userType === 'jobseeker' 
                ? 'Ready to find your next opportunity?' 
                : 'Manage your hiring process efficiently'
              }
            </Typography>
          </Box>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outlined"
                startIcon={<action.icon />}
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Box>
      </CardContent>
      
      {userType === 'jobseeker' && (
        <ProfileEditModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onSave={() => {
            setProfileModalOpen(false);
          }}
        />
      )}
    </Card>
  );
};

export default WelcomeHeader;
