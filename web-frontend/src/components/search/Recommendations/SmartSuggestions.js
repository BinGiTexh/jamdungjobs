/**
 * Smart Suggestions Component
 * Trending searches, quick actions, and personalized suggestions
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Stack,
  Button,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Skeleton,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  Search,
  History,
  Star,
  LocationOn,
  Work,
  Schedule,
  MonetizationOn,
  Lightbulb,
  Clear,
  Refresh
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';

const SmartSuggestions = ({
  trendingSearches = [],
  recentSearches = [],
  quickActions = [],
  smartSuggestions = [],
  loading = false,
  onSearchSuggestion,
  onQuickAction,
  onClearHistory,
  onRefresh,
  compact = false,
  maxItems = 5
}) => {
  const { jamaicanColors } = useTheme();
  const [_activeTab, _setActiveTab] = useState('trending');

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion, type) => {
    if (type === 'search') {
      onSearchSuggestion?.(suggestion);
      console.warn('🔍 Search suggestion clicked:', suggestion);
    } else if (type === 'action') {
      onQuickAction?.(suggestion);
      console.warn('⚡ Quick action clicked:', suggestion);
    }
  }, [onSearchSuggestion, onQuickAction]);

  /**
   * Get icon for suggestion type
   */
  const getSuggestionIcon = (type, _category) => {
    switch (type) {
      case 'location':
        return LocationOn;
      case 'industry':
        return Work;
      case 'jobType':
        return Schedule;
      case 'salary':
        return MonetizationOn;
      case 'search':
        return Search;
      default:
        return Lightbulb;
    }
  };

  /**
   * Render trending searches
   */
  const renderTrendingSearches = () => {
    if (loading) {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      );
    }

    if (!trendingSearches.length) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No trending searches available
        </Typography>
      );
    }

    return (
      <Stack spacing={1}>
        {trendingSearches.slice(0, maxItems).map((search, index) => {
          const IconComponent = getSuggestionIcon(search.type);
          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid transparent',
                '&:hover': {
                  border: `1px solid ${jamaicanColors.green}50`,
                  bgcolor: `${jamaicanColors.green}05`,
                  transform: 'translateX(4px)'
                }
              }}
              onClick={() => handleSuggestionClick(search, 'search')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconComponent sx={{ color: jamaicanColors.green, mr: 1.5, fontSize: '1.2rem' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {search.query}
                    </Typography>
                    {search.category && (
                      <Typography variant="caption" color="text.secondary">
                        {search.category}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {search.count && (
                    <Chip
                      label={`${search.count} searches`}
                      size="small"
                      sx={{
                        bgcolor: `${jamaicanColors.green}20`,
                        color: jamaicanColors.green,
                        fontSize: '0.7rem',
                        mr: 1
                      }}
                    />
                  )}
                  <TrendingUp sx={{ color: jamaicanColors.green, fontSize: '1rem' }} />
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  /**
   * Render recent searches
   */
  const renderRecentSearches = () => {
    if (loading) {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      );
    }

    if (!recentSearches.length) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No recent searches
        </Typography>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Recent Searches
          </Typography>
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={onClearHistory}
            sx={{ color: 'text.secondary' }}
          >
            Clear
          </Button>
        </Box>
        
        <List dense>
          {recentSearches.slice(0, maxItems).map((search, index) => {
            const IconComponent = getSuggestionIcon(search.type);
            return (
              <ListItemButton
                key={index}
                onClick={() => handleSuggestionClick(search, 'search')}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: `${jamaicanColors.green}10`
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <IconComponent sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={search.query}
                  secondary={search.timestamp ? new Date(search.timestamp).toLocaleDateString() : null}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    );
  };

  /**
   * Render quick actions
   */
  const renderQuickActions = () => {
    if (loading) {
      return (
        <Grid container spacing={1}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={6} key={index}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!quickActions.length) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No quick actions available
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {quickActions.slice(0, 6).map((action, index) => {
          const IconComponent = getSuggestionIcon(action.type);
          return (
            <Grid item xs={6} sm={4} key={index}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid transparent',
                  '&:hover': {
                    border: `1px solid ${jamaicanColors.green}50`,
                    bgcolor: `${jamaicanColors.green}05`,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleSuggestionClick(action, 'action')}
              >
                <Badge
                  badgeContent={action.count}
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: jamaicanColors.green,
                      color: 'white',
                      fontSize: '0.7rem'
                    }
                  }}
                  invisible={!action.count}
                >
                  <IconComponent sx={{ color: jamaicanColors.green, fontSize: '1.5rem', mb: 1 }} />
                </Badge>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {action.label}
                </Typography>
                {action.description && (
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  /**
   * Render smart suggestions
   */
  const renderSmartSuggestions = () => {
    if (loading) {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      );
    }

    if (!smartSuggestions.length) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No smart suggestions available
        </Typography>
      );
    }

    return (
      <Stack spacing={2}>
        {smartSuggestions.slice(0, 3).map((suggestion, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              border: `1px solid ${jamaicanColors.green}30`,
              bgcolor: `${jamaicanColors.green}05`,
              '&:hover': {
                bgcolor: `${jamaicanColors.green}10`,
                transform: 'translateX(4px)'
              }
            }}
            onClick={() => handleSuggestionClick(suggestion, 'search')}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Lightbulb sx={{ color: jamaicanColors.green, mr: 1.5, mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {suggestion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {suggestion.description}
                </Typography>
                <Chip
                  label={suggestion.action}
                  size="small"
                  sx={{
                    bgcolor: jamaicanColors.green,
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    );
  };

  if (compact) {
    // Compact layout for mobile
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quick Suggestions
          </Typography>
          {onRefresh && (
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={onRefresh}
              sx={{ color: jamaicanColors.green }}
            >
              Refresh
            </Button>
          )}
        </Box>

        {/* Quick Actions Grid */}
        {renderQuickActions()}

        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              🔥 Trending Now
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {trendingSearches.slice(0, 5).map((search, index) => (
                <Chip
                  key={index}
                  label={search.query}
                  onClick={() => handleSuggestionClick(search, 'search')}
                  sx={{
                    bgcolor: `${jamaicanColors.green}20`,
                    color: jamaicanColors.green,
                    '&:hover': {
                      bgcolor: `${jamaicanColors.green}30`
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  }

  // Full layout
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Smart Suggestions
        </Typography>
        {onRefresh && (
          <Button
            startIcon={<Refresh />}
            onClick={onRefresh}
            size="small"
            sx={{
              color: jamaicanColors.green,
              '&:hover': { bgcolor: `${jamaicanColors.green}10` }
            }}
          >
            Refresh
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Trending Searches */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUp sx={{ color: jamaicanColors.green, mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Trending Searches
            </Typography>
          </Box>
          {renderTrendingSearches()}
        </Grid>

        {/* Recent Searches */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <History sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Recent Activity
            </Typography>
          </Box>
          {renderRecentSearches()}
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Star sx={{ color: jamaicanColors.green, mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
          </Box>
          {renderQuickActions()}
        </Grid>

        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Lightbulb sx={{ color: jamaicanColors.green, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Personalized for You
              </Typography>
            </Box>
            {renderSmartSuggestions()}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SmartSuggestions;
