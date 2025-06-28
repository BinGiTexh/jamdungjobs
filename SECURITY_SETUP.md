# 🔒 Security Setup Guide

## GitHub Repository Variables & Secrets

### Required GitHub Repository Variables
Set these in **Settings → Secrets and variables → Actions → Variables**:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `STAGING_EC2_HOST` | EC2 instance IP address | `3.89.154.166` |
| `STAGING_EC2_USER` | SSH username | `ubuntu` |
| `STAGING_DEPLOY_PATH` | Deployment directory | `/home/ubuntu/jamdungjobs` |
| `STAGING_SITE_URL` | Public staging URL | `https://staging-jobs.bingitech.io` |
| `DOCKER_COMPOSE_FILE` | Docker compose file | `docker-compose.prod.yml` |

### Required GitHub Repository Secrets
Set these in **Settings → Secrets and variables → Actions → Secrets**:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `STAGING_SSH_PRIVATE_KEY` | SSH private key for EC2 access | Copy contents of `~/.ssh/jamdung-staging` |

## Environment Variables on Server

### Staging Server (.env file)
These should be set in `/home/ubuntu/jamdungjobs/.env` on your EC2 instance:

```bash
# Application
NODE_ENV=production
PORT=5000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[SECURE_RANDOM_PASSWORD]
POSTGRES_DB=jobboard
DB_PASSWORD=[SAME_AS_POSTGRES_PASSWORD]

# JWT
JWT_SECRET=[SECURE_RANDOM_JWT_SECRET]

# Redis
REDIS_URL=redis://redis:6379

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=[YOUR_TUNNEL_TOKEN]

# Google Maps API
GOOGLE_MAPS_API_KEY=[YOUR_API_KEY]

# Application URLs
FRONTEND_URL=[YOUR_STAGING_URL]
API_URL=[YOUR_API_URL]
```

## Security Best Practices

### ✅ What We Do Right
- ✅ Use GitHub Secrets for sensitive data (SSH keys)
- ✅ Use GitHub Variables for non-sensitive configuration
- ✅ No hardcoded secrets in code
- ✅ Environment-specific configuration files
- ✅ Proper SSH key permissions (600)

### 🔒 Additional Security Measures

#### 1. Rotate Secrets Regularly
- Change JWT secrets periodically
- Rotate database passwords
- Update SSH keys when team members change

#### 2. Environment Isolation
- Different secrets for staging vs production
- Separate AWS accounts/regions if possible
- Different database instances

#### 3. Access Control
- Limit GitHub repository access
- Use AWS IAM roles with minimal permissions
- Regular audit of who has access

#### 4. Monitoring
- Monitor deployment logs
- Set up alerts for failed deployments
- Track who deploys what and when

## Secret Generation

### Generate Secure JWT Secret
```bash
openssl rand -hex 32
```

### Generate Secure Database Password
```bash
openssl rand -base64 32
```

### Generate SSH Key Pair (if needed)
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jamdung-staging-new
```

## Troubleshooting

### Common Security Issues
1. **SSH Permission Denied**: Check key permissions (`chmod 600`)
2. **Environment Variables Not Set**: Verify GitHub variables are configured
3. **API Keys Not Working**: Ensure no extra spaces in secret values

### Verification Commands
```bash
# Check GitHub variables are set (run in Actions)
echo "EC2_HOST: ${{ vars.STAGING_EC2_HOST }}"
echo "SITE_URL: ${{ vars.STAGING_SITE_URL }}"

# Check server environment (SSH into server)
ssh -i ~/.ssh/jamdung-staging ubuntu@[EC2_HOST]
cd /home/ubuntu/jamdungjobs
cat .env | grep -v PASSWORD | grep -v SECRET | grep -v TOKEN
```

## Emergency Procedures

### If Secrets Are Compromised
1. **Immediately rotate** all affected secrets
2. **Update GitHub Secrets** with new values
3. **Update server .env** file with new values
4. **Restart services** to pick up new secrets
5. **Audit logs** to see if unauthorized access occurred

### If SSH Key Is Compromised
1. **Generate new SSH key pair**
2. **Add new public key** to EC2 instance
3. **Update GitHub Secret** with new private key
4. **Remove old public key** from EC2 instance
5. **Test deployment** with new key

---

**Remember**: Never commit secrets to version control, always use environment variables or GitHub Secrets!
