/**
 * Location Permission Component
 * User-friendly prompts and permission handling for GPS features
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Collapse
} from '@mui/material';
import {
  LocationOn,
  Security,
  Speed,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  Settings
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';

const LocationPermission = ({
  open,
  onClose,
  onAllow,
  onDeny,
  permissionState = 'prompt', // 'prompt', 'granted', 'denied'
  showBenefits = true,
  showInstructions = true
}) => {
  const { jamaicanColors } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const benefits = [
    {
      icon: LocationOn,
      title: 'Find Jobs Near You',
      description: 'See jobs within walking distance or a short commute',
      color: jamaicanColors.green
    },
    {
      icon: Speed,
      title: 'Save Time',
      description: 'No need to manually enter your location every time',
      color: '#2196F3'
    },
    {
      icon: TrendingUp,
      title: 'Better Matches',
      description: 'Get personalized job recommendations based on your area',
      color: '#FF9800'
    },
    {
      icon: Security,
      title: 'Privacy Protected',
      description: 'Your location is only used to find nearby jobs, never shared',
      color: '#9C27B0'
    }
  ];

  const permissionSteps = [
    'Click "Allow" when browser asks for location',
    'Your browser will request permission',
    'We\'ll find jobs near your location'
  ];

  const browserInstructions = {
    chrome: [
      'Click the location icon in the address bar',
      'Select "Always allow" for this site',
      'Refresh the page if needed'
    ],
    firefox: [
      'Click the shield icon in the address bar',
      'Select "Allow Location Access"',
      'Choose "Remember this decision"'
    ],
    safari: [
      'Go to Safari > Preferences > Websites',
      'Select "Location" from the left sidebar',
      'Set JamDung Jobs to "Allow"'
    ],
    edge: [
      'Click the location icon in the address bar',
      'Select "Allow" for this site',
      'Refresh if the permission doesn\'t take effect'
    ]
  };

  /**
   * Handle allow location
   */
  const handleAllow = () => {
    setActiveStep(1);
    onAllow?.();
  };

  /**
   * Handle deny location
   */
  const handleDeny = () => {
    onDeny?.();
    onClose?.();
  };

  /**
   * Handle close dialog
   */
  const handleClose = () => {
    onClose?.();
  };

  /**
   * Get browser name for instructions
   */
  const getBrowserName = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'chrome'; // Default fallback
  };

  /**
   * Update step based on permission state
   */
  useEffect(() => {
    if (permissionState === 'granted') {
      setActiveStep(2);
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } else if (permissionState === 'denied') {
      setActiveStep(0);
      setShowHelp(true);
    }
  }, [permissionState, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <LocationOn sx={{ color: jamaicanColors.green, fontSize: '2rem', mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Find Jobs Near You
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Enable location access to discover opportunities in your area
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Permission Steps */}
        {showInstructions && (
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {permissionSteps.map((label, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: jamaicanColors.green },
                        '&.Mui-completed': { color: jamaicanColors.green }
                      }
                    }}
                  >
                    <Typography variant="caption">{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* Permission Denied Help */}
        <Collapse in={showHelp && permissionState === 'denied'}>
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 2 }}
            action={
              <Button
                size="small"
                onClick={() => setShowHelp(false)}
              >
                Hide
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Location Access Blocked
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              To enable location access in {getBrowserName()}:
            </Typography>
            <List dense>
              {browserInstructions[getBrowserName()].map((instruction, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={instruction}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Collapse>

        {/* Benefits */}
        {showBenefits && permissionState !== 'denied' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Why enable location access?
            </Typography>
            <List>
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor: `${benefit.color}10`,
                          border: `1px solid ${benefit.color}30`
                        }}
                      >
                        <IconComponent sx={{ color: benefit.color, fontSize: '1.2rem' }} />
                      </Paper>
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit.title}
                      secondary={benefit.description}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Success State */}
        {permissionState === 'granted' && (
          <Alert
            severity="success"
            icon={<CheckCircle />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Location Access Granted!
            </Typography>
            <Typography variant="body2">
              We can now show you jobs near your location.
            </Typography>
          </Alert>
        )}

        {/* Privacy Notice */}
        <Alert
          severity="info"
          icon={<Info />}
          sx={{ 
            bgcolor: `${jamaicanColors.green}10`,
            border: `1px solid ${jamaicanColors.green}30`,
            '& .MuiAlert-icon': { color: jamaicanColors.green }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            🔒 Your Privacy Matters
          </Typography>
          <Typography variant="body2">
            Your location is only used to find nearby jobs and calculate distances. 
            We never share your location with employers or third parties.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {permissionState === 'granted' ? (
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: jamaicanColors.green,
              '&:hover': { bgcolor: jamaicanColors.green, opacity: 0.9 }
            }}
          >
            Continue
          </Button>
        ) : permissionState === 'denied' ? (
          <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'text.secondary',
                color: 'text.secondary'
              }}
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => setShowHelp(!showHelp)}
              variant="outlined"
              fullWidth
              startIcon={<Settings />}
              sx={{
                borderColor: jamaicanColors.green,
                color: jamaicanColors.green
              }}
            >
              Show Help
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
            <Button
              onClick={handleDeny}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'text.secondary',
                color: 'text.secondary'
              }}
            >
              Not Now
            </Button>
            <Button
              onClick={handleAllow}
              variant="contained"
              fullWidth
              startIcon={<LocationOn />}
              sx={{
                bgcolor: jamaicanColors.green,
                '&:hover': { bgcolor: jamaicanColors.green, opacity: 0.9 }
              }}
            >
              Allow Location
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LocationPermission;
