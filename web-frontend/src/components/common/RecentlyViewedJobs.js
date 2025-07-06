import React, { useState, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RecentlyViewedJobs = ({ className = '', limit = 5 }) => {
  const [recentJobs, setRecentJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const loadRecentJobs = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewedJobs') || '[]');
      setRecentJobs(recent.slice(0, limit));
    } catch (error) {
      console.error('Error loading recent jobs:', error);
      setRecentJobs([]);
    }
  };

  const handleJobClick = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  const clearRecentJobs = () => {
    localStorage.removeItem('recentlyViewedJobs');
    setRecentJobs([]);
  };

  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaClock className="w-5 h-5 text-gray-500" />
          Recently Viewed
        </h3>
        <button
          onClick={clearRecentJobs}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        {recentJobs.map((job, index) => (
          <div
            key={`${job.id}-${index}`}
            onClick={() => handleJobClick(job)}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
          >
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.company?.logoUrl ? (
                <img
                  src={job.company.logoUrl}
                  alt={`${job.company.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaBuilding className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {job.title}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {job.company?.name || 'Company'}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span className="capitalize">
                    {job.type.replace('_', ' ').toLowerCase()}
                  </span>
                )}
              </div>
            </div>

            {/* View Time */}
            <div className="flex-shrink-0 text-xs text-gray-400">
              {job.viewedAt && (
                <span>{getTimeAgo(job.viewedAt)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Utility function to track job views
export const trackJobView = (job) => {
  try {
    const recentJobs = JSON.parse(localStorage.getItem('recentlyViewedJobs') || '[]');
    
    // Remove existing entry for this job if it exists
    const filteredJobs = recentJobs.filter(item => item.id !== job.id);
    
    // Add current job to the beginning with timestamp
    const updatedJobs = [
      {
        ...job,
        viewedAt: new Date().toISOString()
      },
      ...filteredJobs
    ].slice(0, 10); // Keep only last 10 jobs
    
    localStorage.setItem('recentlyViewedJobs', JSON.stringify(updatedJobs));
  } catch (error) {
    console.error('Error tracking job view:', error);
  }
};

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  const now = new Date();
  const viewed = new Date(dateString);
  const diffInMinutes = Math.floor((now - viewed) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return viewed.toLocaleDateString();
};

export default RecentlyViewedJobs;
