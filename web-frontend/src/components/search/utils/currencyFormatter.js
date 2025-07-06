/**
 * Currency formatting utilities for Jamaican Dollar (JMD)
 * Handles salary ranges and formatting for job search filters
 */

/**
 * Format JMD currency with proper comma separation
 * @param {number} amount - The amount to format
 * @param {boolean} showCurrency - Whether to show JMD prefix
 * @returns {string} Formatted currency string
 */
export const formatJMD = (amount, showCurrency = true) => {
  if (!amount || isNaN(amount)) return showCurrency ? 'JMD 0' : '0';
  
  const formatted = new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return showCurrency ? `JMD ${formatted}` : formatted;
};

/**
 * Parse JMD string back to number
 * @param {string} jmdString - JMD formatted string
 * @returns {number} Parsed number
 */
export const parseJMD = (jmdString) => {
  if (!jmdString) return 0;
  
  // Remove JMD prefix and commas
  const cleanString = jmdString.replace(/JMD\s?|,/g, '');
  const parsed = parseInt(cleanString, 10);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format salary range for display
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {boolean} showUnspecified - Whether to show "Not specified" option
 * @returns {string} Formatted salary range
 */
export const formatSalaryRange = (min, max, showUnspecified = false) => {
  if (showUnspecified) {
    return 'Salary not specified';
  }
  
  if (min === max) {
    return formatJMD(min);
  }
  
  if (max >= 1000000) {
    return `${formatJMD(min)} - ${formatJMD(1000000)}+`;
  }
  
  return `${formatJMD(min)} - ${formatJMD(max)}`;
};

/**
 * Get salary range presets for quick selection
 * @returns {Array} Array of salary range objects
 */
export const getSalaryPresets = () => [
  { label: 'Entry Level', min: 30000, max: 80000 },
  { label: 'Mid Level', min: 80000, max: 200000 },
  { label: 'Senior Level', min: 200000, max: 500000 },
  { label: 'Executive', min: 500000, max: 1000000 },
  { label: 'All Salaries', min: 30000, max: 1000000 }
];

/**
 * Validate salary range input
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {Object} Validation result with isValid and error message
 */
export const validateSalaryRange = (min, max) => {
  if (min < 0 || max < 0) {
    return { isValid: false, error: 'Salary cannot be negative' };
  }
  
  if (min > max) {
    return { isValid: false, error: 'Minimum salary cannot be greater than maximum' };
  }
  
  if (min < 10000) {
    return { isValid: false, error: 'Minimum salary seems too low for Jamaica' };
  }
  
  if (max > 10000000) {
    return { isValid: false, error: 'Maximum salary seems unrealistic' };
  }
  
  return { isValid: true, error: null };
};

export default {
  formatJMD,
  parseJMD,
  formatSalaryRange,
  getSalaryPresets,
  validateSalaryRange
};
