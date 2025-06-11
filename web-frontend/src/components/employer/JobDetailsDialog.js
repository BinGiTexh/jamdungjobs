import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box
} from '@mui/material';
import JobListingForm from './JobListingForm';

const JobDetailsDialog = ({ open, onClose, job, onSave }) => {
  const handleSubmit = (formData) => {
    onSave(job ? { ...formData, id: job.id } : formData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ color: '#FFD700', textAlign: 'center' }}>
        {job ? 'Edit Job Listing' : 'Create New Job Listing'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <JobListingForm
            initialData={job}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
