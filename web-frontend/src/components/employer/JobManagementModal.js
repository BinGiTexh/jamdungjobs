import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import JobPostingForm from './JobPostingForm';

const JobManagementModal = ({
  open,
  onClose,
  mode = 'create',
  jobData,
  onSave,
  applications = []
}) => {
  const [activeTab, setActiveTab] = React.useState(mode === 'create' ? 'edit' : 'applications');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'SHORTLISTED':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Job' : 'Manage Job'}
      </DialogTitle>

      <DialogContent>
        {mode !== 'create' && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Edit Job" value="edit" />
              <Tab 
                label={`Applications (${applications.length})`} 
                value="applications"
              />
            </Tabs>
          </Box>
        )}

        {activeTab === 'edit' && (
          <JobPostingForm
            mode={mode}
            initialData={jobData}
            onSubmit={onSave}
          />
        )}

        {activeTab === 'applications' && (
          <Box sx={{ mt: 2 }}>
            {applications.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No applications received yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {applications.map((application) => (
                  <Grid item xs={12} key={application.id}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Avatar>{application.user.firstName[0]}</Avatar>
                        </Grid>
                        <Grid item xs>
                          <Typography variant="subtitle1">
                            {application.user.firstName} {application.user.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {application.user.title}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={application.status}
                              color={getStatusColor(application.status)}
                            />
                          </Box>
                        </Grid>
                        <Grid item>
                          <Button
                            variant="outlined"
                            size="small"
                            href={application.resumeUrl}
                            target="_blank"
                            sx={{ mr: 1 }}
                          >
                            View Resume
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {}}
                          >
                            Review
                          </Button>
                        </Grid>
                      </Grid>
                      {application.coverLetter && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="textSecondary">
                            Cover Letter:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {application.coverLetter}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobManagementModal;
