import { useEffect } from 'react';

// Plausible Analytics Hook
export const usePlausible = () => {
  useEffect(() => {
    // Load Plausible script only in browser environment
    if (typeof window !== 'undefined') {
      const domain = process.env.REACT_APP_PLAUSIBLE_DOMAIN || 'localhost:3000';
      const apiHost = process.env.REACT_APP_PLAUSIBLE_API_HOST || 'http://localhost:8000';
      
      // Check if script is already loaded
      if (!document.querySelector('script[data-domain]')) {
        const script = document.createElement('script');
        script.defer = true;
        script.setAttribute('data-domain', domain);
        script.src = `${apiHost}/js/script.js`;
        
        // Add error handling
        script.onerror = () => {
          console.warn('Plausible Analytics failed to load');
        };
        
        document.head.appendChild(script);
      }
    }
  }, []);

  // Custom event tracking function
  const trackEvent = (eventName, props = {}) => {
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible(eventName, { props });
      } catch (error) {
        console.warn('Failed to track event:', eventName, error);
      }
    }
  };

  // Page view tracking (automatic via script)
  const trackPageView = (url = null) => {
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        if (url) {
          window.plausible('pageview', { u: url });
        } else {
          window.plausible('pageview');
        }
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    }
  };

  return {
    trackEvent,
    trackPageView
  };
};

// Specific tracking functions for JamDung Jobs
export const useJobAnalytics = () => {
  const { trackEvent } = usePlausible();

  const trackJobView = (jobId, jobTitle, location) => {
    trackEvent('Job View', {
      jobId,
      jobTitle,
      location,
      timestamp: new Date().toISOString()
    });
  };

  const trackJobApplication = (jobId, jobTitle, applicationSource) => {
    trackEvent('Job Application', {
      jobId,
      jobTitle,
      applicationSource,
      timestamp: new Date().toISOString()
    });
  };

  const trackJobSearch = (query, filters = {}) => {
    trackEvent('Job Search', {
      query,
      location: filters.location || '',
      jobType: filters.jobType || '',
      category: filters.category || '',
      resultsCount: filters.resultsCount || 0,
      timestamp: new Date().toISOString()
    });
  };

  const trackUserRegistration = (userRole) => {
    trackEvent('User Registration', {
      role: userRole,
      timestamp: new Date().toISOString()
    });
  };

  const trackUserLogin = (userRole) => {
    trackEvent('User Login', {
      role: userRole,
      timestamp: new Date().toISOString()
    });
  };

  const trackJobSave = (jobId, jobTitle) => {
    trackEvent('Job Saved', {
      jobId,
      jobTitle,
      timestamp: new Date().toISOString()
    });
  };

  const trackCompanyProfileView = (companyId, companyName) => {
    trackEvent('Company Profile View', {
      companyId,
      companyName,
      timestamp: new Date().toISOString()
    });
  };

  const trackResumeUpload = () => {
    trackEvent('Resume Upload', {
      timestamp: new Date().toISOString()
    });
  };

  const trackJobPosting = (jobId, jobTitle, isFeature = false) => {
    trackEvent('Job Posted', {
      jobId,
      jobTitle,
      featured: isFeature,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackJobView,
    trackJobApplication,
    trackJobSearch,
    trackUserRegistration,
    trackUserLogin,
    trackJobSave,
    trackCompanyProfileView,
    trackResumeUpload,
    trackJobPosting
  };
};