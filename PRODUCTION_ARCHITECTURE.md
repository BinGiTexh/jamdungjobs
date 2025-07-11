# JamDung Jobs Production Architecture

## 🏗️ Infrastructure Overview

This document captures the production deployment architecture for JamDung Jobs based on the Terraform configuration analysis and clarifications about the database strategy.

### Production vs Development Architecture

**Development Environment:**
- Docker Compose with local PostgreSQL
- Node.js/Express backend on port 5000
- React frontend on port 3000
- Local file storage in Docker volumes
- Plausible analytics container

**Production Environment:**
- AWS serverless architecture
- S3 + CloudFront for frontend hosting
- API Gateway + Lambda for backend
- RDS Aurora Serverless PostgreSQL (not DynamoDB as originally configured)
- S3 for file storage
- CloudWatch for monitoring

## 🎯 Key Architectural Differences

### Database Strategy Change

**Original Terraform Configuration (terraform/main.tf:153-310):**
```hcl
# DynamoDB Tables (OUTDATED - NOT USED)
resource "aws_dynamodb_table" "users" { ... }
resource "aws_dynamodb_table" "jobs" { ... }
resource "aws_dynamodb_table" "applications" { ... }
resource "aws_dynamodb_table" "analytics" { ... }
```

**Actual Production Plan:**
- RDS Aurora Serverless PostgreSQL
- Maintains compatibility with current Prisma ORM
- No database migration required from development to production
- Same schema as local development environment

### Frontend Deployment

**Development:**
```bash
npm start  # React dev server on localhost:3000
```

**Production:**
```bash
npm run build  # Static React build
aws s3 sync build/ s3://prod-jamdungjobs.com-web/
```

**CloudFront Configuration (terraform/main.tf:357-424):**
- Origin: S3 bucket website endpoint
- Custom domain: jamdungjobs.com
- SSL certificate via ACM
- SPA routing support (404 → index.html)
- Price class: 100 (US/Europe only)

### Backend Deployment

**Development:**
```javascript
// Express server on port 5000
app.listen(5000, () => console.log('Server running on port 5000'));
```

**Production:**
```javascript
// Lambda handler
exports.handler = async (event, context) => {
  // Express app wrapped for Lambda
  return await serverlessExpress(app)(event, context);
};
```

**API Gateway Configuration (terraform/main.tf:595-715):**
- Custom domain: api.jamdungjobs.com
- Lambda proxy integration
- CORS enabled
- Regional endpoint type

### File Storage Strategy

**Development (backend/routes/jobseeker.routes.js:191-208):**
```javascript
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: `${Date.now()}-${sanitizedName}${ext}`
});
```

**Production:**
```javascript
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.FILES_BUCKET, // prod-jamdungjobs.com-files
  key: (req, file, cb) => {
    cb(null, `uploads/${Date.now()}-${sanitizedName}${ext}`);
  }
});
```

## 🔄 CORS Configuration Updates

### Current Development CORS (backend/server.js)
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://staging-jobs.bingitech.io',
    'https://jamdungjobs.com',           // Production frontend
    'https://www.jamdungjobs.com',
    'https://jamdungjob.io',             // Alternative domain
    'https://www.jamdungjob.io',
    'https://accounts.google.com',        // Google OAuth
    'https://oauth.google.com'
  ],
  credentials: true
};
```

### Production Lambda CORS
Lambda functions will need environment-specific CORS configuration:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://jamdungjobs.com',
  'https://www.jamdungjobs.com'
];
```

## 🗄️ Database Migration Strategy

Since production will use RDS PostgreSQL instead of DynamoDB, the current Prisma setup requires minimal changes:

### Environment Variables Update
```bash
# Development
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobboard

# Production
DATABASE_URL=postgresql://username:password@jamdung-prod-cluster.cluster-xxx.us-east-1.rds.amazonaws.com:5432/jobboard
```

### Terraform Updates Required
Replace DynamoDB resources with RDS Aurora Serverless:
```hcl
resource "aws_rds_cluster" "postgres" {
  cluster_identifier  = "jamdung-prod-cluster"
  engine             = "aurora-postgresql"
  engine_mode        = "serverless"
  database_name      = "jobboard"
  master_username    = var.db_username
  master_password    = var.db_password
  
  scaling_configuration {
    auto_pause               = true
    max_capacity            = 16
    min_capacity            = 2
    seconds_until_auto_pause = 300
  }
}
```

## 🚀 Deployment Pipeline Changes

### Current Staging Deployment (terraform/staging/)
- EC2 instance with Docker Compose
- Cloudflare Tunnel for external access
- Direct PostgreSQL on EC2
- Manual deployment process

### Production Deployment Pipeline
1. **Frontend Build & Deploy:**
   ```bash
   npm run build
   aws s3 sync build/ s3://prod-jamdungjobs.com-web/
   aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
   ```

2. **Backend Lambda Package & Deploy:**
   ```bash
   npm run build:lambda  # Package for Lambda
   aws lambda update-function-code --function-name prod-jobboard-api
   ```

3. **Database Migrations:**
   ```bash
   npx prisma migrate deploy  # Run against RDS
   ```

## 🔐 Security Considerations

### Environment Variables
**Development (docker-compose.yml):**
```yaml
environment:
  - JWT_SECRET=local_development_secret
  - DATABASE_URL=postgresql://postgres:password@db:5432/jobboard
```

**Production (Lambda):**
```hcl
environment {
  variables = {
    JWT_SECRET         = aws_secretsmanager_secret.jwt.name
    DATABASE_URL       = aws_rds_cluster.postgres.endpoint
    FILES_BUCKET       = aws_s3_bucket.files.bucket
  }
}
```

### Secrets Management
- JWT secrets in AWS Secrets Manager
- Database credentials in RDS parameter groups
- API keys in Systems Manager Parameter Store

## 📊 Monitoring & Analytics

### Development
- Plausible analytics container
- Local logs and console output
- Basic error handling

### Production
- CloudWatch Logs for Lambda functions
- CloudWatch Dashboard (terraform/main.tf:734-808)
- API Gateway request/error metrics
- CloudFront performance metrics
- RDS performance insights

### Custom Analytics Events
```javascript
// Current implementation (web-frontend)
const { trackJobSearch, trackJobApplication } = useJobAnalytics();

// Production will send to Lambda analytics function
trackJobSearch(query, { source: 'production' });
```

## 🔧 Infrastructure as Code Updates Needed

### 1. Replace DynamoDB with RDS
```bash
# Remove from terraform/main.tf
- aws_dynamodb_table resources (lines 153-310)
- DynamoDB IAM permissions (lines 480-497)

# Add to terraform/main.tf
+ aws_rds_cluster
+ aws_rds_cluster_instance
+ Database subnet group
+ Database security group
```

### 2. Update Lambda Environment Variables
```hcl
environment {
  variables = {
    DATABASE_URL       = "postgresql://${aws_rds_cluster.postgres.endpoint}/jobboard"
    FILES_BUCKET       = aws_s3_bucket.files.bucket
    JWT_SECRET         = aws_secretsmanager_secret.jwt.name
    NODE_ENV          = "production"
  }
}
```

### 3. Lambda IAM Permissions
```hcl
# Remove DynamoDB permissions, add RDS
{
  Effect = "Allow"
  Action = [
    "rds-db:connect",
    "rds:DescribeDBClusters"
  ]
  Resource = aws_rds_cluster.postgres.arn
}
```

## 🎯 Domain Strategy

### Primary Domains
- **jamdungjobs.com** - Main website
- **api.jamdungjobs.com** - API endpoints
- **jamdungjob.io** - Alternative domain (redirect?)

### SSL/TLS Configuration
```hcl
resource "aws_acm_certificate" "cert" {
  domain_name               = "jamdungjobs.com"
  subject_alternative_names = [
    "api.jamdungjobs.com",
    "www.jamdungjobs.com",
    "jamdungjob.io",
    "www.jamdungjob.io"
  ]
  validation_method = "DNS"
}
```

## 📝 Migration Checklist

### Pre-Deployment
- [ ] Update Terraform configuration for RDS
- [ ] Set up RDS Aurora Serverless cluster
- [ ] Configure Lambda environment variables
- [ ] Update CORS origins for production domains
- [ ] Package backend for Lambda deployment
- [ ] Build and test frontend for S3 hosting

### Deployment
- [ ] Deploy infrastructure via Terraform
- [ ] Run database migrations against RDS
- [ ] Deploy Lambda functions
- [ ] Upload frontend to S3
- [ ] Configure CloudFront distribution
- [ ] Update DNS records

### Post-Deployment
- [ ] Verify all API endpoints work
- [ ] Test file uploads to S3
- [ ] Validate Google OAuth integration
- [ ] Monitor CloudWatch logs
- [ ] Test application end-to-end

## 🔄 Rollback Strategy

### Database Rollback
- Aurora Serverless supports point-in-time recovery
- Keep snapshot before major migrations
- Prisma migrate rollback capabilities

### Application Rollback
- Lambda versioning for instant rollback
- S3 versioning for frontend assets
- CloudFront cache invalidation for immediate updates

---

*This architecture document serves as the definitive guide for production deployment, ensuring alignment between development and production environments while leveraging AWS serverless capabilities.*