import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';

const PaymentMethodForm = ({ onSubmit, onCancel, loading = false }) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: submitError, paymentMethod } = await elements.submit();
      
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Confirm setup intent (for saving payment method)
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-methods`
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Call parent submit handler
      if (onSubmit) {
        await onSubmit({
          paymentMethod,
          setAsDefault
        });
      }
    } catch (err) {
      console.error('Payment method setup failed:', err);
      setError(err.message || 'Failed to add payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || loading;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CreditCardIcon sx={{ color: jamaicanColors.green }} />
        <Typography variant="h6">
          Add New Payment Method
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                  address: {
                    country: 'auto',
                    line1: 'auto',
                    line2: 'auto',
                    city: 'auto',
                    state: 'auto',
                    postalCode: 'auto'
                  }
                }
              }
            }}
          />
        </Box>

        {/* Options */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                sx={{
                  color: jamaicanColors.green,
                  '&.Mui-checked': {
                    color: jamaicanColors.green
                  }
                }}
              />
            }
            label="Set as default payment method"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Security Notice */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          p: 2,
          bgcolor: `${jamaicanColors.green}10`,
          borderRadius: 1
        }}>
          <SecurityIcon sx={{ color: jamaicanColors.green, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Your payment information is encrypted and securely processed by Stripe
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={!stripe || isLoading}
            startIcon={
              isLoading ? 
                <CircularProgress size={20} color="inherit" /> : 
                <CreditCardIcon />
            }
            sx={{
              bgcolor: jamaicanColors.green,
              minWidth: 140,
              '&:hover': {
                bgcolor: jamaicanColors.darkGreen
              },
              '&:disabled': {
                bgcolor: '#ccc'
              }
            }}
          >
            {isLoading ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PaymentMethodForm;
