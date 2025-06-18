#!/bin/bash
set -e

# Update and upgrade system packages
echo "Updating and upgrading system packages..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    jq \
    unzip

# Install Node.js 18.x
echo "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Yarn
echo "Installing Yarn..."
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update && apt-get install -y yarn

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure Docker service
echo "Configuring Docker service..."
systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group and start Docker on boot
usermod -aG docker ubuntu
chmod 666 /var/run/docker.sock

# Create directory for cloudflared config
mkdir -p /home/ubuntu/cloudflared

# Create credentials file for cloudflared
echo '{"AccountTag":"${cloudflare_account_tag}","TunnelSecret":"${cloudflare_tunnel_secret}","TunnelID":"${cloudflare_tunnel_id}"}' > /home/ubuntu/cloudflared/credentials.json
chmod 600 /home/ubuntu/cloudflared/credentials.json

# Create cloudflared config file
cat > /home/ubuntu/cloudflared/config.yml <<EOL
tunnel: ${cloudflare_tunnel_id}
credentials-file: /etc/cloudflared/credentials.json
logfile: /var/log/cloudflared.log
loglevel: info

ingress:
  # Frontend traffic
  - hostname: staging-jobs.bingitech.io
    service: http://frontend:3000
    originRequest:
      noTLSVerify: true
      http2Origin: true
      connectTimeout: 30s
      tlsTimeout: 10s
      tcpKeepAlive: 30s
      noHappyEyeballs: true
      keepAliveConnections: 10
      keepAliveTimeout: 90s
      chunkedEncoding: true
  # API traffic
  - hostname: api.staging-jobs.bingitech.io
    service: http://api:5000
    originRequest:
      noTLSVerify: true
  # Block all other traffic
  - service: http_status:404
EOL

# Get the current region
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Create necessary directories
echo "Creating directories..."
mkdir -p /home/ubuntu/jamdungjobs/{logs,data/{postgres,redis}}
chown -R ubuntu:ubuntu /home/ubuntu/jamdungjobs

# Clone the repository
echo "Cloning repository..."
cd /home/ubuntu
if [ ! -d "jamdungjobs" ]; then
    git clone https://github.com/BinGiTexh/jamdungjobs.git
    chown -R ubuntu:ubuntu jamdungjobs
fi

# Navigate to the project directory
cd /home/ubuntu/jamdungjobs

# Create comprehensive .env file
echo "Creating environment configuration..."
cat > .env <<EOL
# Application
NODE_ENV=production
PORT=5000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${db_password}
POSTGRES_DB=jobboard
DATABASE_URL=postgresql://postgres:${db_password}@postgres:5432/jobboard

# JWT
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=/api
NEXT_PUBLIC_BASE_URL=https://staging-jobs.bingitech.io

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=${cloudflare_tunnel_token}
CLOUDFLARE_ACCOUNT_TAG=${cloudflare_account_tag}
CLOUDFLARE_TUNNEL_ID=${cloudflare_tunnel_id}
CLOUDFLARE_TUNNEL_SECRET=${cloudflare_tunnel_secret}
EOL

# Set proper permissions
chmod 600 .env
chown -R ubuntu:ubuntu .

# Start Docker services
echo "Starting Docker services..."
cd /home/ubuntu/jamdungjobs

# Set the docker-compose file path
DOCKER_COMPOSE_FILE="/home/ubuntu/jamdungjobs/docker-compose.prod.yml"
echo "Using docker-compose file: $DOCKER_COMPOSE_FILE"

# Build and start the services
echo "Building and starting services with Docker Compose..."
sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache"
sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE up -d"

# Wait for services to be healthy
echo "Waiting for services to become healthy..."
for i in {1..10}; do
    if sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "healthy"; then
        echo "Services are healthy!"
        break
    fi
    echo "Waiting for services to become healthy (attempt $i/10)..."
    sleep 10
done

# Verify the services are running
echo "Checking service status..."
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps

# Apply database migrations
echo "Applying database migrations..."
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma migrate deploy

# Restart services to apply migrations and ensure everything is fresh
echo "Restarting services to apply migrations..."
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE down
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Final status check
echo "Final service status:"
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps

# Set up log rotation
echo "Configuring log rotation..."
cat > /etc/logrotate.d/docker-containers <<EOL
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=100M
  missingok
  delaycompress
  copytruncate
}
EOL

echo "Initialization complete!"

# Print instance information
echo "Instance IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
