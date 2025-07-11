const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += '\n' + JSON.stringify(meta, null, 2);
    }
    
    // Add stack trace for errors
    if (stack) {
      msg += '\n' + stack;
    }
    
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: fileFormat,
  defaultMeta: {
    service: 'jamdung-jobs-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file - only errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined log file - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Auth-specific log file
    new winston.transports.File({
      filename: path.join(logsDir, 'auth.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log auth-related events
          if (info.category === 'auth') {
            return info;
          }
          return false;
        })()
      )
    })
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Helper methods for specific use cases
logger.auth = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'auth' });
};

logger.apiRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    category: 'api'
  };
  
  // Add user info if authenticated
  if (req.user) {
    logData.userId = req.user.id;
    logData.userRole = req.user.role;
  }
  
  if (res.statusCode >= 400) {
    logger.warn(`API Request Failed: ${req.method} ${req.url}`, logData);
  } else {
    logger.info(`API Request: ${req.method} ${req.url}`, logData);
  }
};

logger.dbQuery = (query, duration, error = null) => {
  const logData = {
    query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
    duration: `${duration}ms`,
    category: 'database'
  };
  
  if (error) {
    logger.error('Database Query Failed', { ...logData, error: error.message });
  } else {
    logger.debug('Database Query', logData);
  }
};

logger.security = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    category: 'security',
    timestamp: new Date().toISOString()
  });
};

logger.payment = (event, details = {}) => {
  logger.info(`Payment Event: ${event}`, {
    ...details,
    category: 'payment'
  });
};

// Performance monitoring
logger.performance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation}`, {
    ...metadata,
    duration: `${duration}ms`,
    category: 'performance'
  });
};

// File upload logging
logger.upload = (event, fileInfo = {}) => {
  logger.info(`File Upload: ${event}`, {
    ...fileInfo,
    category: 'upload'
  });
};

// Express middleware for request logging
logger.middleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Override res.end to log when response is sent
    const originalEnd = res.end;
    res.end = function(...args) {
      const responseTime = Date.now() - start;
      logger.apiRequest(req, res, responseTime);
      originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = { logger };

