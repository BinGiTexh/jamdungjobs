# JamDung Jobs v1.2 - Automated Deployment Setup Guide

## Overview
This guide sets up automated GitHub Actions deployment to your AWS EC2 staging instance at `3.89.154.166` for the v1.2 release.

## Prerequisites
- ✅ EC2 instance running at `3.89.154.166`
- ✅ SSH access to the EC2 instance  
- ✅ Docker and Docker Compose installed on EC2
- ✅ GitHub repository with push access
- ✅ Cloudflare tunnel configured (optional but recommended)

## 🔧 GitHub Repository Setup

### 1. Configure Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and Variables → Actions

**Required Secrets:**
```
STAGING_SSH_PRIVATE_KEY
```
- **Value**: Your SSH private key content that can access the EC2 instance
- **Format**: The entire contents of your private key file (e.g., `~/.ssh/id_rsa`)
- **Example**:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
  [... full key content ...]
  -----END OPENSSH PRIVATE KEY-----
  ```

### 2. Configure Repository Variables (Optional)

These are already set as defaults in the workflow, but you can override them:

```bash
STAGING_EC2_HOST=3.89.154.166
STAGING_EC2_USER=ubuntu  
STAGING_DEPLOY_PATH=/home/ubuntu/jamdungjobs
STAGING_SITE_URL=https://staging-jobs.bingitech.io
DOCKER_COMPOSE_FILE=docker-compose.prod.yml
```

## 🖥️ EC2 Instance Setup

### 1. Ensure SSH Access

Test SSH connection from your local machine:
```bash
ssh ubuntu@3.89.154.166
```

### 2. Verify Required Software

On the EC2 instance, ensure these are installed:
```bash
# Check Docker
docker --version
docker-compose --version

# Check Git
git --version

# Check system resources
free -h
df -h
```

### 3. Prepare Deployment Directory

```bash
# On EC2 instance
sudo mkdir -p /home/ubuntu/jamdungjobs
sudo chown -R ubuntu:ubuntu /home/ubuntu/jamdungjobs

# If first deployment, clone the repository
cd /home/ubuntu
git clone https://github.com/BinGiTexh/jamdungjobs.git
```

### 4. Create Environment Configuration

Create a `.env` file on the EC2 instance with your production settings:

```bash
# On EC2 instance
cd /home/ubuntu/jamdungjobs
cat > .env << 'EOF'
# Application
NODE_ENV=production
PORT=5000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_database_password_here
POSTGRES_DB=jobboard
DATABASE_URL=postgresql://postgres:your_secure_database_password_here@postgres:5432/jobboard

# JWT
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=/api
NEXT_PUBLIC_BASE_URL=https://staging-jobs.bingitech.io

# Stripe (use test keys for staging)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudflare Tunnel (if using)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
CLOUDFLARE_ACCOUNT_TAG=your_account_tag
CLOUDFLARE_TUNNEL_ID=your_tunnel_id
CLOUDFLARE_TUNNEL_SECRET=your_tunnel_secret

# Database password for Docker Compose
DB_PASSWORD=your_secure_database_password_here
EOF

# Secure the environment file
chmod 600 .env
```

## 🚀 Deployment Process

### Automatic Deployment

The deployment will trigger automatically when:
- Code is pushed to the `main` branch
- Changes are made outside of `terraform/`, `docs/`, `*.md`, or `testing/` directories

### Manual Deployment

You can trigger deployment manually:

1. Go to GitHub → Actions → "Deploy v1.2 to Staging"
2. Click "Run workflow"
3. Choose options:
   - **Force rebuild**: Forces Docker images to rebuild from scratch
   - **Skip tests**: Skips post-deployment verification tests

### Deployment Process Overview

1. **🔍 Pre-deployment Checks**
   - SSH connection test
   - Server health verification
   - Resource availability check

2. **💾 Backup Creation**
   - Creates timestamped backup of current deployment
   - Preserves environment configuration

3. **🔄 Code Update**
   - Fetches latest code from GitHub
   - Updates to specified commit/branch

4. **🏗️ Build & Deploy**
   - Updates Docker image tags to v1.2.0
   - Builds new Docker images
   - Starts services with health checks

5. **🗄️ Database Migration**
   - Applies new v1.2 schema changes (JobView table)
   - Handles migration conflicts gracefully

6. **✅ Verification & Testing**
   - Tests new v1.2 features (job tracking, billing, analytics)
   - Verifies core functionality
   - Checks performance and resources

7. **🧹 Cleanup**
   - Removes old Docker images
   - Cleans up old backups (keeps last 5)

## 🔧 Monitoring & Troubleshooting

### Check Deployment Status

```bash
# On EC2 instance
cd /home/ubuntu/jamdungjobs

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs api
docker-compose -f docker-compose.prod.yml logs frontend
```

### Manual Rollback

If deployment fails and automatic rollback doesn't work:

```bash
# On EC2 instance
cd /home/ubuntu

# List available backups
ls -la jamdungjobs_backup*

# Restore from specific backup
sudo rm -rf jamdungjobs
sudo cp -r jamdungjobs_backup_YYYYMMDD_HHMMSS jamdungjobs
cd jamdungjobs

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

```bash
# API health
curl http://localhost:5000/health

# Frontend health  
curl http://localhost:80

# Database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# View system resources
free -h
df -h
docker stats --no-stream
```

## 🔐 Security Considerations

### SSH Key Management
- Use a dedicated SSH key for GitHub Actions
- Restrict the key to only necessary commands if possible
- Regularly rotate SSH keys

### Environment Variables
- Never commit `.env` files to git
- Use strong, unique passwords for database and JWT secret
- Use Stripe test keys for staging environment
- Regularly rotate secrets

### EC2 Security
- Ensure EC2 security groups only allow necessary ports
- Keep the system updated: `sudo apt update && sudo apt upgrade`
- Monitor access logs: `sudo tail -f /var/log/auth.log`

## 📋 v1.2 Specific Features

The deployment includes verification of new v1.2 features:

### 🔔 Notification System
- Tests notification bell functionality
- Verifies mark-as-read behavior

### 💳 Billing Integration  
- Tests billing API endpoints
- Verifies Stripe integration security
- Checks subscription management

### 📊 Job Analytics
- Tests job view tracking
- Verifies analytics endpoints
- Checks real-time data collection

### 🎨 Theme Consistency
- Verifies Jamaica theme application
- Tests component styling consistency

## 🆘 Support & Troubleshooting

### Common Issues

**1. SSH Connection Failed**
```bash
# Check SSH key format
ssh-keygen -l -f /path/to/your/private/key

# Test connection manually
ssh -v ubuntu@3.89.154.166
```

**2. Docker Build Failed**
```bash
# On EC2, free up space
docker system prune -af
docker volume prune -f

# Check available space
df -h
```

**3. Database Migration Failed**
```bash
# On EC2, check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Reset database if needed (⚠️ DATA LOSS)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

**4. Environment Variables Missing**
```bash
# Check .env file exists and has correct permissions
ls -la .env
cat .env

# Recreate if needed (see step 4 in EC2 setup)
```

### Getting Help

- Check GitHub Actions logs for detailed error messages
- SSH into EC2 and check service logs
- Verify all environment variables are set correctly
- Ensure sufficient disk space and memory on EC2

---

🎉 **Ready to Deploy!** 

Once everything is configured, push your v1.2 code to the `main` branch and watch the automated deployment in action!

**Deployment URL**: https://staging-jobs.bingitech.io  
**Monitoring**: GitHub Actions → Deploy v1.2 to Staging