/**
 * Simple development logger utility
 * Provides consistent logging across the application
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log development messages
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export const logDev = (level = 'info', message = '', data = {}) => {
  if (!isDevelopment) return;

  const timestamp = new Date().toISOString();

  switch (level.toLowerCase()) {
    case 'error':
      console.error(`[${timestamp}] ERROR:`, message, data);
      break;
    case 'warn':
      console.warn(`[${timestamp}] WARN:`, message, data);
      break;
    case 'debug':
      console.debug(`[${timestamp}] DEBUG:`, message, data);
      break;
    case 'info':
    default:
      console.warn(`[${timestamp}] INFO:`, message, data);
      break;
  }
};

/**
 * Log API requests
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} data - Request/response data
 */
export const logApi = (method, url, data = {}) => {
  logDev('debug', `API ${method.toUpperCase()} ${url}`, data);
};

/**
 * Log user actions
 * @param {string} action - User action
 * @param {Object} data - Action data
 */
export const logUserAction = (action, data = {}) => {
  logDev('info', `User Action: ${action}`, data);
};

/**
 * Log errors with stack trace
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
export const logError = (error, context = '') => {
  logDev('error', `${context}: ${error.message}`, {
    stack: error.stack,
    name: error.name
  });
};

const logger = {
  logDev,
  logApi,
  logUserAction,
  logError
};

export default logger;
