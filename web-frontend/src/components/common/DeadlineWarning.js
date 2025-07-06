import React from 'react';
import { FaClock, FaExclamationTriangle, FaFireAlt } from 'react-icons/fa';

const DeadlineWarning = ({ job, className = '' }) => {
  // Check if job has a deadline
  if (!job.deadline && !job.applicationDeadline) {
    return null;
  }

  const deadline = new Date(job.deadline || job.applicationDeadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  // Don't show anything if deadline is more than 14 days away
  if (daysLeft > 14) {
    return null;
  }

  // Determine urgency level and styling
  let urgencyConfig;
  
  if (daysLeft <= 0) {
    urgencyConfig = {
      level: 'expired',
      text: 'Application deadline has passed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-600'
    };
  } else if (daysLeft === 1) {
    urgencyConfig = {
      level: 'critical',
      text: 'Last day to apply!',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: FaFireAlt,
      iconColor: 'text-red-600',
      pulse: true
    };
  } else if (daysLeft <= 3) {
    urgencyConfig = {
      level: 'urgent',
      text: `Only ${daysLeft} days left to apply`,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      icon: FaExclamationTriangle,
      iconColor: 'text-orange-600'
    };
  } else if (daysLeft <= 7) {
    urgencyConfig = {
      level: 'warning',
      text: `${daysLeft} days left to apply`,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      icon: FaClock,
      iconColor: 'text-yellow-600'
    };
  } else {
    urgencyConfig = {
      level: 'notice',
      text: `${daysLeft} days left to apply`,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: FaClock,
      iconColor: 'text-blue-600'
    };
  }

  const IconComponent = urgencyConfig.icon;

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border 
        ${urgencyConfig.bgColor} 
        ${urgencyConfig.textColor} 
        ${urgencyConfig.borderColor}
        ${urgencyConfig.pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <IconComponent 
        className={`w-4 h-4 flex-shrink-0 ${urgencyConfig.iconColor}`} 
      />
      <span className="text-sm font-medium">
        {urgencyConfig.text}
      </span>
      
      {/* Additional deadline info */}
      {daysLeft > 0 && (
        <span className="text-xs opacity-75 ml-auto">
          Due {deadline.toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

// Utility function to check if deadline is approaching for job cards
export const hasApproachingDeadline = (job) => {
  if (!job.deadline && !job.applicationDeadline) return false;
  
  const deadline = new Date(job.deadline || job.applicationDeadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  return daysLeft >= 0 && daysLeft <= 7;
};

// Utility function to get deadline urgency level
export const getDeadlineUrgency = (job) => {
  if (!job.deadline && !job.applicationDeadline) return null;
  
  const deadline = new Date(job.deadline || job.applicationDeadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (daysLeft <= 0) return 'expired';
  if (daysLeft === 1) return 'critical';
  if (daysLeft <= 3) return 'urgent';
  if (daysLeft <= 7) return 'warning';
  if (daysLeft <= 14) return 'notice';
  return null;
};

export default DeadlineWarning;
