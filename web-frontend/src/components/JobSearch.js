import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box
} from '@mui/material';
import { LocationAutocomplete } from './common/LocationAutocomplete';
import { SkillsAutocomplete } from './common/SkillsAutocomplete';
import { JobTitleAutocomplete } from './common/JobTitleAutocomplete';
import { SalaryRangeAutocomplete } from './common/SalaryRangeAutocomplete';
import axios from 'axios';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    jobType: '',
    skills: [],
    salaryMin: 0,
    salaryMax: 300000,
    remote: false
  });
  const [loading, setLoading] = useState(false);

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs/search', { params: filters });
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchJobs();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <JobTitleAutocomplete
                value={filters.query}
                onChange={(value) => handleFilterChange('query', value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <LocationAutocomplete
                value={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {jobTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <SkillsAutocomplete
                value={filters.skills}
                onChange={(value) => handleFilterChange('skills', value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Salary Range</Typography>
              <SalaryRangeAutocomplete
                value={{ min: filters.salaryMin, max: filters.salaryMax }}
                onChange={(value) => {
                  handleFilterChange('salaryMin', value.min);
                  handleFilterChange('salaryMax', value.max);
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={searchJobs}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Jobs'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Job Results */}
      <Grid container spacing={3}>
        {jobs.map(job => (
          <Grid item xs={12} key={job.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" component="h2">
                      {job.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {job.company.name} • {job.location}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {job.skills.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" color="primary">
                      {typeof job.salary === 'object' 
                        ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                        : job.salary}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {job.type.replace('_', ' ')}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 1 }}
                      href={`/jobs/${job.id}`}
                    >
                      View Job
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobSearch;
