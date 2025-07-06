/**
 * Custom hook for personalized job recommendations
 * Manages user behavior tracking and recommendation generation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getUserBehavior, 
  trackSearch, 
  trackJobView, 
  getPersonalizedRecommendations,
  getTrendingSearches 
} from '../utils/behaviorTracker';

const usePersonalization = () => {
  const [behaviorData, setBehaviorData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user behavior data
   */
  const loadBehaviorData = useCallback(() => {
    try {
      setLoading(true);
      const data = getUserBehavior();
      setBehaviorData(data);
      
      const recs = getPersonalizedRecommendations();
      setRecommendations(recs);
      
      setLoading(false);
      console.warn('🤖 Personalization data loaded:', { data, recs });
    } catch (error) {
      console.error('Error loading behavior data:', error);
      setLoading(false);
    }
  }, []);

  /**
   * Track a search and update recommendations
   */
  const recordSearch = useCallback((searchFilters) => {
    try {
      trackSearch(searchFilters);
      
      // Reload behavior data to update recommendations
      setTimeout(() => {
        loadBehaviorData();
      }, 100);
      
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [loadBehaviorData]);

  /**
   * Track a job view and update recommendations
   */
  const recordJobView = useCallback((job) => {
    try {
      trackJobView(job);
      
      // Reload behavior data to update recommendations
      setTimeout(() => {
        loadBehaviorData();
      }, 100);
      
    } catch (error) {
      console.error('Error tracking job view:', error);
    }
  }, [loadBehaviorData]);

  /**
   * Get smart search suggestions based on user history
   */
  const getSearchSuggestions = useCallback((currentInput = '') => {
    if (!recommendations) return [];
    
    const suggestions = [];
    
    // Add suggestions from user's search history
    if (recommendations.suggestedKeywords) {
      recommendations.suggestedKeywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(currentInput.toLowerCase()) || currentInput === '') {
          suggestions.push({
            type: 'keyword',
            text: keyword,
            source: 'your_searches',
            icon: '🔍'
          });
        }
      });
    }
    
    // Add industry suggestions
    if (recommendations.preferredIndustries) {
      recommendations.preferredIndustries.forEach(industry => {
        if (industry.industry.toLowerCase().includes(currentInput.toLowerCase()) || currentInput === '') {
          suggestions.push({
            type: 'industry',
            text: industry.industry,
            source: 'preferred_industry',
            icon: '🏢',
            count: industry.count
          });
        }
      });
    }
    
    // Add location suggestions
    if (recommendations.frequentLocations) {
      recommendations.frequentLocations.forEach(location => {
        if (location.location.toLowerCase().includes(currentInput.toLowerCase()) || currentInput === '') {
          suggestions.push({
            type: 'location',
            text: location.location,
            source: 'frequent_location',
            icon: '📍',
            count: location.count
          });
        }
      });
    }
    
    // Add trending searches
    const trending = getTrendingSearches();
    trending.forEach(trend => {
      if (trend.term.toLowerCase().includes(currentInput.toLowerCase()) || currentInput === '') {
        suggestions.push({
          type: 'trending',
          text: trend.term,
          source: 'trending',
          icon: '🔥',
          count: trend.count
        });
      }
    });
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions.slice(0, 8);
  }, [recommendations]);

  /**
   * Get recommended job filters based on user behavior
   */
  const getRecommendedFilters = useCallback(() => {
    if (!recommendations) return {};
    
    const filters = {};
    
    // Suggest most used industry
    if (recommendations.preferredIndustries.length > 0) {
      filters.suggestedIndustry = recommendations.preferredIndustries[0].industry;
    }
    
    // Suggest most used location
    if (recommendations.frequentLocations.length > 0) {
      filters.suggestedLocation = recommendations.frequentLocations[0].location;
    }
    
    // Suggest most used job types
    if (recommendations.preferredJobTypes.length > 0) {
      filters.suggestedJobTypes = recommendations.preferredJobTypes.map(jt => jt.type);
    }
    
    return filters;
  }, [recommendations]);

  /**
   * Get personalized job recommendations
   */
  const getJobRecommendations = useCallback((allJobs = []) => {
    if (!recommendations || !allJobs.length) return [];
    
    const scoredJobs = allJobs.map(job => {
      let score = 0;
      
      // Score based on industry preference
      if (recommendations.preferredIndustries.some(pi => pi.industry === job.industry)) {
        const industryPref = recommendations.preferredIndustries.find(pi => pi.industry === job.industry);
        score += industryPref.count * 10;
      }
      
      // Score based on location preference
      if (recommendations.frequentLocations.some(fl => job.location?.includes(fl.location))) {
        const locationPref = recommendations.frequentLocations.find(fl => job.location?.includes(fl.location));
        score += locationPref.count * 5;
      }
      
      // Score based on job type preference
      if (recommendations.preferredJobTypes.some(jt => jt.type === job.jobType)) {
        const jobTypePref = recommendations.preferredJobTypes.find(jt => jt.type === job.jobType);
        score += jobTypePref.count * 3;
      }
      
      // Score based on keyword matches
      if (recommendations.suggestedKeywords.some(keyword => 
        job.title?.toLowerCase().includes(keyword) || 
        job.description?.toLowerCase().includes(keyword)
      )) {
        score += 5;
      }
      
      return { ...job, recommendationScore: score };
    });
    
    // Sort by score and return top recommendations
    return scoredJobs
      .filter(job => job.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);
  }, [recommendations]);

  /**
   * Get user activity insights
   */
  const getActivityInsights = useMemo(() => {
    if (!behaviorData) return null;
    
    return {
      totalSearches: behaviorData.totalSearches || 0,
      totalJobViews: behaviorData.totalJobViews || 0,
      topIndustry: behaviorData.preferredIndustries?.[0]?.industry || null,
      topLocation: behaviorData.locationHistory?.[0]?.location || null,
      activityLevel: recommendations?.activityLevel || 'new',
      memberSince: behaviorData.createdAt ? new Date(behaviorData.createdAt).toLocaleDateString() : null
    };
  }, [behaviorData, recommendations]);

  /**
   * Check if user is new (for onboarding)
   */
  const isNewUser = useMemo(() => {
    return !behaviorData || (behaviorData.totalSearches === 0 && behaviorData.totalJobViews === 0);
  }, [behaviorData]);

  /**
   * Get quick action suggestions
   */
  const getQuickActions = useCallback(() => {
    const actions = [];
    
    if (recommendations?.preferredIndustries?.length > 0) {
      actions.push({
        label: `${recommendations.preferredIndustries[0].industry} Jobs`,
        action: 'search_industry',
        value: recommendations.preferredIndustries[0].industry,
        icon: '🏢'
      });
    }
    
    if (recommendations?.frequentLocations?.length > 0) {
      actions.push({
        label: `Jobs in ${recommendations.frequentLocations[0].location}`,
        action: 'search_location',
        value: recommendations.frequentLocations[0].location,
        icon: '📍'
      });
    }
    
    if (recommendations?.preferredJobTypes?.length > 0) {
      actions.push({
        label: `${recommendations.preferredJobTypes[0].type} Jobs`,
        action: 'search_job_type',
        value: recommendations.preferredJobTypes[0].type,
        icon: '💼'
      });
    }
    
    // Add trending action
    const trending = getTrendingSearches();
    if (trending.length > 0) {
      actions.push({
        label: `${trending[0].term} (Trending)`,
        action: 'search_trending',
        value: trending[0].term,
        icon: '🔥'
      });
    }
    
    return actions.slice(0, 4);
  }, [recommendations]);

  // Load data on mount
  useEffect(() => {
    loadBehaviorData();
  }, [loadBehaviorData]);

  return {
    behaviorData,
    recommendations,
    loading,
    isNewUser,
    activityInsights: getActivityInsights,
    recordSearch,
    recordJobView,
    getSearchSuggestions,
    getRecommendedFilters,
    getJobRecommendations,
    getQuickActions,
    refreshRecommendations: loadBehaviorData
  };
};

export default usePersonalization;
