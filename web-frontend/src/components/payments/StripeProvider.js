import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Alert, CircularProgress, Box } from '@mui/material';
import { STRIPE_CONFIG } from '../../config/stripe.config';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || STRIPE_CONFIG.publishableKey);

const StripeProvider = ({ children, clientSecret, options = {} }) => {
  const [stripe, setStripe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }
        setStripe(stripeInstance);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Payment system unavailable: {error}
      </Alert>
    );
  }

  if (!stripe) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Payment system is loading...
      </Alert>
    );
  }

  const elementsOptions = {
    clientSecret,
    appearance: STRIPE_CONFIG.appearance,
    loader: 'auto',
    ...options
  };

  return (
    <Elements stripe={stripe} options={elementsOptions}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
