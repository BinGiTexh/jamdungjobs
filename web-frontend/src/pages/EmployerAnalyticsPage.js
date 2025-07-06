import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EmployerAnalyticsPage = () => {
  const { _user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employer/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}` }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Set demo data for development
      setAnalytics({
        overview: {
          totalJobs: 12,
          activeJobs: 8,
          totalApplications: 247,
          newApplications: 23
        },
        jobPerformance: [
          { title: 'Senior React Developer', applications: 45, views: 234, status: 'Active' },
          { title: 'UI/UX Designer', applications: 32, views: 189, status: 'Active' },
          { title: 'Product Manager', applications: 28, views: 156, status: 'Active' },
          { title: 'Backend Engineer', applications: 41, views: 198, status: 'Closed' }
        ],
        applicationTrends: {
          thisMonth: 89,
          lastMonth: 67,
          growth: 32.8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#FFD700' }}>
          Loading analytics...
        </Typography>
      </Container>
    );
  }

  const { overview, jobPerformance, applicationTrends } = analytics;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1A1A1A', mb: 2 }}>
          Hiring Analytics
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', maxWidth: 600, mx: 'auto' }}>
          Track your recruitment performance and optimize your hiring strategy
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1A1A1A', color: 'white', textAlign: 'center' }}>
            <CardContent>
              <WorkIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
              <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {overview.totalJobs}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Total Job Postings
              </Typography>
              <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                {overview.activeJobs} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1A1A1A', color: 'white', textAlign: 'center' }}>
            <CardContent>
              <PeopleIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
              <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {overview.totalApplications}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Total Applications
              </Typography>
              <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                {overview.newApplications} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1A1A1A', color: 'white', textAlign: 'center' }}>
            <CardContent>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
              <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                +{applicationTrends.growth}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Application Growth
              </Typography>
              <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1A1A1A', color: 'white', textAlign: 'center' }}>
            <CardContent>
              <AssessmentIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
              <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {Math.round(overview.totalApplications / overview.totalJobs)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Avg Applications/Job
              </Typography>
              <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                Industry avg: 15
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Application Trends"
              subheader="Monthly application volume"
              avatar={<TrendingUpIcon />}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">This Month</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {applicationTrends.thisMonth} applications
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#FFD700'
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Last Month</Typography>
                  <Typography variant="body2">
                    {applicationTrends.lastMonth} applications
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={56}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ccc'
                    }
                  }}
                />
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Chip
                  label={`+${applicationTrends.growth}% Growth`}
                  color="success"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Quick Stats"
              avatar={<AssessmentIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Response Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    68%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg. Time to Hire</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    14 days
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Top Source</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Direct Applications
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Quality Score</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    8.4/10
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Job Performance Table */}
      <Card>
        <CardHeader
          title="Job Performance"
          subheader="Individual job posting analytics"
          avatar={<VisibilityIcon />}
        />
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applications</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Views</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Conversion Rate</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobPerformance.map((job, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {job.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.applications}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.views}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        {Math.round((job.applications / job.views) * 100)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        size="small"
                        color={job.status === 'Active' ? 'success' : 'default'}
                        variant={job.status === 'Active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmployerAnalyticsPage;