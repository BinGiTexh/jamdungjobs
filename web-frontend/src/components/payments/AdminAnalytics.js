import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ThemeContext } from '../../context/ThemeContext';
import { useAnalytics } from '../../hooks/usePayment';
import { formatCurrency } from '../../config/stripe.config';

const AdminAnalytics = () => {
  const { jamaicanColors } = useContext(ThemeContext);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    analytics, 
    loading, 
    error, 
    refreshAnalytics,
    exportAnalytics 
  } = useAnalytics(timeRange);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportAnalytics(timeRange);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // KPI Card Component
  const KPICard = ({ title, value, change, icon, color, format = 'number' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? 
      formatCurrency(value * 100, 'USD') : 
      value.toLocaleString();

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
                {formattedValue}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {isPositive ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              bgcolor: `${color}20`, 
              p: 1.5, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load analytics: {error.message}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No analytics data available
      </Alert>
    );
  }

  const chartColors = [
    jamaicanColors.green,
    jamaicanColors.gold,
    jamaicanColors.red,
    '#2196F3',
    '#FF9800',
    '#9C27B0'
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon sx={{ color: jamaicanColors.green }} />
          <Typography variant="h5">Payment Analytics</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={analytics.totalRevenue}
            change={analytics.revenueChange}
            icon={<MoneyIcon sx={{ color: jamaicanColors.green }} />}
            color={jamaicanColors.green}
            format="currency"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Payments"
            value={analytics.totalPayments}
            change={analytics.paymentsChange}
            icon={<ReceiptIcon sx={{ color: jamaicanColors.gold }} />}
            color={jamaicanColors.gold}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Subscriptions"
            value={analytics.activeSubscriptions}
            change={analytics.subscriptionsChange}
            icon={<PeopleIcon sx={{ color: jamaicanColors.red }} />}
            color={jamaicanColors.red}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="HEART Revenue Share"
            value={analytics.heartRevenueShare}
            change={analytics.heartRevenueChange}
            icon={<VerifiedIcon sx={{ color: jamaicanColors.green }} />}
            color={jamaicanColors.green}
            format="currency"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={jamaicanColors.green}
                    fill={`${jamaicanColors.green}30`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.paymentStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={jamaicanColors.gold} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Plans */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Plans
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.subscriptionPlanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="subscribers" fill={jamaicanColors.green} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3}>
        {/* Top Performing Job Types */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Job Posting Types
              </Typography>
              <List>
                {analytics.topJobTypes?.map((jobType, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Chip 
                        label={index + 1} 
                        size="small" 
                        sx={{ bgcolor: jamaicanColors.green, color: 'white' }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={jobType.type}
                      secondary={`${jobType.count} payments • ${formatCurrency(jobType.revenue * 100, 'USD')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* HEART Partnership Impact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <VerifiedIcon sx={{ color: jamaicanColors.green }} />
                <Typography variant="h6">
                  HEART Partnership Impact
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Contribution
                  </Typography>
                  <Typography variant="h5" sx={{ color: jamaicanColors.green, fontWeight: 'bold' }}>
                    {formatCurrency((analytics.heartRevenueShare || 0) * 100, 'USD')}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Beneficiary Jobs
                  </Typography>
                  <Typography variant="h5" sx={{ color: jamaicanColors.gold, fontWeight: 'bold' }}>
                    {analytics.heartBeneficiaryJobs || 0}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Supporting Jamaica's workforce development through automated revenue sharing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
