import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const JobPostingPerformance = () => {
  const navigate = useNavigate();
  const [jobStats, setJobStats] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        const response = await fetch(`http://localhost:5000/api/employer/jobs/performance?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobStats(data.jobs || []);
        } else {
          // Mock data for demo
          const mockJobs = [
            {
              id: 1,
              title: 'Senior Software Developer',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              views: 245,
              applications: 18,
              status: 'active'
            },
            {
              id: 2,
              title: 'Marketing Manager',
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              views: 156,
              applications: 12,
              status: 'active'
            },
            {
              id: 3,
              title: 'Data Analyst',
              createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              views: 89,
              applications: 6,
              status: 'closed'
            }
          ];
          setJobStats(mockJobs);
        }
      } catch (error) {
        console.error('Failed to fetch job performance stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobStats();
  }, [timeRange]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'closed': return 'default';
      case 'paused': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Job Posting Performance" 
        action={
          <FormControl size="small">
            <Select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        {jobStats.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Applications</TableCell>
                  <TableCell align="right">Conversion Rate</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobStats.map(job => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {job.views || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {job.applications || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {job.views > 0 ? ((job.applications / job.views) * 100).toFixed(1) : 0}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={job.status || 'active'} 
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              No job postings found for the selected time range.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => navigate('/employer/post-job')}
            >
              Post Your First Job
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobPostingPerformance;
