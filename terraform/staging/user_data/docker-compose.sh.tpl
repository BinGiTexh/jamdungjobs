#!/bin/bash
set -xe

apt-get update -y
apt-get install -y docker.io awscli git curl

# Install Docker Compose v2 CLI plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -sSL https://github.com/docker/compose/releases/download/v2.27.1/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Allow non-root Docker usage
if ! getent group docker >/dev/null; then
  groupadd docker
fi
usermod -aG docker ubuntu

# Fetch JWT secret from AWS Secrets Manager
JWT_SECRET_NAME="${jwt_secret_name}"
JWT_SECRET=$(aws --region us-east-1 secretsmanager get-secret-value \
  --secret-id $JWT_SECRET_NAME \
  --query SecretString --output text)

mkdir -p /opt/jamdung
cd /opt/jamdung

git clone https://github.com/BinGiTexh/jamdungjobs.git . || true

cp .env.template .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env

# Start the stack
docker compose -f docker-compose.yml up -d

# Cloudflare tunnel disabled for staging
# /usr/bin/docker run -d --name cloudflared --restart unless-stopped \
#   -v /root/.cloudflared:/etc/cloudflared \
#   cloudflare/cloudflared:latest tunnel run ${cloudflare_tunnel_id}
