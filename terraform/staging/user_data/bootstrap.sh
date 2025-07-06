#!/bin/bash
set -e

# Set up logging
LOG_FILE="/var/log/jamdung-bootstrap.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date)] Starting JamDung Jobs bootstrap"

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    apt-get update -y
    apt-get install -y awscli
fi

# Create directory for scripts
mkdir -p /opt/jamdung-init
cd /opt/jamdung-init

# Download the main initialization script from S3
echo "Downloading initialization script from S3..."
aws s3 cp s3://${s3_bucket}/${s3_key} ./init.sh

# Make the script executable
chmod +x ./init.sh

# Execute the main initialization script with environment variables
echo "Executing main initialization script..."
export ENVIRONMENT="${environment}"
export DB_PASSWORD="${db_password}"
export JWT_SECRET_NAME="${jwt_secret_name}"
export JWT_SECRET="${jwt_secret}"
export CLOUDFLARE_TUNNEL_ID="${cloudflare_tunnel_id}"
export CLOUDFLARE_TUNNEL_SECRET="${cloudflare_tunnel_secret}"
export CLOUDFLARE_ACCOUNT_TAG="${cloudflare_account_tag}"
export CLOUDFLARE_TUNNEL_TOKEN="${cloudflare_tunnel_token}"
export CLOUDFLARE_DOMAIN="${cloudflare_domain}"

./init.sh

echo "[$(date)] Bootstrap completed successfully"

