# CLAUDE.md - JamDung Jobs Context Engineering

## 🇯🇲 Project Overview

**JamDung Jobs** is Jamaica's premier job search platform connecting local talent with opportunities across the island. The platform serves both job seekers and employers with a modern, mobile-first design celebrating Jamaican culture.

### 🎯 Mission
To democratize access to employment opportunities in Jamaica while preserving and celebrating the island's rich cultural heritage through technology.

### 🏆 Current Status
- **Version**: 1.2.0 
- **Environment**: Production staging deployment ready
- **URL**: https://staging-jobs.bingitech.io
- **Last Major Update**: Complete v1.2 feature implementation with analytics

---

## 🏗️ Technical Architecture

### **Stack Overview**
- **Frontend**: React 18 + Material-UI + Jamaica-themed components
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL with comprehensive job board schema
- **Analytics**: Plausible Analytics (privacy-focused)
- **Payments**: Stripe integration for job posting fees
- **Infrastructure**: Docker + AWS EC2 + CloudFront + Terraform
- **CI/CD**: GitHub Actions with automated staging deployment

### **Key Technologies**
- **Authentication**: JWT-based with role-based access (JOBSEEKER/EMPLOYER/ADMIN)
- **File Storage**: Local uploads with nginx serving
- **Search**: Advanced job search with location-based filtering
- **Notifications**: Real-time in-app notifications system
- **Mobile**: Responsive design optimized for mobile-first usage
- **SEO**: Server-side rendering ready with meta tag optimization

---

## 📁 Project Structure

```
jamdungjobs/
├── 📦 backend/                 # Node.js API server
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth & validation
│   ├── prisma/                 # Database schema & migrations
│   ├── services/               # Business logic
│   └── uploads/                # File storage
├── 🌐 web-frontend/            # React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # Theme & styling
├── 🐳 local-dev/               # Development environment
│   ├── docker-compose.yml      # Local development services
│   └── plausible/              # Analytics configuration
├── 🚀 terraform/               # Infrastructure as code
│   └── staging/                # AWS staging environment
├── 🧪 testing/                 # Test suites & QA
├── 📚 docs/                    # Documentation
└── 🔧 scripts/                 # Build & deployment scripts
```

---

## 🎨 UI/UX Design Philosophy

### **Jamaica-First Design**
- **Colors**: Green (#2C5530), Gold (#FFD700), Black - Jamaica flag inspired
- **Typography**: Clean, readable fonts with cultural warmth
- **Icons**: Caribbean-themed iconography where appropriate
- **Mobile-First**: 80%+ of Jamaican internet usage is mobile

### **User Experience Principles**
1. **Simplicity**: Easy navigation for users of all technical levels
2. **Speed**: Fast loading times for slower Caribbean internet connections
3. **Accessibility**: WCAG compliant with screen reader support
4. **Cultural Sensitivity**: Language and imagery that resonates with Jamaican users
5. **Trust**: Professional appearance that builds employer and candidate confidence

### **Component Library**
- **Material-UI Base**: Professional, accessible components
- **Custom Jamaica Theme**: Consistent color scheme and spacing
- **Responsive Breakpoints**: Mobile, tablet, desktop optimized
- **Reusable Components**: Standardized buttons, forms, cards

---

## 🔧 Development Workflow

### **Local Development Setup**
```bash
cd local-dev
docker-compose up -d  # Starts all services including analytics
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: PostgreSQL on port 5432
# Analytics: http://localhost:8000
```

### **Key Development Commands**
```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd web-frontend && npm start

# Run tests
cd testing && npm test

# Database migrations
cd backend && npx prisma migrate dev

# Production build
docker-compose -f docker-compose.prod.yml up
```

### **Environment Variables**
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/jobboard
JWT_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_test_...

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_PLAUSIBLE_DOMAIN=localhost:3000
```

---

## 🎯 Core Features & Business Logic

### **🔍 Job Search & Discovery**
- **Universal Search**: Works for authenticated and anonymous users
- **Smart Filtering**: Location, salary, job type, experience level
- **Search Suggestions**: Intelligent autocomplete with job titles
- **Saved Jobs**: Bookmarking for registered users
- **Job Recommendations**: Personalized suggestions based on profile

### **👤 User Management**
```javascript
// User Roles & Permissions
JOBSEEKER: {
  - Create profile with resume upload
  - Search and apply for jobs
  - Track application status
  - Save favorite jobs
  - Receive notifications
}

EMPLOYER: {
  - Create company profile
  - Post job listings (paid)
  - Manage applications
  - View analytics dashboard
  - Subscription management
}

ADMIN: {
  - Content moderation
  - User management
  - System analytics
  - Payment oversight
}
```

### **💼 Job Application Process**
1. **Job Discovery**: Search or browse job listings
2. **Application Submission**: Resume + cover letter + source tracking
3. **Status Tracking**: Real-time application status updates
4. **Employer Review**: Applications management for employers
5. **Communication**: In-app messaging between parties

### **💳 Payment & Monetization**
- **Job Posting Fees**: Stripe-powered payment processing
- **Featured Listings**: Premium job placement options
- **Subscription Plans**: Monthly/annual employer plans
- **Heart Partnership**: Revenue sharing with local NGO (20%)

### **📊 Analytics & Insights**
- **User Behavior**: Page views, search patterns, application funnel
- **Business Metrics**: Conversion rates, popular job categories
- **Source Attribution**: Track where applicants heard about jobs
- **Performance Analytics**: Job posting effectiveness for employers

---

## 🔗 API Architecture

### **Authentication Flow**
```javascript
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
GET  /api/auth/verify    // JWT token validation
```

### **Core Endpoints**
```javascript
// Jobs
GET    /api/jobs           // Search jobs with filters
GET    /api/jobs/:id       // Job details
POST   /api/jobs           // Create job (employers)
PUT    /api/jobs/:id       // Update job
DELETE /api/jobs/:id       // Remove job

// Applications  
POST   /api/applications   // Submit application
GET    /api/jobseeker/applications      // User's applications
GET    /api/employer/applications       // Employer's received applications
PATCH  /api/employer/applications/:id/status  // Update status

// Users & Profiles
GET    /api/jobseeker/profile
PUT    /api/jobseeker/profile
POST   /api/jobseeker/profile/resume
GET    /api/employer/profile
PUT    /api/employer/profile

// Payments
POST   /api/payments/create-intent
POST   /api/payments/webhook
GET    /api/employer/subscription
```

### **Database Schema Highlights**
```sql
-- Core entities
User (id, email, role, profile_data)
Job (id, title, description, company_id, location, salary, skills)
JobApplication (id, job_id, user_id, status, application_source)
Company (id, name, description, location, industry)
Notification (id, user_id, type, message, read_status)

-- New v1.2 features
Payment (id, user_id, amount, stripe_payment_id, status)
JobView (id, job_id, user_id, ip_address, created_at)
ApplicationSource (enum: GOOGLE_SEARCH, FACEBOOK_SOCIAL, etc.)
```

---

## 🚀 Deployment & Infrastructure

### **Staging Environment**
- **URL**: https://staging-jobs.bingitech.io
- **Server**: AWS EC2 (t3.medium)
- **Database**: PostgreSQL on EC2
- **CDN**: CloudFront for static assets
- **SSL**: Automated certificate management
- **Monitoring**: CloudWatch + application logs

### **GitHub Actions CI/CD**
```yaml
# .github/workflows/deploy-staging.yml
- Health checks and pre-deployment validation
- Docker image building with caching
- Database migration execution
- Rolling deployment with rollback capability
- Post-deployment testing and verification
```

### **Docker Configuration**
```yaml
# Production stack
services:
  postgres:    # Database server
  redis:       # Session storage
  api:         # Backend Node.js
  frontend:    # Static React build
  cloudflared: # Tunnel for external access
```

### **Infrastructure as Code**
```hcl
# terraform/staging/
- VPC with public/private subnets
- EC2 instance with security groups
- RDS PostgreSQL (future migration)
- CloudFront CDN distribution
- Route53 DNS management
```

---

## 📈 Analytics & Business Intelligence

### **Plausible Analytics Setup**
- **Privacy-First**: No cookies, GDPR compliant
- **Custom Events**: Job searches, applications, user registrations
- **Real-Time Dashboard**: Live visitor tracking
- **Source Attribution**: Marketing campaign effectiveness

### **Key Metrics Tracked**
```javascript
// User Behavior
- Page views and unique visitors
- Session duration and bounce rate
- Mobile vs desktop usage
- Geographic distribution

// Business Metrics  
- Job search conversion (search → view → apply)
- Application source attribution
- Popular job categories and locations
- Employer engagement metrics

// Performance Indicators
- Site loading times
- API response times
- Error rates and user experience issues
```

### **Custom Event Tracking**
```javascript
// Frontend analytics hooks
const { trackJobSearch, trackJobApplication } = useJobAnalytics();

trackJobSearch(query, { location, resultsCount });
trackJobApplication(jobId, jobTitle, applicationSource);
```

---

## 🔐 Security & Privacy

### **Authentication & Authorization**
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access**: Strict permission enforcement
- **Password Security**: bcrypt hashing with salt rounds
- **API Rate Limiting**: Prevents abuse and DDoS

### **Data Protection**
- **Input Validation**: All user inputs sanitized
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **File Upload Security**: Validation and virus scanning
- **HTTPS Enforcement**: SSL/TLS encryption throughout

### **Privacy Compliance**
- **Cookie Policy**: Minimal cookie usage
- **Data Retention**: Clear policies for user data
- **GDPR Considerations**: EU privacy standards compliance
- **Analytics**: Privacy-first with Plausible (no personal data)

---

## 🧪 Testing Strategy

### **Test Coverage**
```bash
testing/
├── api.test.js                 # Backend API endpoints
├── basic-smoke-test.js         # Core functionality
├── comprehensive-qa-test.js    # Full application flow
├── file-upload-test.js         # Resume upload testing
└── mvp-readiness-test.js       # Production readiness
```

### **QA Processes**
- **Automated Testing**: Jest + supertest for API testing
- **Manual Testing**: Comprehensive user flow testing
- **Browser Testing**: Cross-browser compatibility verification
- **Mobile Testing**: iOS/Android responsive testing
- **Performance Testing**: Load testing and optimization

### **Deployment Validation**
- **Health Checks**: API and database connectivity
- **Feature Testing**: Critical user flows verification
- **Analytics Verification**: Event tracking functionality
- **Payment Testing**: Stripe integration validation

---

## 🎯 Business Context

### **Target Market**
- **Job Seekers**: Jamaican professionals across all skill levels
- **Employers**: Local businesses, international companies with Jamaica operations
- **Geographic Focus**: Jamaica-first with Caribbean expansion potential
- **Demographics**: Mobile-first users, varying technical proficiency

### **Competitive Advantages**
1. **Local Focus**: Deep understanding of Jamaican job market
2. **Cultural Alignment**: Design and language that resonates locally
3. **Mobile Optimization**: Caribbean internet usage patterns
4. **Fair Pricing**: Accessible to local businesses
5. **Community Partnership**: HEART Trust revenue sharing

### **Revenue Streams**
- **Job Posting Fees**: Primary revenue from employer job listings
- **Featured Listings**: Premium placement for urgent hiring
- **Subscription Plans**: Monthly/annual employer memberships
- **Future**: Training partnerships, recruitment services

### **Key Performance Indicators**
- **User Growth**: Monthly active users (job seekers + employers)
- **Job Posting Volume**: Number of active job listings
- **Application Success Rate**: Successful job placements
- **Revenue Growth**: Monthly recurring revenue from employers
- **Market Penetration**: Share of Jamaica's online job market

---

## 🛣️ Roadmap & Future Development

### **Immediate Priorities (v1.3)**
- [ ] Advanced employer analytics dashboard
- [ ] SMS notifications for mobile users
- [ ] Enhanced mobile app experience
- [ ] Multi-language support (English/Patois)

### **Short-term Goals (6 months)**
- [ ] Mobile app development (React Native)
- [ ] Advanced matching algorithms
- [ ] Video interviews integration
- [ ] Salary insights and market data

### **Long-term Vision (12+ months)**
- [ ] Caribbean region expansion
- [ ] AI-powered job recommendations
- [ ] Skills-based hiring platform
- [ ] Training and certification programs

---

## 🚨 Critical Considerations

### **Technical Debt**
- **Database**: Consider migration to managed RDS for scalability
- **Search**: Implement Elasticsearch for advanced job search
- **Caching**: Add Redis for improved performance
- **Monitoring**: Enhanced error tracking and performance monitoring

### **Business Risks**
- **Competition**: Monitor for new entrants in Jamaica job market
- **Economic Factors**: Adapt to local economic conditions
- **Technology Changes**: Stay current with web development trends
- **Regulatory**: Comply with evolving data protection laws

### **Success Metrics**
- **Technical**: 99.9% uptime, <2s page load times, zero data breaches
- **Business**: 10,000+ active job seekers, 500+ employer clients, $50K+ MRR
- **User Experience**: 4.5+ app store rating, <5% bounce rate, 60%+ mobile usage

---

## 📞 Support & Maintenance

### **Development Team Context**
- **Primary Developer**: Backend/frontend fullstack development
- **Deployment**: Automated staging, manual production releases
- **Monitoring**: CloudWatch, application logs, user feedback
- **Support**: Email-based user support with ticket system

### **Emergency Contacts**
- **Production Issues**: Check CloudWatch alerts, server logs
- **Database Issues**: Backup restoration procedures documented
- **Payment Issues**: Stripe dashboard monitoring and alerts
- **Security Issues**: Incident response plan in security documentation

### **Regular Maintenance**
- **Weekly**: Security updates, dependency management
- **Monthly**: Performance optimization, analytics review
- **Quarterly**: Feature releases, user feedback integration
- **Annually**: Infrastructure review, cost optimization

---

## 🎓 Knowledge Transfer

### **New Developer Onboarding**
1. **Setup**: Run local-dev docker-compose environment
2. **Familiarization**: Review this CLAUDE.md and API documentation
3. **Testing**: Execute test suite and manual testing flows
4. **Development**: Start with small feature additions or bug fixes
5. **Deployment**: Observe staging deployment process

### **Key Learning Resources**
- **React/Material-UI**: Component patterns and theming
- **Node.js/Express**: RESTful API development
- **Prisma**: Database ORM and migrations
- **Stripe**: Payment processing integration
- **Docker**: Containerization and deployment
- **AWS**: Infrastructure and deployment

### **Common Development Patterns**
```javascript
// API endpoint pattern
router.post('/endpoint', authenticateJWT, checkRole('ROLE'), async (req, res) => {
  try {
    // Validation
    // Business logic
    // Database operations
    // Response
  } catch (error) {
    // Error handling
  }
});

// React component pattern
const Component = ({ props }) => {
  const { trackEvent } = useAnalytics();
  const [state, setState] = useState();
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <ThemeProvider>
      {/* JSX with Jamaica theme */}
    </ThemeProvider>
  );
};
```

---

## 🏁 Conclusion

JamDung Jobs represents a comprehensive job board platform tailored specifically for the Jamaican market. The codebase reflects professional development practices with a focus on user experience, cultural relevance, and business sustainability.

**Key Success Factors:**
- **Technical Excellence**: Modern stack with robust architecture
- **Cultural Alignment**: Jamaica-first design and user experience  
- **Business Viability**: Clear monetization and growth strategy
- **Community Impact**: Partnership with local organizations
- **Scalability**: Foundation for Caribbean region expansion

**For AI Assistants**: This project values practical solutions over perfect abstractions, user experience over technical complexity, and cultural sensitivity over generic approaches. Always consider the Jamaican context when making development decisions.

---

*Last Updated: January 2025 | Version: 1.2.0 | Status: Production Staging Ready*

**🇯🇲 One Love, One Platform, One Jamaica 🇯🇲**