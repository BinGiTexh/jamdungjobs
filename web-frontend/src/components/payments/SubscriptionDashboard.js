import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Subscriptions as SubscriptionsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Upgrade as UpgradeIcon,
  Star as StarIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { format, fromUnixTime } from 'date-fns';
import { ThemeContext } from '../../context/ThemeContext';
import { useSubscription } from '../../hooks/usePayment';
import { formatCurrency, SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from '../../config/stripe.config';

const SubscriptionDashboard = ({ customerId }) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const { 
    subscription, 
    updateSubscription, 
    cancelSubscription, 
    reactivateSubscription,
    loading, 
    error 
  } = useSubscription(customerId);

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case SUBSCRIPTION_STATUS.ACTIVE: return 'success';
      case SUBSCRIPTION_STATUS.TRIALING: return 'info';
      case SUBSCRIPTION_STATUS.PAST_DUE: return 'warning';
      case SUBSCRIPTION_STATUS.CANCELED: return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case SUBSCRIPTION_STATUS.ACTIVE: return 'Active';
      case SUBSCRIPTION_STATUS.TRIALING: return 'Trial';
      case SUBSCRIPTION_STATUS.PAST_DUE: return 'Past Due';
      case SUBSCRIPTION_STATUS.CANCELED: return 'Canceled';
      case SUBSCRIPTION_STATUS.UNPAID: return 'Unpaid';
      default: return status;
    }
  };

  const handlePlanUpgrade = async (planId) => {
    setActionLoading(true);
    try {
      await updateSubscription(subscription.id, planId);
      setShowUpgradeDialog(false);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    try {
      await cancelSubscription(subscription.id);
      setShowCancelDialog(false);
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      await reactivateSubscription(subscription.id);
    } catch (err) {
      console.error('Reactivation failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription?.plan) return null;
    return Object.values(SUBSCRIPTION_PLANS).find(plan => 
      plan.id === subscription.plan.id
    );
  };


  const calculateDaysRemaining = () => {
    if (!subscription?.current_period_end) return 0;
    const endDate = fromUnixTime(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <SubscriptionsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Active Subscription
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Subscribe to unlock premium features and HEART partnership benefits
          </Typography>
          <Button
            variant="contained"
            startIcon={<UpgradeIcon />}
            sx={{ bgcolor: jamaicanColors.green }}
            onClick={() => setShowUpgradeDialog(true)}
          >
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = getCurrentPlan();
  const daysRemaining = calculateDaysRemaining();
  const progressPercentage = subscription.current_period_start && subscription.current_period_end ?
    ((Date.now() / 1000 - subscription.current_period_start) / 
     (subscription.current_period_end - subscription.current_period_start)) * 100 : 0;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {/* Main Subscription Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SubscriptionsIcon sx={{ color: jamaicanColors.green }} />
              <Typography variant="h6">
                {currentPlan?.name || 'Subscription'}
              </Typography>
              {currentPlan?.heartBenefits && (
                <VerifiedIcon sx={{ color: jamaicanColors.gold, ml: 1 }} />
              )}
            </Box>
            <Chip 
              label={getStatusText(subscription.status)}
              color={getStatusColor(subscription.status)}
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Plan
              </Typography>
              <Typography variant="h4" sx={{ color: jamaicanColors.green, fontWeight: 'bold' }}>
                {formatCurrency((currentPlan?.prices.USD || 0) * 100, 'USD')}
                <Typography component="span" variant="body1" color="text.secondary">
                  /month
                </Typography>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Next Billing Date
              </Typography>
              <Typography variant="h6">
                {subscription.current_period_end ? 
                  format(fromUnixTime(subscription.current_period_end), 'MMM dd, yyyy') :
                  'N/A'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
              </Typography>
            </Grid>
          </Grid>

          {/* Billing Cycle Progress */}
          {subscription.status === SUBSCRIPTION_STATUS.ACTIVE && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Billing Cycle Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progressPercentage)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(progressPercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: jamaicanColors.green
                  }
                }}
              />
            </Box>
          )}

          {/* Plan Features */}
          {currentPlan && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Plan Features
              </Typography>
              <List dense>
                {currentPlan.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ color: jamaicanColors.green, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {subscription.status === SUBSCRIPTION_STATUS.ACTIVE && !subscription.cancel_at_period_end && (
              <>
                <Button
                  variant="contained"
                  startIcon={<UpgradeIcon />}
                  onClick={() => setShowUpgradeDialog(true)}
                  sx={{ bgcolor: jamaicanColors.green }}
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => setShowCancelDialog(true)}
                  color="error"
                >
                  Cancel Subscription
                </Button>
              </>
            )}

            {subscription.cancel_at_period_end && (
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                sx={{ bgcolor: jamaicanColors.green }}
              >
                {actionLoading ? 'Reactivating...' : 'Reactivate Subscription'}
              </Button>
            )}

            {subscription.status === SUBSCRIPTION_STATUS.CANCELED && (
              <Button
                variant="contained"
                startIcon={<UpgradeIcon />}
                onClick={() => setShowUpgradeDialog(true)}
                sx={{ bgcolor: jamaicanColors.green }}
              >
                Subscribe Again
              </Button>
            )}
          </Box>

          {subscription.cancel_at_period_end && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Your subscription will be canceled at the end of the current billing period on{' '}
              {format(fromUnixTime(subscription.current_period_end), 'MMM dd, yyyy')}.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog 
        open={showUpgradeDialog} 
        onClose={() => setShowUpgradeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpgradeIcon sx={{ color: jamaicanColors.green }} />
            Choose Your Plan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlan?.id === plan.id ? 
                      `2px solid ${jamaicanColors.green}` : '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 2 }
                  }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {plan.popular && <StarIcon sx={{ color: jamaicanColors.gold }} />}
                      <Typography variant="h6">{plan.name}</Typography>
                      {plan.heartBenefits && (
                        <VerifiedIcon sx={{ color: jamaicanColors.green }} />
                      )}
                    </Box>
                    
                    <Typography variant="h4" sx={{ color: jamaicanColors.green, mb: 1 }}>
                      {formatCurrency(plan.prices.USD * 100, 'USD')}
                      <Typography component="span" variant="body1" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    
                    <List dense>
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon sx={{ color: jamaicanColors.green, fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedPlan && handlePlanUpgrade(selectedPlan.id)}
            disabled={!selectedPlan || actionLoading}
            sx={{ bgcolor: jamaicanColors.green }}
          >
            {actionLoading ? 'Updating...' : 'Update Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your subscription? You'll continue to have access 
            until the end of your current billing period.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            Keep Subscription
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelSubscription}
            disabled={actionLoading}
          >
            {actionLoading ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionDashboard;
