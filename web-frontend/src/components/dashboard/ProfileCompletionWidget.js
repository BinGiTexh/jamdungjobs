import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ProfileEditModal from '../profile/ProfileEditModal';
import api from '../../utils/api';
import { logDev, logError } from '../../utils/loggingUtils';

const ProfileCompletionWidget = () => {
  const { } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobseeker profile data (same as in QuickApplyModal and CandidateDashboard)
      const response = await api.get('/api/jobseeker/profile');
      
      // Backend may return { success, data } wrapper or raw object – normalize it
      const userData = response.data?.data || response.data || {};
      const candidateData = userData.candidateProfile || userData.candidate_profile || {};
      
      // Normalize resumes – backend currently stores single resumeUrl/resumeFileName, but may use snake_case keys
      let resumes = [];
      if (Array.isArray(candidateData.resumes) && candidateData.resumes.length) {
        resumes = candidateData.resumes;
      } else {
        // support both camelCase and snake_case single-resume fields
        const singleResumeUrl = candidateData.resumeUrl || candidateData.resume_url;
        const singleResumeName = candidateData.resumeFileName || candidateData.resume_file_name;
        if (singleResumeUrl) {
          resumes = [{
            id: 'default',
            name: singleResumeName || 'Resume',
            uploadDate: candidateData.updatedAt || candidateData.updated_at || new Date().toISOString(),
            url: singleResumeUrl
          }];
        }
      }
      
      // Merge and normalize important fields 
      const mergedProfile = {
        ...candidateData,
        ...userData,
        resumes,
        // Normalized phone number field
        phoneNumber: candidateData.phoneNumber || candidateData.phone_number || userData.phoneNumber || userData.phone_number || userData.phone || '',
        // Normalized experience array
        experience: 
          candidateData.experience || 
          candidateData.experiences || 
          candidateData.workExperience || 
          candidateData.work_experience || 
          userData.experience || 
          userData.workExperience || 
          userData.work_experience || []
      };
      
      setProfileData(mergedProfile);
      
      logDev('debug', 'Profile data fetched for completion widget', {
        resumeCount: resumes.length,
        hasPhone: !!(mergedProfile.phoneNumber),
        hasSkills: !!(mergedProfile.skills && mergedProfile.skills.length > 0),
        hasEducation: !!(mergedProfile.education && mergedProfile.education.length > 0),
        hasExperience: !!(mergedProfile.experience && mergedProfile.experience.length > 0)
      });
      
    } catch (error) {
      logError('Failed to fetch profile data for completion widget', error, {
        module: 'ProfileCompletionWidget',
        function: 'fetchProfileData'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  const completionItems = [
    { 
      key: 'basicInfo', 
      label: 'Basic Information', 
      completed: !!(profileData?.firstName && profileData?.lastName && profileData?.email && profileData?.phoneNumber) 
    },
    { 
      key: 'resume', 
      label: 'Resume Upload', 
      completed: !!(profileData?.resumes && profileData?.resumes.length > 0) 
    },
    { 
      key: 'skills', 
      label: 'Skills & Experience', 
      completed: !!(profileData?.skills && profileData?.skills.length > 0) 
    },
    { 
      key: 'education', 
      label: 'Education', 
      completed: !!(profileData?.education && profileData?.education.length > 0) 
    },
    { 
      key: 'experience', 
      label: 'Work Experience', 
      completed: !!(profileData?.experience && 
        ((Array.isArray(profileData.experience) && profileData.experience.length > 0) ||
         (typeof profileData.experience === 'string' && profileData.experience.trim().length > 0))) 
    }
  ];
  
  const completionPercentage = (completionItems.filter(item => item.completed).length / completionItems.length) * 100;

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Profile Completion" 
        subheader={`${Math.round(completionPercentage)}% complete`}
      />
      <CardContent>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ 
            mb: 2, 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#FFD700'
            }
          }}
        />
        
        <List dense>
          {completionItems.map(item => (
            <ListItem key={item.key} disablePadding>
              <ListItemIcon>
                {item.completed ? 
                  <CheckCircleIcon sx={{ color: '#009921' }} /> : 
                  <RadioButtonUncheckedIcon sx={{ color: '#ccc' }} />
                }
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.completed ? 'Completed' : 'Pending'}
              />
              {!item.completed && (
                <IconButton size="small" onClick={() => setEditModalOpen(true)}>
                  <ArrowForwardIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
        
        <Button 
          fullWidth 
          variant="contained" 
          onClick={() => setEditModalOpen(true)}
          sx={{ 
            mt: 2,
            background: 'linear-gradient(45deg, #009639 30%, #FFD700 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #007A2E 30%, #E6C200 90%)'
            }
          }}
        >
          Complete Profile
        </Button>
      </CardContent>
      
      <ProfileEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={(_updatedData) => {
          // Refresh profile data after save
          fetchProfileData();
          setEditModalOpen(false);
        }}
      />
    </Card>
  );
};

export default ProfileCompletionWidget;
