const jwt = require("jsonwebtoken");

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
        message: "Authorization header missing",
        code: "AUTH_HEADER_MISSING"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Token missing",
        code: "TOKEN_MISSING"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "local_development_secret");
    
    console.log("Auth successful:", {
      userId: decoded.id,
      role: decoded.role,
      path: req.path
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", {
      error: error.message,
      name: error.name,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }

    res.status(401).json({
      message: "Authentication failed",
      code: "AUTH_FAILED",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      const userRole = (req.user.role || "").toUpperCase();
      const requiredRole = (role || "").toUpperCase();

      if (userRole !== requiredRole) {
        console.log("Role check failed:", {
          required: requiredRole,
          provided: userRole,
          userId: req.user.id,
          path: req.path
        });

        return res.status(403).json({
          message: "Access denied. Required role: " + role,
          code: "INVALID_ROLE"
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        path: req.path
      });

      res.status(500).json({
        message: "Error checking user role",
        code: "ROLE_CHECK_ERROR"
      });
    }
  };
};

// Alias for payment routes compatibility
const authenticateToken = authenticateJWT;

// Enhanced role checking that supports multiple roles
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      const userRole = (req.user.role || "").toUpperCase();
      const allowedRoles = Array.isArray(roles) ? roles.map(r => r.toUpperCase()) : [roles.toUpperCase()];

      if (!allowedRoles.includes(userRole)) {
        console.log("Role check failed:", {
          required: allowedRoles,
          provided: userRole,
          userId: req.user.id,
          path: req.path
        });

        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        path: req.path
      });

      res.status(500).json({
        success: false,
        message: "Error checking user permissions",
        code: "ROLE_CHECK_ERROR"
      });
    }
  };
};

module.exports = {
  authenticateJWT,
  checkRole,
  authenticateToken,
  requireRole
};
