/**
 * Logging utilities for JamDung Jobs application
 * 
 * This file contains utility functions for consistent logging
 * that respect the current environment (development vs production)
 */

/**
 * Log messages only in development environment
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {*} args - Arguments to log
 */
export const logDev = (level, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // Validate log level and provide fallback
    const validLevels = ['debug', 'info', 'warn', 'error', 'log'];
    const logLevel = validLevels.includes(level) ? level : 'log';
    
    // Use console.log as fallback for debug level since it might not exist in all browsers
    if (logLevel === 'debug' && typeof console.debug !== 'function') { // eslint-disable-line no-console
      console.log('[DEBUG]', ...args); // eslint-disable-line no-console
    } else {
      console[logLevel](...args); // eslint-disable-line no-console
    }
  }
};

/**
 * Log errors in all environments, but with better formatting
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or details
 * @param {Object} context - Additional context
 */
export const logError = (message, error, context = {}) => {
  // Always log errors in all environments, but with controlled detail
  if (error instanceof Error) {
    console.error(`${message}: ${error.message}`, { 
      ...context,
      // Only include stack trace in development
      ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {})
    });
  } else {
    console.error(message, error, context);
  }
};

/**
 * Format object for logging, removing sensitive data
 * @param {Object} obj - Object to format
 * @param {Array} sensitiveKeys - Keys to redact
 * @returns {Object} Sanitized object copy
 */
export const sanitizeForLogging = (obj, sensitiveKeys = ['password', 'token', 'auth']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  sensitiveKeys.forEach(key => {
    if (key in result) {
      result[key] = '[REDACTED]';
    }
  });
  
  return result;
};

