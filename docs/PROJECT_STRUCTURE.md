# JamDung Jobs - Project Structure Documentation

## 📁 Directory Overview

This document provides a comprehensive breakdown of the JamDung Jobs project structure, including the purpose of each directory and file.

---

## 🌟 Root Level Files

### Configuration Files
- **`CLAUDE.md`** - Comprehensive context engineering file for AI assistants
- **`docker-compose.prod.yml`** - Production Docker configuration
- **`init.sql`** - Database initialization script

### Documentation
- **`README.md`** - Main project documentation
- **`CHANGELOG.md`** - Version history and changes
- **`DEPLOYMENT_GUIDE.md`** - Production deployment instructions
- **`NEW_FEATURES_README.md`** - Latest features documentation
- **`RELEASE_NOTES_v1.2.md`** - Version 1.2 release notes
- **`SECURITY_SETUP.md`** - Security configuration guide
- **`UI_UX_OPTIMIZATION_PLAN.md`** - Design optimization roadmap

### Build & Deployment
- **`Dockerfile.api`** - Backend container configuration
- **`Dockerfile.frontend`** - Frontend development container
- **`Dockerfile.frontend.static`** - Production frontend container

---

## 📦 Backend (`/backend`)

### Core Application
- **`server.js`** - Main Express server and application entry point
- **`package.json`** - Node.js dependencies and scripts
- **`application-management-api.js`** - Job application handling endpoints

### Routes (`/backend/routes`)
```
routes/
├── auth.routes.js          # Authentication endpoints
├── companies.routes.js     # Company profile management
├── employer.routes.js      # Employer-specific features
├── jobs.routes.js          # Job listing CRUD operations
├── jobseeker.routes.js     # Job seeker profile features
├── notifications.routes.js # Real-time notifications
├── payments.routes.js      # Stripe payment integration
├── skills.routes.js        # Skills management
└── users.routes.js         # User profile management
```

### Database (`/backend/prisma`)
```
prisma/
├── schema.prisma           # Database schema definition
├── migrations/             # Database migration history
│   ├── 20250706_v1_2_complete_schema/
│   └── ...migration history
└── seed.js                 # Database seeding script
```

### Services (`/backend/services`)
```
services/
├── jobViewService.js       # Job view analytics tracking
├── paymentService.js       # Payment processing logic
└── webhookService.js       # Stripe webhook handling
```

### Middleware (`/backend/middleware`)
- **`auth.js`** - JWT authentication and role-based authorization

### Scripts (`/backend/scripts`)
```
scripts/
├── seed-demo-data.js       # Demo data population
├── seed-test-users.js      # Test user creation
├── create-test-accounts.js # Test account setup
└── api-*.sh               # API testing scripts
```

### Uploads (`/backend/uploads`)
- File storage for resumes, company logos, and profile photos

---

## 🌐 Frontend (`/web-frontend`)

### Core Application
- **`package.json`** - React dependencies and build scripts
- **`src/index.js`** - React application entry point
- **`src/App.js`** - Main application component with routing

### Components (`/web-frontend/src/components`)

#### Authentication (`/components/auth`)
```
auth/
├── EnhancedRoleSelection.js
├── GoogleOAuthButton.js
└── LoginPage.js
```

#### Job Seekers (`/components/candidate`)
```
candidate/
├── CandidateDashboard.js
├── CandidateProfile.js
├── ResumeBuilder.js
├── ResumeBuilderPage.js
├── PhotoUploadCard.js
└── NotificationsMenu.js
```

#### Employers (`/components/employer`)
```
employer/
├── EmployerDashboard.js
├── CreateJobListing.js
├── ApplicationsList.js
├── ApplicationsReview.js
├── CompanyProfileSetup.js
└── JobListingForm.js
```

#### Job Search (`/components/search`)
```
search/
├── BasicJobSearch.js           # Main search component
├── UniversalJobSearch.js       # Advanced search features
├── JobCard.js                  # Job listing display
├── SearchFilters.js            # Filter components
├── AdvancedFilters/           # Advanced filtering options
├── GPS/                       # Location-based features
└── Recommendations/           # Job recommendation system
```

#### Common UI (`/components/common`)
```
common/
├── BaseAutocomplete.js
├── LocationAutocomplete.js
├── SalaryRangeInput.js
├── SkillsAutocomplete.js
├── JobShareButton.js
├── ThemeToggle.js
└── Seo.js
```

#### Navigation (`/components/navigation`)
```
navigation/
├── SimpleMobileNav.js         # Main mobile navigation
├── MobileOptimizedNav.js      # Enhanced mobile nav
└── UserProfileMenu.js         # User account menu
```

#### Home Page (`/components/home`)
```
home/
├── HomePage.js                # Main homepage
├── HeroSection.js             # Hero banner
├── FeaturedJobsSection.js     # Featured job listings
├── IndustryHighlights.js      # Jamaica industry showcase
└── UserPathways.js            # User journey guidance
```

### Pages (`/web-frontend/src/pages`)
```
pages/
├── JobDetailsPage.js          # Individual job view
├── JobApplyPage.js            # Job application form
├── ApplicationsPage.js        # User applications
├── EmployerApplicationsPage.js # Employer application management
├── EmployerPostJobPage.js     # Job posting form
└── BasicSearchPage.js         # Job search interface
```

### Utilities (`/web-frontend/src/utils`)
```
utils/
├── api.js                     # API client configuration
├── axiosConfig.js             # HTTP client setup
├── loggingUtils.js            # Development logging
└── responsive.js              # Responsive design helpers
```

### Context & State (`/web-frontend/src/context`)
```
context/
├── AuthContext.js             # User authentication state
├── ThemeContext.js            # UI theme management
└── NotificationContext.js     # Notification state
```

### Hooks (`/web-frontend/src/hooks`)
```
hooks/
├── usePlausible.js            # Analytics tracking
├── useGoogleAuth.js           # Google OAuth integration
└── usePayment.js              # Payment processing
```

### Styling (`/web-frontend/src/styles`)
```
styles/
├── theme.js                   # Material-UI theme configuration
└── globalStyles.css           # Global CSS styles
```

---

## 🐳 Development Environment (`/local-dev`)

### Docker Configuration
- **`docker-compose.yml`** - Local development services
- **`README-Analytics.md`** - Analytics setup documentation

### Analytics Configuration (`/local-dev/plausible`)
```
plausible/
├── clickhouse-config.xml      # ClickHouse configuration
└── clickhouse-user-config.xml # ClickHouse user settings
```

---

## 🚀 Infrastructure (`/terraform`)

### AWS Infrastructure (`/terraform/staging`)
```
staging/
├── main.tf                    # Main Terraform configuration
├── vpc.tf                     # Network infrastructure
├── staging_ec2.tf             # EC2 instance setup
├── cloudflare.tf              # CDN and DNS configuration
├── s3.tf                      # S3 storage buckets
├── variables.tf               # Infrastructure variables
├── outputs.tf                 # Infrastructure outputs
└── user_data/                 # EC2 initialization scripts
    ├── init.sh
    └── bootstrap.sh
```

---

## 🧪 Testing (`/testing`)

### Test Suites
```
testing/
├── basic-smoke-test.js        # Core functionality tests
├── comprehensive-qa-test.js   # Full application testing
├── api.test.js                # Backend API testing
├── file-upload-test.js        # File upload testing
├── mvp-readiness-test.js      # Production readiness
└── manual-test-instructions.md # Manual testing guide
```

### Test Configuration
- **`package.json`** - Testing dependencies
- **`test-config.js`** - Test environment configuration

---

## 📚 Documentation (`/docs`)

### Development Guides
- **`QA_instructions.md`** - Quality assurance procedures
- **`local-dev-enhancement-plan.md`** - Local development improvements

---

## 🔧 Scripts (`/scripts`)

### Build & Deployment
```
scripts/
├── deploy-staging.sh          # Staging deployment script
├── test-staging.sh            # Staging environment testing
├── run-local-tests.sh         # Local testing automation
└── pre-deploy-check.sh        # Pre-deployment validation
```

---

## 🗄️ Database (`/database`)

### Data Seeding
```
database/seeders/
├── jamaican_jobs_seeder.sql   # Sample job data
└── clean_jamaican_jobs_seeder.sql # Clean demo data
```

---

## 🌍 Web Server (`/nginx`)

### Server Configuration
- **`frontend.conf`** - Nginx configuration for serving React app

---

## 📝 Key File Purposes

### Configuration Files
- **Environment Variables**: Configure API URLs, database connections, payment keys
- **Docker Files**: Container definitions for different environments
- **Database Schema**: Prisma schema defines all data models and relationships

### Application Logic
- **Routes**: RESTful API endpoints for different features
- **Components**: Reusable React UI components with Jamaica theming
- **Services**: Business logic separated from routes for maintainability
- **Middleware**: Authentication, validation, and request processing

### Development Tools
- **Testing**: Comprehensive test coverage for API and frontend
- **Scripts**: Automation for deployment, testing, and development tasks
- **Analytics**: Privacy-focused user behavior tracking

### Infrastructure
- **Terraform**: Infrastructure as code for AWS deployment
- **Docker**: Containerization for consistent environments
- **CI/CD**: GitHub Actions for automated deployment pipeline

---

## 🎯 Navigation Tips

### Finding Specific Features
- **Authentication**: `backend/routes/auth.routes.js` + `web-frontend/src/context/AuthContext.js`
- **Job Search**: `web-frontend/src/components/search/` directory
- **Payment Processing**: `backend/routes/payments.routes.js` + `backend/services/paymentService.js`
- **User Profiles**: `backend/routes/jobseeker.routes.js` + `web-frontend/src/components/candidate/`
- **Employer Features**: `backend/routes/employer.routes.js` + `web-frontend/src/components/employer/`

### Development Workflow
1. **Backend Changes**: Modify routes, services, or database schema
2. **Frontend Changes**: Update components, pages, or styling
3. **Testing**: Run tests in `/testing` directory
4. **Deployment**: Use scripts in `/scripts` or GitHub Actions

### Database Changes
1. **Schema Updates**: Modify `backend/prisma/schema.prisma`
2. **Migrations**: Run `npx prisma migrate dev`
3. **Seeding**: Use scripts in `backend/scripts/`

This structure supports a scalable, maintainable codebase that can grow with the platform's success in the Jamaican job market.