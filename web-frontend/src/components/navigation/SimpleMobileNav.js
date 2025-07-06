import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';
import { AppNavigation } from '../ui/Navigation';
import ThemeToggle from '../common/ThemeToggle';

const SimpleMobileNav = () => {
  const { user, logout } = useAuth();

  // Define menu items based on user role
  const menuItems = user ? (
    user.role === 'EMPLOYER' ? [
      { text: 'Dashboard', icon: <HomeIcon />, path: '/employer/dashboard' },
      { text: 'My Jobs', icon: <WorkIcon />, path: '/employer/jobs' },
      { text: 'Applications', icon: <PersonIcon />, path: '/employer/applications' },
      { text: 'Profile', icon: <BusinessIcon />, path: '/employer/profile' }
    ] : [
      { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
      { text: 'Find Jobs', icon: <WorkIcon />, path: '/jobs' },
      { text: 'My Applications', icon: <PersonIcon />, path: '/applications' }
    ]
  ) : [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Find Jobs', icon: <WorkIcon />, path: '/jobs' },
    { text: 'For Employers', icon: <BusinessIcon />, path: '/register?role=employer' }
  ];

  return (
    <AppNavigation
      user={user}
      menuItems={menuItems}
      actions={[<ThemeToggle key="theme-toggle" size="medium" />]}
      onLogout={logout}
    />
  );
};

export default SimpleMobileNav;
