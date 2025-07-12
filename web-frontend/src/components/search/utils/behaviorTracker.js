/**
 * User behavior tracking utilities for personalized job recommendations
 * Stores user preferences and search patterns in localStorage
 */

const STORAGE_KEYS = {
  USER_BEHAVIOR: 'jamdung_user_behavior',
  SEARCH_HISTORY: 'jamdung_search_history',
  VIEWED_JOBS: 'jamdung_viewed_jobs',
  PREFERENCES: 'jamdung_preferences'
};

/**
 * Get user behavior data from localStorage
 * @returns {Object} User behavior data
 */
export const getUserBehavior = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
    return stored ? JSON.parse(stored) : getDefaultBehavior();
  } catch (error) {
    console.warn('Error reading user behavior:', error);
    return getDefaultBehavior();
  }
};

/**
 * Get default behavior structure
 * @returns {Object} Default behavior object
 */
const getDefaultBehavior = () => ({
  viewedJobs: [],
  searchHistory: [],
  preferredIndustries: [],
  locationHistory: [],
  jobTypePreferences: [],
  salaryRangeHistory: [],
  lastActivity: null,
  totalSearches: 0,
  totalJobViews: 0,
  createdAt: new Date().toISOString()
});

/**
 * Save user behavior data to localStorage
 * @param {Object} behaviorData - Behavior data to save
 */
export const saveBehaviorData = (behaviorData) => {
  try {
    const dataToSave = {
      ...behaviorData,
      lastActivity: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USER_BEHAVIOR, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn('Error saving user behavior:', error);
  }
};

/**
 * Track a job search
 * @param {Object} searchFilters - Search filters used
 */
export const trackSearch = (searchFilters) => {
  const behavior = getUserBehavior();
  
  // Add to search history (keep last 50)
  const searchEntry = {
    filters: searchFilters,
    timestamp: new Date().toISOString()
  };
  
  behavior.searchHistory = [searchEntry, ...behavior.searchHistory].slice(0, 50);
  behavior.totalSearches += 1;
  
  // Track industry preferences
  if (searchFilters.industry && searchFilters.industry !== '') {
    trackIndustryPreference(behavior, searchFilters.industry);
  }
  
  // Track location preferences
  if (searchFilters.location && searchFilters.location !== '') {
    trackLocationPreference(behavior, searchFilters.location);
  }
  
  // Track job type preferences
  if (searchFilters.jobTypes && searchFilters.jobTypes.length > 0) {
    trackJobTypePreferences(behavior, searchFilters.jobTypes);
  }
  
  // Track salary range preferences
  if (searchFilters.salary && searchFilters.salary.min && searchFilters.salary.max) {
    trackSalaryRangePreference(behavior, searchFilters.salary);
  }
  
  saveBehaviorData(behavior);
  
  console.warn('🔍 Search tracked:', searchFilters);
};

/**
 * Track a job view
 * @param {Object} job - Job object that was viewed
 */
export const trackJobView = (job) => {
  const behavior = getUserBehavior();
  
  const viewEntry = {
    jobId: job.id,
    title: job.title,
    company: job.company,
    industry: job.industry,
    location: job.location,
    timestamp: new Date().toISOString()
  };
  
  // Add to viewed jobs (keep last 100)
  behavior.viewedJobs = [viewEntry, ...behavior.viewedJobs].slice(0, 100);
  behavior.totalJobViews += 1;
  
  // Track industry preference from job views
  if (job.industry) {
    trackIndustryPreference(behavior, job.industry);
  }
  
  saveBehaviorData(behavior);
  
  console.warn('👀 Job view tracked:', job.title);
};

/**
 * Track industry preference
 * @param {Object} behavior - Current behavior data
 * @param {string} industry - Industry to track
 */
const trackIndustryPreference = (behavior, industry) => {
  const existing = behavior.preferredIndustries.find(p => p.industry === industry);
  
  if (existing) {
    existing.count += 1;
    existing.lastUsed = new Date().toISOString();
  } else {
    behavior.preferredIndustries.push({
      industry,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }
  
  // Sort by count and keep top 10
  behavior.preferredIndustries = behavior.preferredIndustries
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

/**
 * Track location preference
 * @param {Object} behavior - Current behavior data
 * @param {string} location - Location to track
 */
const trackLocationPreference = (behavior, location) => {
  const existing = behavior.locationHistory.find(l => l.location === location);
  
  if (existing) {
    existing.count += 1;
    existing.lastUsed = new Date().toISOString();
  } else {
    behavior.locationHistory.push({
      location,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }
  
  // Sort by count and keep top 10
  behavior.locationHistory = behavior.locationHistory
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

/**
 * Track job type preferences
 * @param {Object} behavior - Current behavior data
 * @param {Array} jobTypes - Job types to track
 */
const trackJobTypePreferences = (behavior, jobTypes) => {
  jobTypes.forEach(jobType => {
    const existing = behavior.jobTypePreferences.find(j => j.type === jobType);
    
    if (existing) {
      existing.count += 1;
      existing.lastUsed = new Date().toISOString();
    } else {
      behavior.jobTypePreferences.push({
        type: jobType,
        count: 1,
        lastUsed: new Date().toISOString()
      });
    }
  });
  
  // Sort by count and keep top 10
  behavior.jobTypePreferences = behavior.jobTypePreferences
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

/**
 * Track salary range preference
 * @param {Object} behavior - Current behavior data
 * @param {Object} salaryRange - Salary range to track
 */
const trackSalaryRangePreference = (behavior, salaryRange) => {
  const rangeEntry = {
    min: salaryRange.min,
    max: salaryRange.max,
    timestamp: new Date().toISOString()
  };
  
  behavior.salaryRangeHistory = [rangeEntry, ...behavior.salaryRangeHistory].slice(0, 20);
};

/**
 * Get personalized recommendations based on user behavior
 * @returns {Object} Recommendation data
 */
export const getPersonalizedRecommendations = () => {
  const behavior = getUserBehavior();
  
  return {
    preferredIndustries: behavior.preferredIndustries.slice(0, 5),
    frequentLocations: behavior.locationHistory.slice(0, 5),
    preferredJobTypes: behavior.jobTypePreferences.slice(0, 3),
    recentSearches: behavior.searchHistory.slice(0, 5),
    suggestedKeywords: extractKeywordsFromHistory(behavior.searchHistory),
    activityLevel: getActivityLevel(behavior)
  };
};

/**
 * Extract popular keywords from search history
 * @param {Array} searchHistory - Array of search entries
 * @returns {Array} Popular keywords
 */
const extractKeywordsFromHistory = (searchHistory) => {
  const keywordCounts = {};
  
  searchHistory.forEach(search => {
    if (search.filters.keywords) {
      const keywords = search.filters.keywords.toLowerCase().split(/[\s,]+/);
      keywords.forEach(keyword => {
        if (keyword.length > 2) { // Ignore very short words
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);
};

/**
 * Get user activity level
 * @param {Object} behavior - User behavior data
 * @returns {string} Activity level (new, casual, active, power)
 */
const getActivityLevel = (behavior) => {
  const totalActivity = behavior.totalSearches + behavior.totalJobViews;
  
  if (totalActivity === 0) return 'new';
  if (totalActivity < 10) return 'casual';
  if (totalActivity < 50) return 'active';
  return 'power';
};

/**
 * Clear all user behavior data
 */
export const clearBehaviorData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.warn('🧹 User behavior data cleared');
  } catch (error) {
    console.warn('Error clearing behavior data:', error);
  }
};

/**
 * Get trending searches (mock data for Phase 2)
 * In production, this would come from analytics
 */
export const getTrendingSearches = () => [
  { term: 'teacher', count: 245 },
  { term: 'nurse', count: 189 },
  { term: 'driver', count: 156 },
  { term: 'security guard', count: 134 },
  { term: 'customer service', count: 123 },
  { term: 'sales representative', count: 98 },
  { term: 'receptionist', count: 87 },
  { term: 'accountant', count: 76 }
];

const behaviorTracker = {
  getUserBehavior,
  saveBehaviorData,
  trackSearch,
  trackJobView,
  getPersonalizedRecommendations,
  clearBehaviorData,
  getTrendingSearches
};

export default behaviorTracker;
