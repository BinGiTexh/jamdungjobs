import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar
} from '@mui/material';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  // Jamaican theme color mapping
  const getJamaicanColors = (colorType) => {
    const jamaican = {
      primary: { main: '#007E1B', light: 'rgba(0, 126, 27, 0.1)' },
      success: { main: '#009921', light: 'rgba(0, 153, 33, 0.1)' },
      info: { main: '#FFB30F', light: 'rgba(255, 179, 15, 0.1)' },
      warning: { main: '#FFD700', light: 'rgba(255, 215, 0, 0.1)' },
      error: { main: '#CD2B2B', light: 'rgba(205, 43, 43, 0.1)' }
    };
    return jamaican[colorType] || jamaican.primary;
  };

  const themeColors = getJamaicanColors(color);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value || 0}
            </Typography>
            {trend && (
              <Typography 
                variant="body2" 
                color={trend.startsWith('+') ? '#009921' : '#CD2B2B'}
                sx={{ mt: 1, fontWeight: 'bold' }}
              >
                {trend} vs last period
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: themeColors.light, width: 56, height: 56 }}>
            <Icon sx={{ color: themeColors.main }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
