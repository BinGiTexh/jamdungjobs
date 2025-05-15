import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper
} from '@mui/material';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import { SalaryRangeAutocomplete } from '../common/SalaryRangeAutocomplete';

const JobPostingForm = ({ onSubmit, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    type: initialData?.type || 'FULL_TIME',
    skills: initialData?.skills || [],
    salary: initialData?.salary || { min: 0, max: 0, currency: 'USD' },
    experience: initialData?.experience || '',
    education: initialData?.education || '',
    status: initialData?.status || 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save job posting');
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
  const jobStatuses = ['DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED'];

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {mode === 'create' ? 'Create New Job Posting' : 'Edit Job Posting'}
            </Typography>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.title}
              onChange={handleChange('title')}
              required
              placeholder="e.g., Senior Software Engineer"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Job Description"
              value={formData.description}
              onChange={handleChange('description')}
              required
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </Grid>

          <Grid item xs={12}>
            <LocationAutocomplete
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Job Type"
                required
              >
                {jobTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange('status')}
                label="Status"
                required
              >
                {jobStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <SkillsAutocomplete
              value={formData.skills}
              onChange={(value) => setFormData(prev => ({ ...prev, skills: value }))}
            />
          </Grid>

          <Grid item xs={12}>
            <SalaryRangeAutocomplete
              value={formData.salary}
              onChange={(value) => setFormData(prev => ({ ...prev, salary: value }))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Experience Required"
              value={formData.experience}
              onChange={handleChange('experience')}
              placeholder="e.g., 5+ years of experience"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Education Required"
              value={formData.education}
              onChange={handleChange('education')}
              placeholder="e.g., Bachelor's degree in Computer Science"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Job' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default JobPostingForm;
