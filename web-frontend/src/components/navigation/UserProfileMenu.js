import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleClose();
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    return role === 'EMPLOYER' ? '#007E1B' : '#FFD700';
  };

  const getRoleLabel = (role) => {
    return role === 'EMPLOYER' ? 'Employer' : 'Job Seeker';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Notifications Icon */}
      <IconButton
        size="small"
        sx={{ 
          color: 'text.primary',
          '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
        }}
      >
        <Badge badgeContent={0} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* User Profile Button */}
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          ml: 1,
          '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
        }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={user.candidateProfile?.photoUrl || user.employerProfile?.logoUrl}
            alt={`${user.firstName} ${user.lastName}`}
            sx={{
              width: 32,
              height: 32,
              bgcolor: getRoleColor(user.role),
              color: user.role === 'EMPLOYER' ? 'white' : 'black',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          
          {/* Show name on larger screens */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                lineHeight: 1.2
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Chip
              label={getRoleLabel(user.role)}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.65rem',
                backgroundColor: `${getRoleColor(user.role)}20`,
                color: getRoleColor(user.role),
                fontWeight: 600,
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          </Box>
        </Box>
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 220,
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderBottom: 'none',
              borderRight: 'none'
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255, 215, 0, 0.1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={getRoleLabel(user.role)}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${getRoleColor(user.role)}20`,
                color: getRoleColor(user.role),
                fontWeight: 600
              }}
            />
          </Box>
        </Box>

        {/* Menu Items */}
        <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" sx={{ color: '#FFD700' }} />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: '#007E1B' }} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        {user.role === 'JOBSEEKER' && (
          <MenuItem onClick={() => handleMenuItemClick('/applications')}>
            <ListItemIcon>
              <WorkIcon fontSize="small" sx={{ color: '#009921' }} />
            </ListItemIcon>
            <ListItemText>My Applications</ListItemText>
          </MenuItem>
        )}

        {user.role === 'EMPLOYER' && (
          <MenuItem onClick={() => handleMenuItemClick('/employer/jobs')}>
            <ListItemIcon>
              <WorkIcon fontSize="small" sx={{ color: '#009921' }} />
            </ListItemIcon>
            <ListItemText>My Jobs</ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ borderColor: 'rgba(255, 215, 0, 0.1)' }} />

        <MenuItem onClick={() => handleMenuItemClick('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#ff6b6b' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#ff6b6b' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfileMenu;
