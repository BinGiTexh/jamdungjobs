import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Slide,
  useScrollTrigger,
  Fab,
  Zoom
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Mobile-Optimized Navigation Component
 * Enhanced UX for mobile users with quick actions
 */
const MobileOptimizedNav = ({
  elevation = 1,
  showScrollToTop = true,
  showQuickActions = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  // Component state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationCount] = useState(3);

  // Scroll trigger for hiding/showing navbar
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100
  });

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { label: 'Home', icon: HomeIcon, path: '/' },
      { label: 'Find Jobs', icon: SearchIcon, path: '/jobs' }
    ];

    if (!isAuthenticated) {
      return [
        ...commonItems,
        { label: 'For Employers', icon: BusinessIcon, path: '/employers' },
        { label: 'Sign In', icon: PersonIcon, path: '/login' },
        { label: 'Register', icon: PersonIcon, path: '/register', variant: 'contained' }
      ];
    }

    if (currentUser?.role === 'EMPLOYER') {
      return [
        ...commonItems,
        { label: 'Post Job', icon: AddIcon, path: '/employer/post-job', highlight: true },
        { label: 'My Jobs', icon: WorkIcon, path: '/employer/jobs' },
        { label: 'Applications', icon: PersonIcon, path: '/employer/applications' },
        { label: 'Analytics', icon: BusinessIcon, path: '/employer/analytics' }
      ];
    }

    // Jobseeker items
    return [
      ...commonItems,
      { label: 'My Applications', icon: WorkIcon, path: '/applications' },
      { label: 'Saved Jobs', icon: WorkIcon, path: '/saved-jobs' },
      { label: 'Profile', icon: PersonIcon, path: '/profile' }
    ];
  };

  const navigationItems = getNavigationItems();

  // Handle menu actions
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Quick action for role-specific primary action
  const getQuickAction = () => {
    if (!isAuthenticated) {
      return {
        icon: PersonIcon,
        label: 'Sign Up',
        action: () => navigate('/register'),
        color: 'primary'
      };
    }

    if (currentUser?.role === 'EMPLOYER') {
      return {
        icon: AddIcon,
        label: 'Post Job',
        action: () => navigate('/employer/post-job'),
        color: 'secondary'
      };
    }

    return {
      icon: SearchIcon,
      label: 'Search',
      action: () => navigate('/jobs'),
      color: 'primary'
    };
  };

  const quickAction = getQuickAction();

  return (
    <>
      {/* Hide on scroll for mobile */}
      <Slide appear={false} direction="down" in={!trigger || !isMobile}>
        <AppBar
          position="fixed"
          elevation={elevation}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #009639, #FFD700)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                JamDung Jobs
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navigationItems.slice(0, -2).map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      startIcon={<IconComponent />}
                      onClick={() => navigate(item.path)}
                      variant={item.variant || (isActive ? 'contained' : 'text')}
                      color={item.highlight ? 'secondary' : 'primary'}
                      sx={{
                        mx: 0.5,
                        fontWeight: isActive ? 600 : 400,
                        ...(item.highlight && {
                          background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FFA000, #FF8F00)'
                          }
                        })
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* User Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications (authenticated users) */}
              {isAuthenticated && (
                <IconButton
                  onClick={() => navigate('/notifications')}
                  sx={{ color: 'text.primary' }}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}

              {/* User Menu (authenticated) */}
              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ p: 0.5 }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                      <ListItemIcon><SettingsIcon /></ListItemIcon>
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon /></ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                /* Login/Register buttons for desktop */
                !isMobile && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="text"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                    >
                      Register
                    </Button>
                  </Box>
                )
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={handleMobileMenuToggle}
                  sx={{ color: 'text.primary' }}
                >
                  {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu
            </Typography>
            <IconButton onClick={handleMobileMenuToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* User Info (if authenticated) */}
          {isAuthenticated && currentUser && (
            <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
                  {currentUser.firstName?.[0] || currentUser.email?.[0] || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {currentUser.firstName || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {currentUser.role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <List>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <ListItem
                  key={item.path}
                  button
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Floating Action Button for Quick Actions */}
      {showQuickActions && isMobile && (
        <Zoom in={!mobileMenuOpen}>
          <Fab
            color={quickAction.color}
            aria-label={quickAction.label}
            onClick={quickAction.action}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <quickAction.icon />
          </Fab>
        </Zoom>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Zoom in={trigger}>
          <Fab
            color="primary"
            size="small"
            aria-label="scroll back to top"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: showQuickActions && isMobile ? 80 : 16,
              right: 16,
              zIndex: 999
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Zoom>
      )}

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default MobileOptimizedNav;
