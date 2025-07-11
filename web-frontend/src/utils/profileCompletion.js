/**
 * Profile Completion Utility
 * Provides consistent profile completion calculation across the application
 */

/**
 * Calculate profile completion percentage based on required fields
 * @param {Object} profileData - User profile data
 * @returns {Object} - { percentage: number, completedFields: Array, missingFields: Array }
 */
export const calculateProfileCompletion = (profileData) => {
  console.log('🔍 calculateProfileCompletion called with:', profileData);
  
  if (!profileData) {
    console.log('❌ No profile data provided');
    return {
      percentage: 0,
      completedFields: [],
      missingFields: ['Basic Information', 'Professional Bio', 'Resume Upload', 'Skills', 'Education', 'Work Experience']
    };
  }

  // Check both direct fields and candidateProfile nested fields
  const candidate = profileData?.candidateProfile || {};
  
  const completionItems = [
    { 
      key: 'basicInfo', 
      label: 'Basic Information', 
      completed: !!(profileData?.firstName && profileData?.lastName && profileData?.email && (profileData?.phoneNumber || profileData?.phone_number)),
      fields: ['firstName', 'lastName', 'email', 'phoneNumber'],
      debug: {
        firstName: profileData?.firstName,
        lastName: profileData?.lastName,
        email: profileData?.email,
        phoneNumber: profileData?.phoneNumber || profileData?.phone_number
      }
    },
    { 
      key: 'bio', 
      label: 'Professional Bio', 
      completed: !!(
        (profileData?.bio && profileData.bio.trim().length > 0) ||
        (candidate?.bio && candidate.bio.trim().length > 0)
      ),
      fields: ['bio'],
      debug: {
        profileBio: profileData?.bio,
        candidateBio: candidate?.bio
      }
    },
    { 
      key: 'resume', 
      label: 'Resume Upload', 
      completed: !!(
        (profileData?.resumes && profileData.resumes.length > 0) ||
        (candidate?.resumeUrl) ||
        (profileData?.resumeUrl) ||
        (candidate?.resume)
      ),
      fields: ['resume'],
      debug: {
        resumes: profileData?.resumes,
        candidateResumeUrl: candidate?.resumeUrl,
        resumeUrl: profileData?.resumeUrl,
        candidateResume: candidate?.resume
      }
    },
    { 
      key: 'skills', 
      label: 'Skills', 
      completed: !!(
        (profileData?.skills && (
          (Array.isArray(profileData.skills) && profileData.skills.length > 0) ||
          (typeof profileData.skills === 'string' && profileData.skills.trim().length > 0)
        )) ||
        (candidate?.skills && (
          (Array.isArray(candidate.skills) && candidate.skills.length > 0) ||
          (typeof candidate.skills === 'string' && candidate.skills.trim().length > 0)
        ))
      ),
      fields: ['skills'],
      debug: {
        profileSkills: profileData?.skills,
        candidateSkills: candidate?.skills
      }
    },
    { 
      key: 'education', 
      label: 'Education', 
      completed: !!(
        (profileData?.education && (
          (Array.isArray(profileData.education) && profileData.education.length > 0) ||
          (typeof profileData.education === 'string' && profileData.education.trim().length > 0)
        )) ||
        (candidate?.education && (
          (Array.isArray(candidate.education) && candidate.education.length > 0) ||
          (typeof candidate.education === 'string' && candidate.education.trim().length > 0)
        ))
      ),
      fields: ['education'],
      debug: {
        profileEducation: profileData?.education,
        candidateEducation: candidate?.education
      }
    },
    { 
      key: 'experience', 
      label: 'Work Experience', 
      completed: !!(
        (profileData?.experience && (
          (Array.isArray(profileData.experience) && profileData.experience.length > 0) ||
          (typeof profileData.experience === 'string' && profileData.experience.trim().length > 0)
        )) ||
        (candidate?.experience && (
          (Array.isArray(candidate.experience) && candidate.experience.length > 0) ||
          (typeof candidate.experience === 'string' && candidate.experience.trim().length > 0)
        )) ||
        (profileData?.workExperience && (
          (Array.isArray(profileData.workExperience) && profileData.workExperience.length > 0) ||
          (typeof profileData.workExperience === 'string' && profileData.workExperience.trim().length > 0)
        )) ||
        (candidate?.workExperience && (
          (Array.isArray(candidate.workExperience) && candidate.workExperience.length > 0) ||
          (typeof candidate.workExperience === 'string' && candidate.workExperience.trim().length > 0)
        ))
      ),
      fields: ['workExperience'],
      debug: {
        profileExperience: profileData?.experience,
        candidateExperience: candidate?.experience,
        profileWorkExperience: profileData?.workExperience,
        candidateWorkExperience: candidate?.workExperience
      }
    }
  ];
  
  const completedFields = completionItems.filter(item => item.completed);
  const missingFields = completionItems.filter(item => !item.completed);
  const percentage = Math.round((completedFields.length / completionItems.length) * 100);

  // Debug logging
  console.log('📊 Profile completion calculation:', {
    completionItems: completionItems.map(item => ({
      key: item.key,
      label: item.label,
      completed: item.completed,
      fields: item.fields,
      debug: item.debug
    })),
    completedFields: completedFields.map(item => item.label),
    missingFields: missingFields.map(item => item.label),
    percentage
  });

  return {
    percentage,
    completedFields: completedFields.map(item => item.label),
    missingFields: missingFields.map(item => item.label),
    totalFields: completionItems.length,
    completedCount: completedFields.length
  };
};

/**
 * Get missing fields for display in completion prompts
 * @param {Object} profileData - User profile data
 * @returns {Array} - Array of missing field labels
 */
export const getMissingProfileFields = (profileData) => {
  const { missingFields } = calculateProfileCompletion(profileData);
  return missingFields;
};

/**
 * Check if profile is complete enough for job applications
 * @param {Object} profileData - User profile data
 * @param {number} minimumPercentage - Minimum completion percentage (default: 60)
 * @returns {boolean} - True if profile meets minimum requirements
 */
export const isProfileReadyForApplications = (profileData, minimumPercentage = 60) => {
  const { percentage } = calculateProfileCompletion(profileData);
  return percentage >= minimumPercentage;
};