import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Payment as PaymentIcon,
  Subscriptions as SubscriptionsIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import SubscriptionDashboard from './SubscriptionDashboard';
import PaymentHistory from './PaymentHistory';
import PaymentMethods from './PaymentMethods';
import AdminAnalytics from './AdminAnalytics';
import JobPostingPayment from './JobPostingPayment';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PaymentDashboard = ({ initialTab = 0, jobId = null }) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const customerId = user?.stripeCustomerId;

  // If jobId is provided, show job posting payment directly
  if (jobId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="small" />
            Home
          </Link>
          <Link color="inherit" href="/jobs">
            Jobs
          </Link>
          <Typography color="text.primary">Payment</Typography>
        </Breadcrumbs>
        
        <JobPostingPayment jobId={jobId} />
      </Container>
    );
  }

  const tabs = [
    {
      label: 'Overview',
      icon: <DashboardIcon />,
      component: <SubscriptionDashboard customerId={customerId} />,
      show: true
    },
    {
      label: 'Payment History',
      icon: <HistoryIcon />,
      component: <PaymentHistory customerId={customerId} />,
      show: true
    },
    {
      label: 'Payment Methods',
      icon: <CreditCardIcon />,
      component: <PaymentMethods customerId={customerId} />,
      show: true
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      component: <AdminAnalytics />,
      show: isAdmin
    }
  ].filter(tab => tab.show);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary">Payment Dashboard</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PaymentIcon sx={{ color: jamaicanColors.green, fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: jamaicanColors.green }}>
            Payment Dashboard
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Manage your payments, subscriptions, and billing information
        </Typography>
      </Box>

      {/* User Authentication Check */}
      {!user && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please log in to access your payment dashboard.
        </Alert>
      )}

      {user && !customerId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Setting up your payment profile...
        </Alert>
      )}

      {/* Main Content */}
      {user && (
        <Paper sx={{ width: '100%' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                },
                '& .Mui-selected': {
                  color: jamaicanColors.green
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: jamaicanColors.green
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Paper>
      )}

      {/* HEART Partnership Notice */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        bgcolor: `${jamaicanColors.green}10`,
        borderRadius: 2,
        border: `1px solid ${jamaicanColors.green}30`
      }}>
        <Typography variant="h6" sx={{ color: jamaicanColors.green, mb: 1 }}>
          🤝 Supporting Jamaica's Workforce Development
        </Typography>
        <Typography variant="body2" color="text.secondary">
          20% of all payment proceeds automatically support HEART/NSTA Trust workforce development programs, 
          helping to train and empower Jamaica's next generation of skilled workers.
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentDashboard;
