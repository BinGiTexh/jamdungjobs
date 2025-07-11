# 🔒 JamDung Jobs Security Guidelines

## ⚠️ CRITICAL SECURITY PRINCIPLES

### **NEVER DO THIS:**
- ❌ **Hardcode credentials** in source code
- ❌ **Commit secrets** to version control
- ❌ **Log sensitive data** (passwords, tokens, PII)
- ❌ **Use weak passwords** in any environment
- ❌ **Ignore security warnings** from tools or dependencies
- ❌ **Hardcode API keys** even for testing
- ❌ **Use production credentials** in development

### **ALWAYS DO THIS:**
- ✅ **Use environment variables** for all configuration
- ✅ **Validate all inputs** on both client and server
- ✅ **Sanitize data** before logging
- ✅ **Use HTTPS** in all environments except localhost
- ✅ **Implement proper authentication** and authorization
- ✅ **Keep dependencies updated** with security patches
- ✅ **Use strong, unique passwords** and secrets

---

## 🛡️ AUTHENTICATION & AUTHORIZATION

### **JWT Security**
```javascript
// ✅ SECURE - Use environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  process.exit(1); // Fail fast if missing
}

// ❌ INSECURE - Never hardcode secrets
const JWT_SECRET = "hardcoded_secret_123";
```

### **Password Handling**
```javascript
// ✅ SECURE - Always hash passwords
const hashedPassword = await bcrypt.hash(password, 12);

// ✅ SECURE - Use strong salt rounds (10-12)
const saltRounds = 12;

// ❌ INSECURE - Never store plain text passwords
const password = "plaintext_password";
```

### **Environment Variables**
```bash
# ✅ SECURE - All sensitive config via environment
JWT_SECRET=your_secure_random_secret_here
STRIPE_SECRET_KEY=sk_live_your_stripe_key
DATABASE_PASSWORD=your_secure_db_password

# ❌ INSECURE - No hardcoded values in code
```

---

## 🔐 DATA PROTECTION

### **Input Validation**
```javascript
// ✅ SECURE - Validate all inputs
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ SECURE - Sanitize before database operations
const sanitizedInput = input.trim().toLowerCase();
```

### **Logging Security**
```javascript
// ✅ SECURE - Sanitize sensitive data in logs
const sanitizeForLogging = (obj) => {
  const sanitized = { ...obj };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.creditCard;
  return sanitized;
};

// ❌ INSECURE - Never log sensitive data
console.log('User data:', userData); // May contain passwords
```

### **Database Security**
```javascript
// ✅ SECURE - Use parameterized queries (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// ✅ SECURE - Validate data types
const userId = parseInt(req.params.id, 10);
if (isNaN(userId)) {
  return res.status(400).json({ error: 'Invalid ID' });
}
```

---

## 🌐 API SECURITY

### **Authentication Headers**
```javascript
// ✅ SECURE - Validate all protected endpoints
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### **Rate Limiting**
```javascript
// ✅ SECURE - Implement rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});
```

### **CORS Configuration**
```javascript
// ✅ SECURE - Restrict CORS origins
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## 🧪 TESTING SECURITY

### **Test Credentials**
```javascript
// ✅ SECURE - Use environment variables for tests
const testCredentials = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  password: process.env.TEST_PASSWORD || generateRandomPassword()
};

// ❌ INSECURE - Never hardcode test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};
```

### **Postman Collections**
```json
// ✅ SECURE - Use variables for all sensitive data
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

// ❌ INSECURE - No hardcoded credentials
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 📁 FILE SECURITY

### **Environment Files**
```bash
# ✅ SECURE - Always in .gitignore
.env
.env.local
.env.development
.env.test
.env.production
*.env

# ✅ SECURE - Use .env.example for documentation
```

### **Sensitive File Patterns**
```bash
# Add to .gitignore
*.key
*.pem
*.p12
*.pfx
config/secrets.*
**/credentials.*
**/keys/*
backup/
dumps/
```

---

## 🚀 DEPLOYMENT SECURITY

### **Environment Separation**
- **Development**: Isolated test data and credentials
- **Staging**: Production-like environment with test data
- **Production**: Real credentials, encrypted at rest and in transit

### **Secret Management**
```bash
# ✅ SECURE - Use proper secret management
# GitHub Secrets for CI/CD
# AWS Secrets Manager for production
# Docker secrets for containerized deployments

# ❌ INSECURE - No secrets in:
# - Git repositories
# - Docker images
# - Log files
# - Error messages
```

---

## 🔍 SECURITY MONITORING

### **Regular Security Checks**
1. **Weekly**: Dependency vulnerability scans
2. **Monthly**: Code security reviews
3. **Quarterly**: Penetration testing
4. **Annually**: Full security audit

### **Security Tools**
```bash
# Dependency vulnerability scanning
npm audit
npm audit fix

# Secret detection
git-secrets --scan
truffleHog

# SAST (Static Application Security Testing)
eslint-plugin-security
```

---

## 🚨 INCIDENT RESPONSE

### **If Credentials Are Compromised**
1. **Immediately** rotate all affected credentials
2. **Revoke** all existing tokens/sessions
3. **Audit** logs for unauthorized access
4. **Update** all affected systems
5. **Document** the incident and lessons learned

### **Security Checklist for New Code**
- [ ] No hardcoded secrets or credentials
- [ ] All inputs validated and sanitized
- [ ] Sensitive data excluded from logs
- [ ] Authentication/authorization implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Security tests pass

---

## 📚 SECURITY RESOURCES

### **Training & Guidelines**
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/reference/react-dom/server#security-caveats)

### **Security Tools**
- **ESLint Security Plugin**: Catch security issues during development
- **npm audit**: Find vulnerabilities in dependencies
- **Helmet.js**: Secure Express apps with various HTTP headers
- **Rate Limiting**: Prevent abuse and DoS attacks

---

## ⚡ QUICK SECURITY CHECKLIST

Before committing code, verify:
- [ ] No credentials in source code
- [ ] No sensitive data in logs
- [ ] All environment variables documented
- [ ] Input validation implemented
- [ ] Authentication/authorization working
- [ ] Dependencies updated
- [ ] Security tests passing

**Remember: Security is everyone's responsibility!**

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Status: Active*