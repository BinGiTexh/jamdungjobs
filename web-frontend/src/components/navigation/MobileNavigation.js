import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  useTheme,
  Avatar,
  Typography,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MobileNavigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const EmployerMenu = () => (
    <>
      <ListItem button onClick={() => handleNavigate('/employer/dashboard')}>
        <ListItemIcon>
          <DashboardIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>

      <ListItem button onClick={() => setJobsOpen(!jobsOpen)}>
        <ListItemIcon>
          <WorkIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Jobs" />
        {jobsOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={jobsOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            button 
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/employer/jobs/active')}
          >
            <ListItemText primary="Active Jobs" />
          </ListItem>
          <ListItem 
            button 
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/employer/jobs/drafts')}
          >
            <ListItemText primary="Drafts" />
          </ListItem>
          <ListItem 
            button 
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/employer/jobs/closed')}
          >
            <ListItemText primary="Closed Jobs" />
          </ListItem>
        </List>
      </Collapse>

      <ListItem button onClick={() => handleNavigate('/employer/applications')}>
        <ListItemIcon>
          <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Applications" />
      </ListItem>

      <ListItem button onClick={() => handleNavigate('/employer/profile')}>
        <ListItemIcon>
          <BusinessIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Company Profile" />
      </ListItem>
    </>
  );

  const CandidateMenu = () => (
    <>
      <ListItem button onClick={() => handleNavigate('/jobs')}>
        <ListItemIcon>
          <WorkIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Browse Jobs" />
      </ListItem>

      <ListItem button onClick={() => handleNavigate('/saved-jobs')}>
        <ListItemIcon>
          <BookmarkIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="Saved Jobs" />
      </ListItem>

      <ListItem button onClick={() => handleNavigate('/applications')}>
        <ListItemIcon>
          <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="My Applications" />
      </ListItem>

      <ListItem button onClick={() => handleNavigate('/profile')}>
        <ListItemIcon>
          <PeopleIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItem>
    </>
  );

  return (
    <>
      <Box 
        sx={{ 
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: theme.zIndex.appBar
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            JamDung Jobs
          </Typography>

          {user ? (
            <Avatar 
              src={user.avatar} 
              alt={user.name}
              sx={{ 
                width: 32, 
                height: 32,
                border: 2,
                borderColor: theme.palette.primary.main 
              }}
            />
          ) : (
            <Button 
              variant="contained" 
              size="small"
              onClick={() => handleNavigate('/login')}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 300,
            background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.primary.light})`
          }
        }}
      >
        {user && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={user.avatar} 
                alt={user.name}
                sx={{ 
                  width: 48, 
                  height: 48,
                  mr: 2,
                  border: 2,
                  borderColor: theme.palette.primary.main 
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </Box>
        )}

        <List>
          {user ? (
            user.role === 'EMPLOYER' ? (
              <EmployerMenu />
            ) : (
              <CandidateMenu />
            )
          ) : (
            <>
              <ListItem button onClick={() => handleNavigate('/jobs')}>
                <ListItemIcon>
                  <WorkIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Browse Jobs" />
              </ListItem>
              <ListItem button onClick={() => handleNavigate('/register')}>
                <ListItemIcon>
                  <PeopleIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>

        {user && (
          <>
            <Divider />
            <List>
              <ListItem 
                button 
                onClick={logout}
                sx={{
                  color: theme.palette.error.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.error.main
                  }
                }}
              >
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </>
        )}
      </Drawer>
    </>
  );
};

export default MobileNavigation;
