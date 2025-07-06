// Custom Payment Hooks for JamDung Jobs
import { useState, useCallback, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import paymentApiService from '../services/paymentApi.service';
import { PAYMENT_STATUS } from '../config/stripe.config';

// Main payment processing hook
export const usePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const createPaymentIntent = useCallback(async (paymentData) => {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.createPaymentIntent(paymentData);
      
      if (response.success) {
        setPaymentIntent(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create payment intent');
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stripe]);

  const confirmPayment = useCallback(async (clientSecret, paymentData = {}) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          ...paymentData
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        throw stripeError;
      }

      if (confirmedPayment.status === PAYMENT_STATUS.SUCCEEDED) {
        // Notify backend of successful payment
        await paymentApiService.confirmPayment(confirmedPayment.id);
        setPaymentIntent(confirmedPayment);
        return confirmedPayment;
      }

      return confirmedPayment;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stripe, elements]);

  const processCardPayment = useCallback(async (paymentData) => {
    try {
      // Step 1: Create payment intent
      const intent = await createPaymentIntent(paymentData);
      
      // Step 2: Confirm payment
      const result = await confirmPayment(intent.client_secret);
      
      return result;
    } catch (err) {
      console.error('Payment processing failed:', err);
      throw err;
    }
  }, [createPaymentIntent, confirmPayment]);

  return {
    createPaymentIntent,
    confirmPayment,
    processCardPayment,
    paymentIntent,
    loading,
    error,
    clearError: () => setError(null)
  };
};

// Subscription management hook
export const useSubscription = (customerId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.getSubscription(subscriptionId);
      if (response.success) {
        setSubscription(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubscription = useCallback(async (planId, paymentMethodId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.createSubscription(planId, paymentMethodId);
      if (response.success) {
        setSubscription(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create subscription');
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (subscriptionId, planId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.updateSubscription(subscriptionId, planId);
      if (response.success) {
        setSubscription(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update subscription');
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.cancelSubscription(subscriptionId);
      if (response.success) {
        setSubscription(prev => ({ ...prev, status: 'canceled', cancel_at_period_end: true }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.reactivateSubscription(subscriptionId);
      if (response.success) {
        setSubscription(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to reactivate subscription');
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscription,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    loading,
    error,
    clearError: () => setError(null)
  };
};

// Payment history hook
export const usePaymentHistory = (customerId) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchPayments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.getPaymentHistory({
        customerId,
        ...params
      });

      if (response.success) {
        if (params.page === 1) {
          setPayments(response.data.data);
        } else {
          setPayments(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        return response.data;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      fetchPayments({ page: pagination.page + 1 });
    }
  }, [pagination.hasNext, pagination.page, loading, fetchPayments]);

  const exportHistory = useCallback(async (format = 'csv') => {
    try {
      const blob = await paymentApiService.exportPaymentHistory(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err);
    }
  }, []);

  const refreshHistory = useCallback(() => {
    fetchPayments({ page: 1 });
  }, [fetchPayments]);

  useEffect(() => {
    if (customerId) {
      fetchPayments();
    }
  }, [customerId, fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    loadMore,
    exportHistory,
    refreshHistory,
    clearError: () => setError(null)
  };
};

// Analytics hook for admin dashboard
export const useAnalytics = (dateRange) => {
  const [analytics, setAnalytics] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [heartRevenue, setHeartRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [paymentData, customerData, revenueData, heartData] = await Promise.all([
        paymentApiService.getPaymentAnalytics(dateRange),
        paymentApiService.getCustomerAnalytics(),
        paymentApiService.getRevenueAnalytics(),
        paymentApiService.getHeartRevenueShare()
      ]);

      if (paymentData.success) setAnalytics(paymentData.data);
      if (customerData.success) setCustomerAnalytics(customerData.data);
      if (revenueData.success) setRevenueAnalytics(revenueData.data);
      if (heartData.success) setHeartRevenue(heartData.data);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    customerAnalytics,
    revenueAnalytics,
    heartRevenue,
    loading,
    error,
    refresh,
    clearError: () => setError(null)
  };
};

// Payment method management hook
export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePaymentMethod = useCallback(async (paymentMethodId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.savePaymentMethod(paymentMethodId);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh list
        return response.data;
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  const deletePaymentMethod = useCallback(async (paymentMethodId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentApiService.deletePaymentMethod(paymentMethodId);
      if (response.success) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
        return response.data;
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    savePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods: fetchPaymentMethods,
    clearError: () => setError(null)
  };
};
