# 🚀 JamDung Jobs Manual Deployment Guide

## Overview
This project uses **manual-only deployments** to your AWS EC2 staging environment. No automatic deployments occur on push/merge - you have full control over when and what gets deployed.

## Quick Start

### 1. Pre-deployment Check
Before deploying, always run the pre-deployment check:
```bash
./scripts/pre-deploy-check.sh
```

### 2. Manual Deployment
1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select **"Manual Deploy to Staging"** workflow
4. Click **"Run workflow"**
5. Configure your deployment:
   - **Branch**: Choose which branch to deploy (default: main)
   - **Force rebuild**: Check if you want to rebuild Docker images
   - **Run tests**: Check to run post-deployment tests
   - **Deployment message**: Add a reason/note for this deployment

### 3. Monitor Deployment
- Watch the workflow progress in real-time
- Check the deployment summary when complete
- Visit your site: https://staging-jobs.bingitech.io

## Deployment Options

### Branch Selection
- Deploy from **any branch** (main, develop, feature branches, etc.)
- Useful for testing features before merging

### Force Rebuild
- **Unchecked** (default): Uses cached Docker images for faster deployment
- **Checked**: Rebuilds all Docker images from scratch (slower but ensures fresh build)

### Post-deployment Tests
- **Checked** (default): Runs basic API endpoint tests after deployment
- **Unchecked**: Skips tests for faster deployment

## Current Environment

### Staging Server
- **URL**: [Set via STAGING_SITE_URL variable]
- **Server**: AWS EC2 (us-east-1)
- **IP**: [Set via STAGING_EC2_HOST variable]
- **Services**: API, Frontend, PostgreSQL, Redis, Cloudflare Tunnel

### Architecture
```
GitHub → Manual Trigger → EC2 Staging → Cloudflare Tunnel → Public URL
```

## Troubleshooting

### Pre-deployment Issues
If `./scripts/pre-deploy-check.sh` fails:
- Ensure Docker is running locally
- Check that all Dockerfiles exist
- Verify production images can build

### Deployment Failures
If deployment fails:
- Check the GitHub Actions logs
- Previous deployment remains running (no downtime)
- Re-run deployment after fixing issues

### Health Check Failures
If health checks fail after deployment:
- API may need more time to start
- Check EC2 instance resources
- Verify environment variables are set

## Useful Commands

### Local Development
```bash
# Run local tests
./scripts/run-local-tests.sh smoke local

# Full environment sync check
./scripts/local-to-staging-sync.sh

# Pre-deployment validation
./scripts/pre-deploy-check.sh
```

### Manual Server Access
```bash
# SSH into staging server (replace with your actual IP)
ssh -i ~/.ssh/jamdung-staging ubuntu@[STAGING_EC2_HOST]

# Check running services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs api
```

## Best Practices

1. **Always run pre-deployment check** before deploying
2. **Test locally first** using the local testing scripts
3. **Use descriptive deployment messages** to track changes
4. **Deploy during low-traffic periods** when possible
5. **Monitor the deployment** until completion
6. **Verify the site works** after deployment

## Rollback Strategy

If you need to rollback:
1. The deployment creates automatic backups with timestamps
2. SSH into the server and restore the previous docker-compose file
3. Or deploy the previous working commit using the manual workflow

---

**Need help?** Check the GitHub Actions logs or run the pre-deployment check script for diagnostics.
