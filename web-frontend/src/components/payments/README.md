# JamDung Jobs Payment System

A comprehensive Stripe-powered payment integration system for JamDung Jobs, featuring job posting payments, subscription management, payment history, and HEART partnership revenue sharing.

## 🚀 Features

### Core Payment Processing
- **Secure Payment Forms**: Stripe Elements integration with PCI compliance
- **Multi-Currency Support**: USD and JMD with automatic conversion
- **Payment Methods**: Cards, Apple Pay, Google Pay, and more
- **Real-time Processing**: Instant payment confirmation and job activation

### Subscription Management
- **Flexible Plans**: Basic, Featured, and Premium tiers
- **Lifecycle Management**: Create, upgrade, downgrade, cancel, and reactivate
- **Billing Cycle Tracking**: Visual progress indicators and renewal dates
- **Auto-renewal**: Seamless subscription continuity

### Payment History & Analytics
- **Comprehensive History**: Filterable, searchable payment records
- **Export Functionality**: CSV/Excel export for accounting
- **Admin Analytics**: Revenue tracking, KPIs, and real-time monitoring
- **HEART Impact Tracking**: Partnership revenue sharing analytics

### HEART Partnership Integration
- **Automated Revenue Sharing**: 20% of proceeds support HEART/NSTA Trust
- **Impact Tracking**: Transparent reporting of workforce development contributions
- **Graduate Benefits**: Enhanced visibility for HEART-certified candidates

## 📁 Component Structure

```
src/components/payments/
├── PaymentDashboard.js          # Main dashboard with tabs
├── PaymentForm.js               # Reusable Stripe payment form
├── JobPostingPayment.js         # Job posting specific payment
├── SubscriptionDashboard.js     # Subscription management
├── PaymentHistory.js            # Payment history with filters
├── PaymentMethods.js            # Saved payment methods
├── PaymentMethodForm.js         # Add/edit payment methods
├── AdminAnalytics.js            # Admin analytics dashboard
├── StripeProvider.js            # Stripe Elements wrapper
├── index.js                     # Component exports
└── README.md                    # This file
```

## 🛠️ Technical Implementation

### Dependencies
```json
{
  "@stripe/stripe-js": "^2.1.0",
  "@stripe/react-stripe-js": "^2.3.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0",
  "recharts": "^2.8.0",
  "date-fns": "^2.30.0",
  "react-query": "^3.39.0"
}
```

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_URL=http://localhost:3001

# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Docker Configuration
The payment system is fully integrated with the Docker development environment:

```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - REACT_APP_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
  
  api:
    environment:
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
```

## 🎨 Design System

### Jamaican Theme Integration
- **Colors**: Green (#006633), Gold (#FFD700), Red (#DC143C)
- **Typography**: Clean, accessible fonts with proper contrast
- **Mobile-First**: Responsive design optimized for mobile devices
- **Cultural Authenticity**: Jamaican design elements and messaging

### Accessibility Features
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG 2.1 AA compliance
- **Touch Targets**: 44px+ minimum touch target sizes

## 💳 Payment Flow Examples

### Job Posting Payment
```jsx
import { JobPostingPayment } from '../components/payments';

function PostJobPage() {
  return (
    <JobPostingPayment
      jobId="job_123"
      onSuccess={(payment) => {
        // Handle successful payment
        console.log('Payment successful:', payment);
      }}
      onError={(error) => {
        // Handle payment error
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

### Subscription Management
```jsx
import { SubscriptionDashboard } from '../components/payments';

function AccountPage() {
  const { user } = useContext(AuthContext);
  
  return (
    <SubscriptionDashboard 
      customerId={user.stripeCustomerId}
    />
  );
}
```

### Payment Form Integration
```jsx
import { PaymentForm, StripeProvider } from '../components/payments';

function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  
  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        amount={2500} // $25.00 in cents
        currency="USD"
        paymentType="job_posting"
        description="Featured Job Posting"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </StripeProvider>
  );
}
```

## 🔧 Configuration

### Stripe Configuration
```javascript
// src/config/stripe.config.js
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#006633', // Jamaican green
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px'
    }
  }
};
```

### Subscription Plans
```javascript
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic_monthly',
    name: 'Basic Plan',
    prices: { USD: 9.99, JMD: 15.38 },
    features: [
      'Post up to 5 jobs per month',
      'Basic job visibility',
      'Email support'
    ]
  },
  FEATURED: {
    id: 'featured_monthly',
    name: 'Featured Plan',
    prices: { USD: 19.99, JMD: 30.78 },
    features: [
      'Post up to 15 jobs per month',
      'Featured job placement',
      'Priority support',
      'Basic analytics'
    ],
    popular: true
  },
  PREMIUM: {
    id: 'premium_monthly',
    name: 'Premium Plan',
    prices: { USD: 39.99, JMD: 61.58 },
    features: [
      'Unlimited job postings',
      'Premium placement',
      'Advanced analytics',
      'Dedicated support',
      'HEART graduate priority'
    ],
    heartBenefits: true
  }
};
```

## 🔒 Security Features

### PCI Compliance
- **Stripe Elements**: No sensitive data touches your servers
- **Tokenization**: Payment methods stored as secure tokens
- **Encryption**: All data encrypted in transit and at rest

### Authentication & Authorization
- **JWT Tokens**: Secure API authentication
- **Role-Based Access**: Admin-only features protected
- **Rate Limiting**: API endpoint protection

### Webhook Security
- **Signature Verification**: Stripe webhook signature validation
- **Idempotency**: Duplicate event handling prevention
- **Audit Logging**: Complete payment event trail

## 📊 Analytics & Reporting

### Key Performance Indicators (KPIs)
- **Total Revenue**: Real-time revenue tracking
- **Payment Success Rate**: Transaction success metrics
- **Subscription Metrics**: Active subscribers, churn rate
- **HEART Impact**: Partnership contribution tracking

### Data Visualization
- **Revenue Trends**: Time-series charts with Recharts
- **Payment Distribution**: Pie charts for payment methods
- **Geographic Analysis**: Placement mapping
- **Export Capabilities**: PDF and Excel reports

## 🧪 Testing

### Unit Tests
```bash
# Run payment component tests
npm test src/components/payments/

# Run with coverage
npm test -- --coverage src/components/payments/
```

### Integration Tests
```bash
# Test payment flows
npm run test:integration payments

# Test Stripe webhooks
npm run test:webhooks
```

### E2E Tests
```bash
# Test complete payment workflows
npm run test:e2e payments
```

## 🚀 Deployment

### Development
```bash
# Start development environment
cd local-dev
docker-compose up

# Frontend available at: http://localhost:3000
# API available at: http://localhost:3001
```

### Production
```bash
# Build production assets
npm run build

# Deploy to production
npm run deploy:production
```

## 🐛 Troubleshooting

### Common Issues

#### Stripe Elements Not Loading
```javascript
// Check publishable key configuration
console.log('Stripe Key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Verify Stripe provider wrapper
<StripeProvider clientSecret={clientSecret}>
  <PaymentForm />
</StripeProvider>
```

#### Payment Intent Creation Fails
```javascript
// Check backend API connectivity
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(paymentData)
});
```

#### Webhook Events Not Processing
```bash
# Check webhook endpoint configuration
curl -X POST http://localhost:3001/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"type": "payment_intent.succeeded"}'
```

### Debug Mode
```javascript
// Enable Stripe debug logging
window.Stripe.setDebugMode(true);

// Enable payment component debugging
localStorage.setItem('payment_debug', 'true');
```

## 📚 API Reference

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Process refund (admin)

### Subscription Endpoints
- `POST /api/subscriptions/create` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `POST /api/subscriptions/:id/reactivate` - Reactivate subscription

### Analytics Endpoints
- `GET /api/analytics/payments` - Payment analytics
- `GET /api/analytics/subscriptions` - Subscription metrics
- `GET /api/analytics/heart-impact` - HEART partnership impact

## 🤝 HEART Partnership

### Revenue Sharing
- **Automatic Calculation**: 20% of all payment proceeds
- **Real-time Tracking**: Transparent contribution reporting
- **Impact Metrics**: Graduate placement and program effectiveness
- **Compliance**: Audit trail for partnership accountability

### Graduate Benefits
- **Enhanced Visibility**: HEART-certified candidates get priority placement
- **Skills Verification**: Digital badge integration
- **Career Tracking**: Placement outcome monitoring
- **Employer Matching**: Advanced matching algorithms

## 📞 Support

### Development Support
- **Documentation**: Comprehensive inline documentation
- **Code Comments**: Detailed implementation notes
- **Error Handling**: Graceful error recovery and user feedback

### User Support
- **Help Documentation**: User-friendly payment guides
- **Error Messages**: Clear, actionable error descriptions
- **Contact Support**: Integrated support ticket system

---

## 🎯 Next Steps

1. **Testing**: Comprehensive test coverage for all payment flows
2. **Performance**: Optimize bundle size and loading performance
3. **Accessibility**: Enhanced screen reader and keyboard support
4. **Internationalization**: Multi-language support for Caribbean region
5. **Advanced Analytics**: Machine learning insights and predictions

---

*Built with ❤️ for Jamaica's workforce development through the HEART/NSTA Trust partnership*
