import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon,
  Upgrade as UpgradeIcon,
  Download as DownloadIcon,
  CreditCard as CardIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmployerBillingPage = () => {
  const { _user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      id: 'basic',
      name: 'Starter',
      price: 99,
      interval: 'month',
      description: 'Perfect for small businesses',
      features: [
        'Post up to 5 active jobs',
        'View up to 100 applications/month',
        'Basic analytics',
        'Email support',
        'Standard job visibility'
      ],
      popular: false,
      color: '#4CAF50'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 199,
      interval: 'month',
      description: 'Best for growing companies',
      features: [
        'Post up to 15 active jobs',
        'Unlimited applications',
        'Advanced analytics & reporting',
        'Priority support',
        'Featured job listings',
        'Candidate filtering tools',
        'Interview scheduling'
      ],
      popular: true,
      color: '#FFD700'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      interval: 'month',
      description: 'For large organizations',
      features: [
        'Unlimited job postings',
        'Unlimited applications',
        'Custom analytics dashboard',
        'Dedicated account manager',
        'Premium job placement',
        'Advanced candidate screening',
        'API access',
        'Custom branding'
      ],
      popular: false,
      color: '#9C27B0'
    }
  ];

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [subscriptionResponse, invoicesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/employer/subscription', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}` }
        }),
        axios.get('http://localhost:5000/api/employer/invoices', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}` }
        })
      ]);

      setSubscriptionData(subscriptionResponse.data.data || subscriptionResponse.data);
      setInvoices(invoicesResponse.data.data?.invoices || invoicesResponse.data.invoices || []);
      setAutoRenew(subscriptionResponse.data.data?.autoRenew || subscriptionResponse.data.autoRenew || true);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      // Set demo data for development
      setSubscriptionData({
        currentPlan: 'basic',
        status: 'active',
        nextBillingDate: '2025-08-05',
        amount: 99
      });
      setInvoices([
        {
          id: 'inv_001',
          amount: 99,
          date: '2025-07-05',
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_002',
          amount: 99,
          date: '2025-06-05',
          status: 'paid',
          downloadUrl: '#'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setUpgradeDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/employer/upgrade', {
        planId: selectedPlan
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}` }
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setSuccess('Plan upgraded successfully!');
        fetchBillingData();
        setConfirmDialogOpen(false);
        setSelectedPlan(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upgrade plan');
    }
  };

  const toggleAutoRenew = async () => {
    try {
      await axios.patch('http://localhost:5000/api/employer/subscription/auto-renew', {
        autoRenew: !autoRenew
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}` }
      });
      
      setAutoRenew(!autoRenew);
      setSuccess('Auto-renewal settings updated');
    } catch (err) {
      setError('Failed to update auto-renewal settings');
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === subscriptionData?.currentPlan) || plans[0];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#FFD700' }}>
          Loading billing information...
        </Typography>
      </Container>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>
          Billing & Subscription
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: 600, mx: 'auto' }}>
          Manage your subscription, billing preferences, and payment history
        </Typography>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Current Subscription */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4, bgcolor: '#1A1A1A', color: 'white' }}>
            <CardHeader
              title="Current Subscription"
              subheader="Your active plan and billing information"
              subheaderTypographyProps={{ color: '#FFD700' }}
              titleTypographyProps={{ color: '#FFD700' }}
              avatar={<BusinessIcon sx={{ color: '#FFD700' }} />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {currentPlan.name}
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white' }}>
                      ${currentPlan.price}/month
                    </Typography>
                  </Box>
                  <Chip 
                    label={subscriptionData?.status?.toUpperCase() || 'ACTIVE'} 
                    color="success" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    Next billing date: {subscriptionData?.nextBillingDate || 'Aug 5, 2025'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={autoRenew} 
                          onChange={toggleAutoRenew}
                          sx={{
                            '& .MuiSwitch-thumb': {
                              backgroundColor: '#FFD700'
                            },
                            '& .Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#FFD700'
                            }
                          }}
                        />
                      }
                      label="Auto-renewal"
                      sx={{ color: 'white' }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<UpgradeIcon />}
                      onClick={() => setUpgradeDialogOpen(true)}
                      sx={{
                        color: '#FFD700',
                        borderColor: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                      }}
                    >
                      Upgrade Plan
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Plan Features */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <CardHeader
              title="Your Plan Features"
              titleTypographyProps={{ color: '#FFD700', fontWeight: 600 }}
            />
            <CardContent>
              <List>
                {currentPlan.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: currentPlan.color }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature} 
                      primaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment & Invoices */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Payment Method"
              avatar={<CardIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CardIcon sx={{ mr: 2, color: '#666' }} />
                <Box>
                  <Typography variant="body1">**** **** **** 4242</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Expires 12/26
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" size="small" fullWidth>
                Update Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Recent Invoices"
              avatar={<ReceiptIcon />}
            />
            <CardContent>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <Box key={invoice.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2">
                          ${invoice.amount}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {invoice.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={invoice.status === 'paid' ? 'success' : 'default'}
                        />
                        <Button size="small" startIcon={<DownloadIcon />}>
                          PDF
                        </Button>
                      </Box>
                    </Box>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No invoices available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#FFD700', fontWeight: 600 }}>
          Choose Your Plan
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    border: selectedPlan === plan.id ? `2px solid ${plan.color}` : '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.color,
                        color: '#000',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center', pt: plan.popular ? 3 : 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" sx={{ color: plan.color, fontWeight: 'bold', mb: 1 }}>
                      ${plan.price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      per month
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, height: 40 }}>
                      {plan.description}
                    </Typography>
                    <List dense>
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0, justifyContent: 'center' }}>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: 'caption', textAlign: 'center' }}
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
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFD700', fontWeight: 600 }}>
          Confirm Plan Upgrade
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                Upgrade to {plans.find(p => p.id === selectedPlan)?.name} Plan
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Important Billing Information:
                </Typography>
                <Typography variant="body2" component="div">
                  • Your new plan will take effect immediately<br/>
                  • You'll be charged ${plans.find(p => p.id === selectedPlan)?.price}/month starting today<br/>
                  • Your next billing date will be {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}<br/>
                  • You can cancel or change your plan anytime
                </Typography>
              </Alert>

              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1, fontWeight: 600 }}>
                Plan Features:
              </Typography>
              <List dense>
                {plans.find(p => p.id === selectedPlan)?.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5, pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature} 
                      primaryTypographyProps={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpgrade}
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #FFD700, #009639)',
              color: '#000000',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(90deg, #009639, #FFD700)'
              }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployerBillingPage;