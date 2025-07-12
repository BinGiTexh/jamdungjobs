// Stripe Configuration for JamDung Jobs
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

// Load Stripe instance
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe Elements appearance configuration
export const stripeElementsOptions = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#00A651', // Jamaican green
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Roboto, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    },
    rules: {
      '.Input': {
        border: '1px solid #e6ebf1',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px'
      },
      '.Input:focus': {
        borderColor: '#00A651',
        boxShadow: '0 0 0 2px rgba(0, 166, 81, 0.1)'
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#30313d',
        marginBottom: '6px'
      },
      '.Error': {
        color: '#df1b41',
        fontSize: '14px',
        marginTop: '4px'
      }
    }
  },
  loader: 'auto'
};

// Payment method types supported
export const SUPPORTED_PAYMENT_METHODS = [
  'card',
  'apple_pay',
  'google_pay'
];

// Currency configuration
export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    decimals: 2
  },
  JMD: {
    symbol: 'J$',
    code: 'JMD', 
    name: 'Jamaican Dollar',
    decimals: 2
  }
};

// Pricing tiers for job postings
export const JOB_POSTING_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Listing',
    description: 'Standard job posting with basic visibility',
    prices: { USD: 50, JMD: 77 },
    features: [
      'Standard job listing',
      '30-day visibility',
      'Basic applicant filtering',
      'Email notifications'
    ],
    popular: false
  },
  FEATURED: {
    id: 'featured',
    name: 'Featured Listing',
    description: 'Enhanced visibility with featured placement',
    prices: { USD: 100, JMD: 154 },
    features: [
      'Featured placement in search',
      '45-day visibility',
      'Priority in job recommendations',
      'Advanced applicant filtering',
      'SMS notifications',
      'Application analytics'
    ],
    popular: true
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Listing',
    description: 'Maximum visibility with premium benefits',
    prices: { USD: 150, JMD: 231 },
    features: [
      'Top placement in all searches',
      '60-day visibility',
      'Premium badge display',
      'Advanced analytics dashboard',
      'Priority customer support',
      'Social media promotion',
      'HEART graduate priority matching'
    ],
    popular: false,
    heartBenefits: true
  }
};

// Subscription plans for employers
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'sub_basic',
    name: 'Basic Plan',
    description: 'Perfect for small businesses',
    prices: { USD: 200, JMD: 308 },
    interval: 'month',
    features: [
      'Up to 5 job postings per month',
      'Basic applicant tracking',
      'Email support',
      'Standard analytics'
    ],
    popular: false
  },
  PREMIUM: {
    id: 'sub_premium',
    name: 'Premium Plan',
    description: 'Best for growing companies',
    prices: { USD: 500, JMD: 770 },
    interval: 'month',
    features: [
      'Unlimited job postings',
      'Advanced applicant tracking',
      'Priority support',
      'Advanced analytics',
      'HEART graduate access',
      'Bulk recruitment tools',
      'Custom branding'
    ],
    popular: true,
    heartBenefits: true
  }
};

// Payment status constants
export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded'
};

// Subscription status constants
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing'
};

// Error types
export const PAYMENT_ERROR_TYPES = {
  CARD_ERROR: 'card_error',
  VALIDATION_ERROR: 'validation_error',
  API_ERROR: 'api_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  RATE_LIMIT_ERROR: 'rate_limit_error'
};

// Utility functions
export const formatCurrency = (amountInCents, currency = 'USD') => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(amount);
};

export const getPaymentMethodIcon = (type) => {
  const icons = {
    card: '💳',
    apple_pay: '🍎',
    google_pay: '🔵',
    paypal: '🅿️',
    bank_transfer: '🏦',
    cash_app: '💚',
    link: '🔗',
    us_bank_account: '🏛️',
    sepa_debit: '🇪🇺',
    ideal: '🇳🇱',
    sofort: '🇩🇪',
    bancontact: '🇧🇪',
    giropay: '🇩🇪',
    eps: '🇦🇹',
    p24: '🇵🇱',
    alipay: '🇨🇳',
    wechat_pay: '💬',
    afterpay_clearpay: '⏰',
    klarna: '🛍️'
  };
  return icons[type] || '💳';
};

export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = 1.54) => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'JMD') {
    return Math.round(amount * exchangeRate);
  }
  
  if (fromCurrency === 'JMD' && toCurrency === 'USD') {
    return Math.round(amount / exchangeRate);
  }
  
  return amount;
};



export const validateStripeConfig = () => {
  const errors = [];
  
  if (!stripePublishableKey) {
    errors.push('Stripe publishable key is missing');
  }
  
  if (!stripePublishableKey?.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export default configuration
const stripeConfig = {
  stripePromise,
  stripeElementsOptions,
  SUPPORTED_PAYMENT_METHODS,
  CURRENCY_CONFIG,
  JOB_POSTING_PLANS,
  SUBSCRIPTION_PLANS,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  PAYMENT_ERROR_TYPES,
  formatCurrency,
  convertCurrency,
  getPaymentMethodIcon,
  validateStripeConfig
};

export default stripeConfig;
