# Release and Deployment Guide

This guide covers the process of creating new releases and deploying the JamDung Jobs application with proper versioning.

## Overview

The JamDung Jobs platform uses semantic versioning and Docker image tagging for releases. Each release includes:
- Version bumps in package.json files
- Docker images tagged with the release version
- Git tags for version tracking
- Automated deployment via GitHub Actions

## Release Process

### 1. Prepare the Release

```bash
# Ensure you're on the main branch
git checkout main
git pull origin main

# Update version numbers (already done for v1.1.0)
# - backend/package.json
# - web-frontend/package.json

# Update CHANGELOG.md with new features and changes
```

### 2. Build and Tag Docker Images

```bash
# Build images with version tags
./scripts/build-release.sh

# Or manually specify a version
./scripts/build-release.sh 1.1.0
```

This script will:
- Build both frontend and backend Docker images
- Tag them with the specified version
- Also tag as 'latest'

### 3. Test Locally

```bash
# Test the production build locally
docker-compose -f docker-compose.prod.yml up

# Verify all services are running
docker-compose -f docker-compose.prod.yml ps

# Test the application
curl http://localhost:5000/api/health
curl http://localhost/
```

### 4. Create Git Tag and Push

```bash
# Create a git tag for the release
git add .
git commit -m "chore: release version 1.1.0

- Update package.json versions to 1.1.0
- Add CHANGELOG entry for Google OAuth and responsive improvements
- Update docker-compose.prod.yml with versioned image tags
- Add release deployment documentation and scripts
"

# Create and push the version tag
git tag v1.1.0
git push origin main --tags
```

### 5. Deploy to Staging

Use the GitHub Actions manual deployment workflow:

1. Go to GitHub Actions in your repository
2. Select "Manual Deploy to Staging"
3. Click "Run workflow"
4. Configure the deployment:
   - **Branch**: `main`
   - **Force rebuild**: `true` (for new version)
   - **Run tests**: `true`
   - **Deployment message**: "Deploy v1.1.0 with Google OAuth and responsive improvements"

## Environment Variables for OAuth

Ensure these environment variables are properly set in your staging/production environment:

### Required for Google OAuth
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend OAuth Configuration (build-time)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Ensure existing variables are maintained
JWT_SECRET=your_jwt_secret
DB_PASSWORD=your_db_password
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
```

### Setting Environment Variables

#### For GitHub Actions Secrets:
1. Go to Repository Settings > Secrets and variables > Actions
2. Add the new OAuth secrets

#### For EC2 Environment:
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-staging-host

# Edit the environment file
sudo nano /home/ubuntu/jamdungjobs/.env.production

# Add the OAuth variables
echo "GOOGLE_CLIENT_ID=your_google_client_id" >> .env.production
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret" >> .env.production
```

## Rollback Procedure

If a deployment fails or issues are discovered:

### 1. Quick Rollback via Docker

```bash
# SSH to the server
ssh -i key.pem ubuntu@staging-host

cd /home/ubuntu/jamdungjobs

# Use a backup docker-compose file
cp docker-compose.prod.yml.backup-20240630-123456-abcd123 docker-compose.prod.yml

# Restart with previous version
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Rollback to Previous Git Version

```bash
# Find the previous working commit
git log --oneline

# Reset to previous version
git reset --hard [previous-commit-hash]

# Force rebuild and deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoring and Verification

### Health Checks
- **API Health**: `https://your-site.com/api/health`
- **Frontend**: `https://your-site.com`
- **Database Connection**: Checked via API health endpoint

### Log Monitoring
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f frontend

# Check system resources
docker stats
df -h
free -h
```

## Version 1.1.0 Features

### New in this release:
- **Google OAuth Authentication**: One-click login/signup with Google accounts
- **Enhanced Responsive Design**: Improved mobile and tablet experience
- **Security Improvements**: OAuth integration with secure token handling
- **Better User Experience**: Streamlined authentication flow

### Technical Changes:
- Updated authentication components in frontend
- New OAuth API endpoints in backend
- Improved responsive CSS and layouts
- Enhanced security middleware

## Troubleshooting

### Common Issues

#### OAuth Configuration Issues
```bash
# Check if OAuth environment variables are loaded
docker exec jamdungjobs-api env | grep GOOGLE

# Verify OAuth redirect URLs in Google Console match your domain
```

#### Image Build Issues
```bash
# Clear Docker cache and rebuild
docker system prune -f
./scripts/build-release.sh 1.1.0
```

#### SSL/HTTPS Issues with OAuth
```bash
# Ensure Cloudflare tunnel is properly configured
docker-compose logs cloudflared
```

### Getting Help

1. Check the application logs first
2. Verify all environment variables are set
3. Test OAuth configuration in Google Cloud Console
4. Ensure Cloudflare tunnel is working properly
5. Contact the development team with specific error messages

## Future Releases

For future releases:
1. Update the version numbers in both package.json files
2. Add entries to CHANGELOG.md
3. Update docker-compose.prod.yml with new version tags
4. Follow this deployment guide
5. Test thoroughly before deploying to production
