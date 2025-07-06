# JamDung Jobs Analytics Setup

## 🔥 Plausible Analytics Integration

We've implemented privacy-focused analytics using Plausible Analytics for comprehensive user behavior tracking on JamDung Jobs.

### 🚀 Quick Start

1. **Start Analytics Services**:
```bash
cd local-dev
docker-compose up -d plausible_db plausible_events_db plausible
```

2. **Access Analytics Dashboard**:
- URL: http://localhost:8000
- Username: admin@jamdungjobs.com
- Password: admin123

3. **Add Your Site**:
- Once logged in, click "Add site"
- Enter domain: `localhost:3000`
- The tracking script is already integrated in the frontend

### 📊 What We're Tracking

#### **Core Events**
- **Page Views**: Automatic tracking of all page visits
- **Job Search**: Query terms, location filters, result counts
- **Job Views**: When users click on job listings
- **Job Applications**: Application submissions with source tracking
- **Company Profile Views**: When users view company pages

#### **User Actions**
- **User Registration**: Track new signups by role (jobseeker/employer)
- **User Login**: Track login events by role
- **Job Saves**: When users bookmark jobs
- **Resume Uploads**: Track resume upload events
- **Job Postings**: Track when employers post jobs

#### **Advanced Tracking**
- **Application Source Attribution**: Track where applicants heard about jobs
- **UTM Parameter Support**: Marketing campaign attribution
- **Mobile vs Desktop**: Device type analytics
- **Geographic Data**: Country/region insights

### 🎯 Analytics Dashboard Features

#### **Real-time Data**
- Live visitor counts
- Current page views
- Active user sessions

#### **Traffic Sources**
- Direct traffic
- Search engines (Google, etc.)
- Social media referrals
- Campaign attribution (UTM tracking)

#### **Content Performance**
- Most visited pages
- Job search queries
- Popular job categories
- Company profile engagement

#### **User Behavior**
- Session duration
- Pages per session
- Bounce rate
- Conversion funnel (search → view → apply)

### 🔧 Configuration

#### **Environment Variables**
```bash
# Frontend (.env)
REACT_APP_PLAUSIBLE_DOMAIN=localhost:3000
REACT_APP_PLAUSIBLE_API_HOST=http://localhost:8000

# Production
REACT_APP_PLAUSIBLE_DOMAIN=staging-jobs.bingitech.io
REACT_APP_PLAUSIBLE_API_HOST=https://analytics.yourdomain.com
```

#### **Docker Services**
- **plausible**: Main analytics application (port 8000)
- **plausible_db**: PostgreSQL database for Plausible data
- **plausible_events_db**: ClickHouse for event storage

### 📈 Business Intelligence

#### **Job Board Metrics**
- **Application Conversion Rate**: Search → View → Apply funnel
- **Source Attribution**: Which channels bring the best candidates
- **Content Performance**: Most engaging job types and companies
- **User Retention**: Returning vs new visitors

#### **Marketing ROI**
- **Campaign Performance**: UTM tracking for paid ads
- **Organic Growth**: SEO traffic and keyword performance  
- **Social Media Impact**: Referral traffic from social platforms
- **Geographic Insights**: Where users are coming from

#### **Product Insights**
- **Feature Usage**: Which site features are most popular
- **Search Behavior**: What users are looking for
- **Mobile Experience**: Mobile vs desktop engagement
- **Performance Impact**: Page load times vs engagement

### 🛠️ Development Usage

#### **Custom Event Tracking**
```javascript
import { useJobAnalytics } from '../hooks/usePlausible';

const { trackJobApplication, trackJobSearch } = useJobAnalytics();

// Track job application
trackJobApplication(jobId, jobTitle, 'GOOGLE_SEARCH');

// Track search
trackJobSearch('Software Developer', {
  location: 'Kingston',
  resultsCount: 25
});
```

#### **Page View Tracking**
```javascript
import { usePlausible } from '../hooks/usePlausible';

const { trackPageView } = usePlausible();

// Manual page view (if needed)
trackPageView('/custom-page');
```

### 🔒 Privacy & Compliance

#### **Privacy-First Design**
- **No Cookies**: Plausible doesn't use cookies
- **No Personal Data**: No personal information collected
- **GDPR Compliant**: Meets EU privacy standards
- **Lightweight**: Minimal impact on site performance

#### **Data Retention**
- **Event Data**: 2 years in ClickHouse
- **Aggregated Data**: Unlimited in PostgreSQL
- **No IP Logging**: Anonymous visitor tracking

### 🚢 Production Deployment

#### **Option 1: Plausible Cloud** (Recommended)
- Sign up at plausible.io ($9/month)
- Add domain: staging-jobs.bingitech.io
- Update REACT_APP_PLAUSIBLE_API_HOST to their CDN

#### **Option 2: Self-Hosted on AWS**
```bash
# Use same docker-compose on EC2 instance
# Point CloudFront to analytics subdomain
# Set up SSL certificate for analytics.jamdungjobs.com
```

#### **Environment Variables for Production**
```bash
# .env.production
REACT_APP_PLAUSIBLE_DOMAIN=staging-jobs.bingitech.io
REACT_APP_PLAUSIBLE_API_HOST=https://plausible.io
# OR for self-hosted:
REACT_APP_PLAUSIBLE_API_HOST=https://analytics.jamdungjobs.com
```

### 🎯 Key Performance Indicators (KPIs)

1. **User Acquisition**
   - New visitors per day/week/month
   - Traffic source breakdown
   - Geographic distribution

2. **User Engagement**
   - Average session duration
   - Pages per session
   - Bounce rate by page type

3. **Conversion Metrics**
   - Search-to-view conversion rate
   - View-to-apply conversion rate
   - Registration completion rate

4. **Content Performance**
   - Most popular job categories
   - Top-performing company profiles
   - Search query trends

5. **Business Intelligence**
   - Application source attribution
   - Marketing campaign ROI
   - Feature adoption rates

### 🔄 Integration with Existing Systems

The analytics system integrates seamlessly with:
- **Application Source Tracking**: Links analytics with application data
- **UTM Parameter Handling**: Automatic campaign attribution
- **A/B Testing Ready**: Framework for testing UI changes
- **Performance Monitoring**: Page load time correlation

This analytics setup provides JamDung Jobs with comprehensive insights into user behavior, helping optimize the platform for better user experience and business growth.