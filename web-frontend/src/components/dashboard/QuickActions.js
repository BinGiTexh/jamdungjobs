import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import ProfileEditModal from '../profile/ProfileEditModal';

const QuickActions = ({ userType = 'employer' }) => {
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const employerActions = [
    {
      icon: AddIcon,
      title: 'Post New Job',
      description: 'Create a new job posting',
      path: '/employer/jobs',
      color: 'primary'
    },
    {
      icon: PeopleIcon,
      title: 'Review Applications',
      description: 'Check new candidate applications',
      path: '/employer/applications',
      color: 'info'
    },
    {
      icon: WorkIcon,
      title: 'Manage Jobs',
      description: 'Edit or update existing jobs',
      path: '/employer/jobs',
      color: 'success'
    },
    {
      icon: AnalyticsIcon,
      title: 'View Analytics',
      description: 'Check hiring performance',
      path: '/employer/analytics',
      color: 'warning'
    },
    {
      icon: PaymentIcon,
      title: 'Billing & Plans',
      description: 'Manage subscription and payments',
      path: '/employer/billing',
      color: 'secondary'
    },
    {
      icon: SettingsIcon,
      title: 'Company Settings',
      description: 'Update company profile',
      path: '/employer/profile',
      color: 'default'
    }
  ];

  const jobseekerActions = [
    {
      icon: WorkIcon,
      title: 'Browse Jobs',
      description: 'Find new opportunities',
      path: '/jobs',
      color: 'primary'
    },
    {
      icon: PeopleIcon,
      title: 'My Applications',
      description: 'Track application status',
      path: '/applications',
      color: 'info'
    },
    {
      icon: SettingsIcon,
      title: 'Complete Profile',
      description: 'Complete your profile',
      action: () => setProfileModalOpen(true),
      color: 'success'
    },
    {
      icon: AnalyticsIcon,
      title: 'Career Insights',
      description: 'View profile analytics',
      path: '/insights',
      color: 'warning'
    }
  ];

  const actions = userType === 'employer' ? employerActions : jobseekerActions;

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Quick Actions"
        subheader="Common tasks and shortcuts"
      />
      <CardContent sx={{ p: 0 }}>
        <List>
          {actions.map((action, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton 
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <action.icon color={action.color} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {action.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {action.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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

export default QuickActions;
