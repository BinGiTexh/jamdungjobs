import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Avatar,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  BookmarkBorder as SaveIcon,
  Bookmark as SavedIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  Business as CompanyIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

/**
 * Job Card Component
 * Displays job information with skill matching and save functionality
 */
const JobCard = ({ 
  job, 
  isSaved = false, 
  onSave, 
  onSelect,
  showSkillMatch = false,
  userSkills = [],
  variant = 'default' // 'default', 'compact', 'featured'
}) => {

  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  // Calculate skill match percentage
  const calculateSkillMatch = () => {
    if (!showSkillMatch || !userSkills.length || !job.skills?.length) {
      return 0;
    }

    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    const jobSkillsLower = job.skills.map(skill => skill.toLowerCase());
    
    const matchingSkills = jobSkillsLower.filter(skill => 
      userSkillsLower.includes(skill)
    );

    return Math.round((matchingSkills.length / jobSkillsLower.length) * 100);
  };

  // Get skill match color
  const getSkillMatchColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    if (percentage >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  // Format salary
  const formatSalary = (min, max, currency = 'JMD') => {
    const formatAmount = (amount) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
      }
      return amount.toString();
    };

    if (min && max) {
      return `${currency} ${formatAmount(min)} - ${formatAmount(max)}`;
    } else if (min) {
      return `${currency} ${formatAmount(min)}+`;
    } else if (max) {
      return `Up to ${currency} ${formatAmount(max)}`;
    }
    return 'Salary not specified';
  };

  // Get job type color
  const getJobTypeColor = (type) => {
    const colors = {
      'FULL_TIME': '#4CAF50',
      'PART_TIME': '#FF9800',
      'CONTRACT': '#2196F3',
      'TEMPORARY': '#9C27B0',
      'INTERNSHIP': '#00BCD4',
      'FREELANCE': '#795548'
    };
    return colors[type] || '#757575';
  };

  // Handle job click
  const handleJobClick = () => {
    if (onSelect) {
      onSelect(job);
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  // Handle company click
  const handleCompanyClick = (e) => {
    e.stopPropagation();
    navigate(`/companies/${job.company?.id || job.companyId}`);
  };

  const skillMatchPercentage = calculateSkillMatch();
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card
      sx={{
        backgroundColor: isFeatured 
          ? 'rgba(255, 215, 0, 0.1)' 
          : 'rgba(20, 20, 20, 0.9)',
        border: isFeatured 
          ? '2px solid #FFD700' 
          : '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 8px 25px rgba(255, 215, 0, 0.2)' 
          : '0 2px 10px rgba(0, 0, 0, 0.3)',
        '&:hover': {
          borderColor: '#FFD700',
          backgroundColor: isFeatured 
            ? 'rgba(255, 215, 0, 0.15)' 
            : 'rgba(30, 30, 30, 0.9)'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleJobClick}
    >
      <CardContent sx={{ p: isCompact ? 2 : 3 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            {/* Job Title */}
            <Typography 
              variant={isCompact ? "h6" : "h5"} 
              sx={{ 
                color: '#FFD700',
                fontWeight: 600,
                mb: 1,
                lineHeight: 1.2
              }}
            >
              {job.title}
              {isFeatured && (
                <Chip
                  label="Featured"
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: '#FFD700',
                    color: '#000',
                    fontWeight: 600
                  }}
                />
              )}
            </Typography>

            {/* Company Info */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={handleCompanyClick}
            >
              <Avatar
                src={job.company?.logo}
                sx={{ 
                  width: isCompact ? 24 : 32, 
                  height: isCompact ? 24 : 32,
                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                }}
              >
                <CompanyIcon sx={{ color: '#FFD700' }} />
              </Avatar>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'white',
                  fontWeight: 500,
                  '&:hover': { color: '#FFD700' }
                }}
              >
                {job.company?.name || job.companyName}
              </Typography>
              {job.company?.verified && (
                <Tooltip title="Verified Company">
                  <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>

            {/* Location and Job Type */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flexWrap: 'wrap',
              mb: isCompact ? 1 : 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {job.location || 'Remote'}
                </Typography>
              </Box>
              
              <Chip
                label={job.type?.replace('_', ' ') || 'Full-time'}
                size="small"
                sx={{
                  backgroundColor: getJobTypeColor(job.type),
                  color: 'white',
                  fontWeight: 500
                }}
              />

              {job.remote && (
                <Chip
                  label="Remote"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    color: '#4CAF50',
                    border: '1px solid #4CAF50'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              sx={{
                color: isSaved ? '#FFD700' : 'rgba(255, 255, 255, 0.6)',
                '&:hover': {
                  color: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              {isSaved ? <SavedIcon /> : <SaveIcon />}
            </IconButton>

            {!isCompact && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <TimeIcon sx={{ fontSize: 12 }} />
                {formatDistanceToNow(new Date(job.createdAt || job.postedAt), { addSuffix: true })}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Job Description */}
        {!isCompact && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {job.description}
          </Typography>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#FFD700',
                fontWeight: 600,
                mb: 1,
                display: 'block'
              }}
            >
              Required Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {job.skills.slice(0, isCompact ? 3 : 6).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 215, 0, 0.5)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.75rem'
                  }}
                />
              ))}
              {job.skills.length > (isCompact ? 3 : 6) && (
                <Chip
                  label={`+${job.skills.length - (isCompact ? 3 : 6)} more`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    color: '#FFD700',
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Skill Match */}
        {showSkillMatch && skillMatchPercentage > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 0.5
            }}>
              <Typography 
                variant="caption" 
                sx={{ color: '#FFD700', fontWeight: 600 }}
              >
                Skill Match
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: getSkillMatchColor(skillMatchPercentage),
                  fontWeight: 600
                }}
              >
                {skillMatchPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skillMatchPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getSkillMatchColor(skillMatchPercentage),
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Footer */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Salary */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SalaryIcon sx={{ color: '#FFD700', fontSize: 18 }} />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#FFD700',
                fontWeight: 600
              }}
            >
              {formatSalary(job.salaryMin, job.salaryMax)}
            </Typography>
          </Box>

          {/* Additional Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {job.applicantCount && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }} />
                <Typography 
                  variant="caption" 
                  sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {job.applicantCount} applicants
                </Typography>
              </Box>
            )}

            {/* Apply Button */}
            <Button
              variant="contained"
              size={isCompact ? "small" : "medium"}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${job.id}/apply`);
              }}
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#FFA000',
                  transform: 'scale(1.05)'
                }
              }}
            >
              Apply Now
            </Button>
          </Box>
        </Box>

        {/* Urgency Indicator */}
        {job.urgent && (
          <Box sx={{ 
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: '#F44336',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            URGENT
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
