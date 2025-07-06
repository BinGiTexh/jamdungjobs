require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const serveIndex = require("serve-index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "local_development_secret_32_characters_minimum";

// Import routes and middleware
const { body, validationResult } = require('express-validator');
const authRouter = require("./routes/auth.routes");
const createJobseekerRouter = require("./routes/jobseeker.routes");
const createEmployerRouter = require("./routes/employer.routes");
const createCompaniesRouter = require("./routes/companies.routes");
const createNotificationsRouter = require("./routes/notifications.routes");
const createJobsRouter = require("./routes/jobs.routes");
const applicationManagementRouter = require("./application-management-api");
const createSkillsRouter = require("./routes/skills.routes");
const paymentsRouter = require("./routes/payments.routes");
const createUsersRouter = require("./routes/users.routes");

// Route initialization error handler
const initializeRouter = (name, createRouter) => {
  try {
    console.log(`Initializing ${name} router...`);
    const router = createRouter(prisma);
    console.log(`${name} router initialized successfully`);
    return router;
  } catch (error) {
    console.error(`Failed to initialize ${name} router:`, error);
    throw error;
  }
};

// Initialize Express app and Prisma client
const app = express();
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
if (!global.prisma) global.prisma = prisma;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Initialize upload directories
const uploadDirs = ["profile-photos", "resumes"].map(dir => 
  path.join(__dirname, "uploads", dir)
);

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files and directory listing
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", serveIndex(path.join(__dirname, "uploads"), {
  icons: true,
  view: "details"
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Alias health check under /api prefix for container health probes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  try {
    console.log("Authenticating request:", {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
        code: "AUTH_HEADER_MISSING"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
        code: "TOKEN_MISSING"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    console.log("Auth successful:", {
      userId: decoded.id,
      role: decoded.role,
      path: req.path
    });

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN"
    });
  }
};

// Role middleware
const checkRole = (role) => {
  return (req, res, next) => {
    console.log("Checking role:", {
      required: role,
      user: req.user.role,
      path: req.path
    });

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        code: "INVALID_ROLE"
      });
    }
    next();
  };
};

// Initialize routers
console.log("Initializing API routers...");

try {
  // Initialize protected routers
  const jobseekerRouter = initializeRouter('jobseeker', createJobseekerRouter);
  const employerRouter = initializeRouter('employer', createEmployerRouter);
  const companiesRouter = initializeRouter('companies', createCompaniesRouter);
  const notificationsRouter = initializeRouter('notifications', createNotificationsRouter);
  const skillsRouter = initializeRouter('skills', createSkillsRouter);
  const usersRouter = initializeRouter('users', createUsersRouter);

  // Mount routes
  console.log("Mounting API routes...");

  // Public routes
  app.use("/api/auth", authRouter);
  // Public job routes
  app.use("/api/jobs", createJobsRouter(prisma));

  // Protected routes with role-based access
  app.use("/api/jobseeker", 
    authenticateJWT, 
    checkRole("JOBSEEKER"),
    (req, res, next) => {
      console.log('Jobseeker route accessed:', req.method, req.path);
      next();
    },
    jobseekerRouter
  );

  app.use("/api/employer",
    authenticateJWT,
    checkRole("EMPLOYER"),
    (req, res, next) => {
      console.log('Employer route accessed:', req.method, req.path);
      next();
    },
    employerRouter
  );

  app.use("/api/companies",
    authenticateJWT,
    checkRole("EMPLOYER"),
    (req, res, next) => {
      console.log('Companies route accessed:', req.method, req.path);
      next();
    },
    companiesRouter
  );

  app.use("/api/notifications",
    authenticateJWT,
    (req, res, next) => {
      console.log('Notifications route accessed:', req.method, req.path);
      next();
    },
    notificationsRouter
  );

  app.use("/api/skills", skillsRouter);

  // User profile routes (authenticated)
  app.use("/api/users",
    authenticateJWT,
    (req, res, next) => {
      console.log('Users route accessed:', req.method, req.path);
      next();
    },
    usersRouter
  );

  // Payment routes
  app.use("/api/payments", paymentsRouter);

  // Applications listing & management routes
  app.use('/api', applicationManagementRouter);

  console.log("All routes mounted successfully");
} catch (error) {
  console.error("Failed to initialize routes:", error);
  process.exit(1);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Validation error handler
app.use((err, req, res, next) => {
  if (err instanceof Array && err[0] instanceof Error) {
    // Handle express-validator errors
    const errors = err.map(e => ({
      message: e.msg,
      param: e.param
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }
  next(err);
});

// Main error handler
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

  // Handle other Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
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

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function startServer(retries = 10, backoffMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log("Connected to PostgreSQL via Prisma");

      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log("Environment:", process.env.NODE_ENV || "development");
      });
      return; // success
    } catch (error) {
      console.error(`DB connection attempt ${attempt} failed:`, error.code || error.message);
      if (attempt === retries) {
        console.error("Exceeded maximum DB connection attempts. Exiting.");
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
}

startServer();

module.exports = app;
