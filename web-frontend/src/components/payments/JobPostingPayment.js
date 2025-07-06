import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';

const JobPostingPayment = ({ 
  open, 
  onClose, 
  jobId, 
  jobTitle, 
  onPaymentSuccess 
}) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pricing data (should match backend)
  const pricing = {
    JOB_POSTING: {
      BASIC: { USD: 50, JMD: 77 },
      FEATURED: { USD: 100, JMD: 154 },
      PREMIUM: { USD: 150, JMD: 231 }
    }
  };

  const planFeatures = {
    BASIC: [
      'Standard job listing',
      '30-day visibility',
      'Basic applicant filtering',
      'Email notifications'
    ],
    FEATURED: [
      'Featured placement in search',
      '45-day visibility',
      'Priority in job recommendations',
      'Advanced applicant filtering',
      'SMS notifications',
      'Application analytics'
    ],
    PREMIUM: [
      'Top placement in all searches',
      '60-day visibility',
      'Premium badge display',
      'Advanced analytics dashboard',
      'Priority customer support',
      'Social media promotion',
      'HEART graduate priority matching'
    ]
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const amount = pricing.JOB_POSTING[selectedPlan][currency];
      
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: currency,
          paymentType: selectedPlan === 'BASIC' ? 'JOB_POSTING' : 
                      selectedPlan === 'FEATURED' ? 'FEATURED_LISTING' : 'PREMIUM_LISTING',
          jobId: jobId,
          description: `${selectedPlan} job posting for: ${jobTitle}`
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      console.warn('Payment Intent Created:', data.data);
      
      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Confirm payment (in real implementation, this would be done by Stripe)
          const confirmResponse = await fetch('/api/payments/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentIntentId: data.data.paymentIntentId
            })
          });

          const confirmData = await confirmResponse.json();

          if (confirmData.success) {
            onPaymentSuccess({
              paymentId: confirmData.data.id,
              plan: selectedPlan,
              amount: amount,
              currency: currency
            });
            onClose();
          } else {
            throw new Error(confirmData.message || 'Payment confirmation failed');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, 2000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatPrice = (amount, curr) => {
    return curr === 'USD' ? `$${amount}` : `J$${amount}`;
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'FEATURED': return <StarIcon sx={{ color: jamaicanColors.gold }} />;
      case 'PREMIUM': return <VerifiedIcon sx={{ color: jamaicanColors.green }} />;
      default: return <PaymentIcon />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'FEATURED': return jamaicanColors.gold;
      case 'PREMIUM': return jamaicanColors.green;
      default: return jamaicanColors.gray;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: jamaicanColors.green, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <PaymentIcon />
        Promote Your Job Posting
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {jobTitle}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a promotion plan to increase visibility and attract top talent in Jamaica
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Currency Selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Currency</FormLabel>
          <RadioGroup
            row
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <FormControlLabel value="USD" control={<Radio />} label="USD ($)" />
            <FormControlLabel value="JMD" control={<Radio />} label="JMD (J$)" />
          </RadioGroup>
        </FormControl>

        {/* Plan Selection */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Select Promotion Plan
          </FormLabel>
          <RadioGroup
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            {Object.entries(pricing.JOB_POSTING).map(([plan, prices]) => (
              <Card 
                key={plan}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  border: selectedPlan === plan ? `2px solid ${getPlanColor(plan)}` : '1px solid #e0e0e0',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardContent>
                  <FormControlLabel
                    value={plan}
                    control={<Radio />}
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getPlanIcon(plan)}
                          <Typography variant="h6" component="span">
                            {plan.charAt(0) + plan.slice(1).toLowerCase()} Plan
                          </Typography>
                          <Chip 
                            label={formatPrice(prices[currency], currency)}
                            color="primary"
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        
                        <Box sx={{ pl: 4 }}>
                          {planFeatures[plan].map((feature, index) => (
                            <Typography 
                              key={index}
                              variant="body2" 
                              color="text.secondary"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
                            >
                              • {feature}
                            </Typography>
                          ))}
                        </Box>

                        {plan === 'PREMIUM' && (
                          <Box sx={{ mt: 1, pl: 4 }}>
                            <Chip 
                              icon={<TrendingUpIcon />}
                              label="HEART Partnership Benefits"
                              size="small"
                              sx={{ 
                                bgcolor: jamaicanColors.green,
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' }
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Payment Processing:</strong> Secure payment powered by Stripe. 
            20% of proceeds support HEART/NSTA Trust for workforce development in Jamaica.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
          sx={{
            bgcolor: jamaicanColors.green,
            '&:hover': {
              bgcolor: jamaicanColors.darkGreen
            }
          }}
        >
          {loading ? 'Processing...' : `Pay ${formatPrice(pricing.JOB_POSTING[selectedPlan][currency], currency)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobPostingPayment;
