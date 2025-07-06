import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { logDev } from '../utils/loggingUtils';

/**
 * Email Capture Hook
 * Manages timing and triggers for email capture modals
 */
const useEmailCapture = () => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [trigger, setTrigger] = useState('');
  const [searchContext, setSearchContext] = useState({});
  
  // Tracking refs
  const sessionStartTime = useRef(Date.now());
  const searchCount = useRef(0);
  const emptySearchCount = useRef(0);
  const exitIntentTriggered = useRef(false);
  const timeBasedTriggered = useRef(false);
  const modalShownThisSession = useRef(false);

  // Check if user has already subscribed (localStorage)
  const hasSubscribed = useCallback(() => {
    return localStorage.getItem('jamdung_email_subscribed') === 'true';
  }, []);

  // Mark user as subscribed
  const markAsSubscribed = useCallback(() => {
    localStorage.setItem('jamdung_email_subscribed', 'true');
    localStorage.setItem('jamdung_email_subscribed_date', new Date().toISOString());
  }, []);

  // Check if modal should be shown based on various conditions
  const shouldShowModal = useCallback(() => {
    // Don't show if authenticated user or already subscribed
    if (isAuthenticated || hasSubscribed() || modalShownThisSession.current) {
      return false;
    }

    // Don't show too early in the session
    const sessionDuration = Date.now() - sessionStartTime.current;
    if (sessionDuration < 10000) { // Wait at least 10 seconds
      return false;
    }

    return true;
  }, [isAuthenticated, hasSubscribed]);

  // Trigger email capture on empty search results
  const triggerOnEmptySearch = useCallback((searchData = {}) => {
    emptySearchCount.current += 1;
    
    logDev('info', 'Empty search detected', {
      count: emptySearchCount.current,
      searchData
    });

    // Show modal after 2nd empty search
    if (emptySearchCount.current >= 2 && shouldShowModal()) {
      setSearchContext(searchData);
      setTrigger('empty_search');
      setShowModal(true);
      modalShownThisSession.current = true;
      
      logDev('info', 'Email capture triggered: empty search', {
        emptySearchCount: emptySearchCount.current
      });
    }
  }, [shouldShowModal]);

  // Trigger email capture on exit intent
  const triggerOnExitIntent = useCallback((searchData = {}) => {
    if (exitIntentTriggered.current || !shouldShowModal()) {
      return;
    }

    exitIntentTriggered.current = true;
    setSearchContext(searchData);
    setTrigger('exit_intent');
    setShowModal(true);
    modalShownThisSession.current = true;
    
    logDev('info', 'Email capture triggered: exit intent');
  }, [shouldShowModal]);

  // Trigger email capture after time spent on site
  const triggerTimeBased = useCallback((searchData = {}) => {
    if (timeBasedTriggered.current || !shouldShowModal()) {
      return;
    }

    const sessionDuration = Date.now() - sessionStartTime.current;
    
    // Show after 2 minutes of browsing with some search activity
    if (sessionDuration > 120000 && searchCount.current >= 3) {
      timeBasedTriggered.current = true;
      setSearchContext(searchData);
      setTrigger('time_based');
      setShowModal(true);
      modalShownThisSession.current = true;
      
      logDev('info', 'Email capture triggered: time based', {
        sessionDuration: Math.round(sessionDuration / 1000),
        searchCount: searchCount.current
      });
    }
  }, [shouldShowModal]);

  // Track search activity
  const trackSearch = useCallback((searchData = {}) => {
    searchCount.current += 1;
    
    logDev('debug', 'Search tracked', {
      count: searchCount.current,
      hasQuery: !!searchData.query,
      hasLocation: !!searchData.location
    });

    // Check time-based trigger
    setTimeout(() => triggerTimeBased(searchData), 1000);
  }, [triggerTimeBased]);

  // Handle successful email capture
  const handleEmailCaptureSuccess = useCallback((data) => {
    markAsSubscribed();
    setShowModal(false);
    
    logDev('info', 'Email capture successful', {
      trigger: data.trigger,
      email: data.email ? `${data.email.substring(0, 3)}...` : 'unknown'
    });

    // Track conversion analytics here if needed
  }, [markAsSubscribed]);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    
    // Don't show again this session
    modalShownThisSession.current = true;
    
    logDev('info', 'Email capture modal closed', { trigger });
  }, [trigger]);

  // Set up exit intent detection
  useEffect(() => {
    let exitIntentTimeout;

    const handleMouseLeave = (e) => {
      // Only trigger if mouse leaves from the top of the page
      if (e.clientY <= 0 && !exitIntentTriggered.current) {
        exitIntentTimeout = setTimeout(() => {
          triggerOnExitIntent();
        }, 500); // Small delay to avoid false positives
      }
    };

    const handleMouseEnter = () => {
      if (exitIntentTimeout) {
        clearTimeout(exitIntentTimeout);
      }
    };

    // Only add listeners if not authenticated and not subscribed
    if (!isAuthenticated && !hasSubscribed()) {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (exitIntentTimeout) {
        clearTimeout(exitIntentTimeout);
      }
    };
  }, [isAuthenticated, hasSubscribed, triggerOnExitIntent]);

  // Session analytics
  const getSessionStats = useCallback(() => {
    return {
      sessionDuration: Math.round((Date.now() - sessionStartTime.current) / 1000),
      searchCount: searchCount.current,
      emptySearchCount: emptySearchCount.current,
      modalShown: modalShownThisSession.current,
      trigger,
      isAuthenticated,
      hasSubscribed: hasSubscribed()
    };
  }, [trigger, isAuthenticated, hasSubscribed]);

  return {
    // Modal state
    showModal,
    trigger,
    searchContext,
    
    // Actions
    triggerOnEmptySearch,
    triggerOnExitIntent,
    triggerTimeBased,
    trackSearch,
    closeModal,
    handleEmailCaptureSuccess,
    
    // Utilities
    shouldShowModal: shouldShowModal(),
    hasSubscribed: hasSubscribed(),
    getSessionStats
  };
};

export default useEmailCapture;
