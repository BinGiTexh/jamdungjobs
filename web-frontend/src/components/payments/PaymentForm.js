import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';
import { usePayment } from '../../hooks/usePayment';
import { formatCurrency, CURRENCY_CONFIG } from '../../config/stripe.config';

const PaymentForm = ({
  amount,
  currency = 'USD',
  paymentType,
  description,
  metadata = {},
  onSuccess,
  onError,
  showCurrencySelector = true
}) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const stripe = useStripe();
  const elements = useElements();
  const { processCardPayment, loading, error } = usePayment();
  
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Convert amount based on selected currency
  const getConvertedAmount = () => {
    if (selectedCurrency === currency) return amount;
    
    // Simple conversion rate (in production, get from API)
    const exchangeRate = 1.54; // USD to JMD
    if (currency === 'USD' && selectedCurrency === 'JMD') {
      return Math.round(amount * exchangeRate);
    }
    if (currency === 'JMD' && selectedCurrency === 'USD') {
      return Math.round(amount / exchangeRate);
    }
    return amount;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const convertedAmount = getConvertedAmount();
      
      const paymentData = {
        amount: convertedAmount * 100, // Convert to cents
        currency: selectedCurrency,
        paymentType,
        description: description || `Payment for ${paymentType}`,
        metadata: {
          ...metadata,
          originalAmount: amount,
          originalCurrency: currency,
          convertedAmount,
          convertedCurrency: selectedCurrency
        }
      };

      const result = await processCardPayment(paymentData);
      
      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const displayError = paymentError || error?.message;

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PaymentIcon sx={{ color: jamaicanColors.green }} />
          <Typography variant="h6" component="h2">
            Secure Payment
          </Typography>
          <SecurityIcon sx={{ color: jamaicanColors.gold, ml: 'auto' }} />
        </Box>

        {/* Payment Summary */}
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          mb: 3,
          border: `1px solid ${jamaicanColors.green}20`
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Payment Summary
          </Typography>
          <Typography variant="h5" sx={{ color: jamaicanColors.green, fontWeight: 'bold' }}>
            {formatCurrency(getConvertedAmount() * 100, selectedCurrency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description || `${paymentType} Payment`}
          </Typography>
        </Box>

        {/* Currency Selector */}
        {showCurrencySelector && (
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Payment Currency
            </FormLabel>
            <RadioGroup
              row
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <FormControlLabel 
                value="USD" 
                control={<Radio />} 
                label={`USD (${CURRENCY_CONFIG.USD.symbol})`}
              />
              <FormControlLabel 
                value="JMD" 
                control={<Radio />} 
                label={`JMD (${CURRENCY_CONFIG.JMD.symbol})`}
              />
            </RadioGroup>
          </FormControl>
        )}

        {/* Error Display */}
        {displayError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {displayError}
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <PaymentElement
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* HEART Partnership Notice */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 2,
            p: 2,
            bgcolor: `${jamaicanColors.green}10`,
            borderRadius: 1
          }}>
            <VerifiedIcon sx={{ color: jamaicanColors.green, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              20% of proceeds support HEART/NSTA Trust workforce development
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!stripe || isProcessing || loading}
            startIcon={
              isProcessing || loading ? 
                <CircularProgress size={20} color="inherit" /> : 
                <PaymentIcon />
            }
            sx={{
              bgcolor: jamaicanColors.green,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: jamaicanColors.darkGreen
              },
              '&:disabled': {
                bgcolor: '#ccc'
              }
            }}
          >
            {isProcessing || loading ? 
              'Processing Payment...' : 
              `Pay ${formatCurrency(getConvertedAmount() * 100, selectedCurrency)}`
            }
          </Button>
        </form>

        {/* Security Notice */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Your payment information is secure and encrypted
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
