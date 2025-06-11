const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const path = require('path');

// Import routes and middleware
const { authenticateJWT, checkRole } = require('../backend/middleware/auth');
const authRouter = require('../backend/routes/auth.routes');
const createJobseekerRouter = require('../backend/routes/jobseeker.routes');
const createEmployerRouter = require('../backend/routes/employer.routes');
const createCompaniesRouter = require('../backend/routes/companies.routes');
const notificationsRouter = require('../backend/routes/notifications.routes');

// Route mounting logger
const logRouteMount = (path) => {
  console.log(`Mounting routes at: ${path}`);
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "local_development_secret_32_characters_minimum";

// Initialize Express app and Prisma client
const app = express();
const prisma = global.prisma || new PrismaClient();
if (!global.prisma) global.prisma = prisma;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
logRouteMount('/api/auth');
app.use('/api/auth', authRouter);

// Mount jobseeker routes with authentication
logRouteMount('/api/jobseeker');
const jobseekerRouter = createJobseekerRouter(prisma);
app.use('/api/jobseeker', authenticateJWT, (req, res, next) => {
  if (req.user.role !== 'JOBSEEKER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User is not a jobseeker',
      code: 'INVALID_ROLE'
    });
  }
  next();
}, jobseekerRouter);

// Mount employer routes with authentication and role check
logRouteMount('/api/employer');
const employerRouter = createEmployerRouter(prisma);
app.use('/api/employer', authenticateJWT, (req, res, next) => {
  if (req.user.role !== 'EMPLOYER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User is not an employer',
      code: 'INVALID_ROLE'
    });
  }
  next();
}, employerRouter);

// Mount company routes with authentication and employer role check
logRouteMount('/api/companies');
const companiesRouter = createCompaniesRouter(prisma);
app.use('/api/companies', authenticateJWT, (req, res, next) => {
  if (req.user.role !== 'EMPLOYER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User is not an employer',
      code: 'INVALID_ROLE'
    });
  }
  next();
}, companiesRouter);

// Mount notifications routes with authentication
logRouteMount('/api/notifications');
app.use('/api/notifications', authenticateJWT, notificationsRouter(prisma));

// Error handling middleware
// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Resource already exists',
      code: 'RESOURCE_EXISTS'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown handler
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize database connection and start server
async function initializeServer() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`JWT_SECRET length: ${JWT_SECRET.length} characters`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

// Start the server
initializeServer();
