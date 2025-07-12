import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive, TOUCH_TARGETS } from '../../utils/responsive';
import { useNotifications } from '../../context/NotificationContext';
import { IconButton } from './Button';
import Typography from './Typography';

/**
 * Standardized Navigation Component
 * Ensures consistent header behavior across all pages
 */
const Navigation = ({
  brand = 'JamDung Jobs',
  brandIcon = '🇯🇲',
  user = null,
  menuItems = [],
  actions = [],
  elevation = 4,
  position = 'sticky',
  onMenuClick,
  onUserClick,
  onLogout,
  ...props
}) => {
  const navigate = useNavigate();
  const { isDarkMode, jamaicanColors } = useTheme();
  const { isMobile } = useResponsive();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Get responsive drawer configuration
  const __drawerConfig = {
    width: isMobile ? 280 : 320,
    itemHeight: TOUCH_TARGETS.RECOMMENDED
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    setDrawerOpen(false);
    navigate('/');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    if (onMenuClick) onMenuClick(!drawerOpen);
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick();
    } else if (user) {
      // Default behavior: navigate to profile
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <AppBar
        position={position}
        elevation={elevation}
        sx={{
          background: isDarkMode 
            ? `linear-gradient(135deg, ${jamaicanColors.darkGreen} 0%, ${jamaicanColors.goldDark} 100%)`
            : `linear-gradient(135deg, ${jamaicanColors.green} 0%, ${jamaicanColors.gold} 100%)`,
          boxShadow: isDarkMode 
            ? '0 2px 10px rgba(0,0,0,0.3)' 
            : '0 2px 10px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          '& .MuiToolbar-root': {
            minHeight: { xs: 64, sm: 72 },
            px: { xs: 2, sm: 3 }
          },
          ...props.sx
        }}
        {...props}
      >
        <Toolbar>
          {/* Menu Button */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            touchOptimized
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>

          {/* Brand - Clickable to go home */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              ml: 2,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9,
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => navigate('/')}
            role="button"
            aria-label="Go to homepage"
          >
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                background: 'linear-gradient(45deg, #FFFFFF, #FFEB3B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em'
              }}
            >
              {brand}
            </Typography>
            <Typography 
              variant="caption"
              sx={{
                ml: 1,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.8)',
                fontStyle: 'italic',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {brandIcon}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions.map((action, index) => (
              <Box key={index}>{action}</Box>
            ))}
            
            {/* Notifications Bell - Only for logged in employers */}
            {user && user.role === 'EMPLOYER' && (
              <IconButton
                color="inherit"
                onClick={() => {
                  // Mark all notifications as read when bell is clicked
                  if (markAllAsRead) {
                    markAllAsRead();
                  }
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#FF6B6B',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 24, color: 'white' }} />
                </Badge>
              </IconButton>
            )}
            
            {/* User Avatar/Login Button */}
            <IconButton
              color="inherit"
              onClick={handleUserClick}
              touchOptimized
            >
              {user ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem'
                  }}
                >
                  {user.name?.charAt(0) || user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </Avatar>
              ) : (
                <Typography sx={{ 
                  px: 2, 
                  py: 0.5, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Sign In
                </Typography>
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 280,
            background: '#1A1A1A',
            color: '#FFD700',
            backdropFilter: 'blur(10px)',
            borderRight: '2px solid #FFD700'
          }
        }}
      >
        {/* User Info */}
        {user && (
          <Box sx={{ p: 3, bgcolor: '#2A2A2A', color: '#FFD700', borderBottom: '1px solid #FFD700' }}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  bgcolor: '#FFD700',
                  color: '#1A1A1A',
                  fontWeight: 'bold'
                }}
              >
                {user.name?.charAt(0) || user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFD700' }}>
                  {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Menu Items */}
        <List sx={{ pt: user ? 0 : 2 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 1.5,
                minHeight: 48,
                color: '#FFD700',
                '&:hover': {
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                  '& .MuiListItemIcon-root': {
                    color: '#FFD700'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: '#FFD700', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#FFD700'
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Footer Actions */}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: 'rgba(255, 215, 0, 0.2)' }} />
          {user ? (
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                py: 1.5,
                minHeight: 48,
                color: '#FF6B6B',
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                  color: '#FF5252'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#FF6B6B', minWidth: 40 }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Sign Out"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#FF6B6B'
                }}
              />
            </ListItem>
          ) : (
            <>
              <ListItem
                button
                onClick={() => handleNavigation('/login')}
                sx={{ 
                  py: 1.5, 
                  minHeight: 48,
                  color: '#FFD700',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#FFD700' }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign In"
                  primaryTypographyProps={{
                    color: '#FFD700'
                  }}
                />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation('/register')}
                sx={{ 
                  py: 1.5, 
                  minHeight: 48,
                  color: '#FFD700',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#FFD700' }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Register"
                  primaryTypographyProps={{
                    color: '#FFD700'
                  }}
                />
              </ListItem>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

/**
 * Specialized Navigation variants
 */
export const AppNavigation = (props) => (
  <Navigation
    brand="JamDung Jobs"
    brandIcon="🇯🇲"
    position="sticky"
    elevation={4}
    {...props}
  />
);

export const SimpleNavigation = (props) => (
  <Navigation
    elevation={1}
    position="static"
    {...props}
  />
);

export default Navigation;
