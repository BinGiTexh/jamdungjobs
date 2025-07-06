import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';

const JobCard = ({ job }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="img"
            src={job.companyLogo}
            alt={job.companyName}
            sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: 1,
              mr: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {job.companyName}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<LocationOnIcon />}
            label={job.location}
            size="small"
            sx={{ bgcolor: 'primary.light' }}
          />
          <Chip
            icon={<WorkIcon />}
            label={job.type}
            size="small"
            sx={{ bgcolor: 'secondary.light' }}
          />
          <Chip
            icon={<AttachMoneyIcon />}
            label={job.salary}
            size="small"
            sx={{ bgcolor: 'success.light' }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {job.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {job.skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main'
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const JobListings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [salaryRange, setSalaryRange] = useState([30000, 150000]);

  // Mock data
  const jobs = [
    {
      id: 1,
      title: 'Senior Software Developer',
      companyName: 'Tech Jamaica Ltd',
      companyLogo: '/images/company1.png',
      location: 'Kingston',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      description: 'Looking for an experienced developer to join our growing team...',
      skills: ['React', 'Node.js', 'PostgreSQL']
    }
    // Add more mock jobs...
  ];

  const FilterSection = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Salary Range</Typography>
        <Slider
          value={salaryRange}
          onChange={(e, newValue) => setSalaryRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={200000}
          valueLabelFormat={(value) => `$${value.toLocaleString()}`}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Job Type</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Full-time" />
          <FormControlLabel control={<Checkbox />} label="Part-time" />
          <FormControlLabel control={<Checkbox />} label="Contract" />
          <FormControlLabel control={<Checkbox />} label="Remote" />
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Experience Level</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Entry Level" />
          <FormControlLabel control={<Checkbox />} label="Mid Level" />
          <FormControlLabel control={<Checkbox />} label="Senior Level" />
        </FormGroup>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Your Next Opportunity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search jobs..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Location..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            {isMobile ? (
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filters
              </Button>
            ) : (
              <Button fullWidth variant="contained">
                Search
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <FilterSection />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 280 }}>
          <FilterSection />
        </Box>
      </Drawer>
    </Container>
  );
};

export default JobListings;
