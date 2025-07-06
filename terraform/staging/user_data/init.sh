#!/bin/bash
set -e

# Set up logging
LOG_FILE="/var/log/jamdungjobs-init.log"
exec > >(tee -a "$${LOG_FILE}") 2>&1

echo "[$(date)] Starting JamDung Jobs initialization"

# Function to log messages
log() {
    echo "[$(date)] $1"
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    exit 1
}

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

# Function to verify and set up Cloudflare tunnel
setup_cloudflare_tunnel() {
    log "Setting up Cloudflare tunnel..."
    
    # Create directory for cloudflared config
    mkdir -p /home/ubuntu/cloudflared
    chown -R ubuntu:ubuntu /home/ubuntu/cloudflared
    
    # Verify required environment variables are set
    if [ -z "$CLOUDFLARE_TUNNEL_ID" ] || [ -z "$CLOUDFLARE_TUNNEL_SECRET" ] || [ -z "$CLOUDFLARE_ACCOUNT_TAG" ]; then
        log "Warning: Cloudflare tunnel credentials not provided. Skipping tunnel setup."
        return 1
    fi
    
    # Create credentials file
    log "Creating Cloudflare tunnel credentials..."
    cat > /home/ubuntu/cloudflared/credentials.json <<CRED_EOL
{
    "AccountTag": "$CLOUDFLARE_ACCOUNT_TAG",
    "TunnelSecret": "$CLOUDFLARE_TUNNEL_SECRET",
    "TunnelID": "$CLOUDFLARE_TUNNEL_ID",
    "Type": "cfd_tunnel"
}
CRED_EOL
    
    chmod 600 /home/ubuntu/cloudflared/credentials.json
    chown ubuntu:ubuntu /home/ubuntu/cloudflared/credentials.json
    
    # Create cloudflared config file
    log "Creating Cloudflare tunnel configuration..."
    cat > /home/ubuntu/cloudflared/config.yml <<EOL
tunnel: $CLOUDFLARE_TUNNEL_ID
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
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=jobboard
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@postgres:5432/jobboard

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=/api
NEXT_PUBLIC_BASE_URL=https://staging-jobs.bingitech.io

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=$CLOUDFLARE_TUNNEL_TOKEN
CLOUDFLARE_ACCOUNT_TAG=$CLOUDFLARE_ACCOUNT_TAG
CLOUDFLARE_TUNNEL_ID=$CLOUDFLARE_TUNNEL_ID
CLOUDFLARE_TUNNEL_SECRET=$CLOUDFLARE_TUNNEL_SECRET
EOL

# Set proper permissions
chmod 600 .env
chown -R ubuntu:ubuntu .

# Start Docker services
log "Starting Docker services..."
cd /home/ubuntu/jamdungjobs

# Set the docker-compose file path
DOCKER_COMPOSE_FILE="/home/ubuntu/jamdungjobs/docker-compose.prod.yml"
log "Using docker-compose file: $DOCKER_COMPOSE_FILE"

# Build services with retry logic
build_services() {
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        log "Building services (attempt $((retry_count + 1))/$max_retries)..."
        if sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache"; then
            log "Services built successfully"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log "Build failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    error_exit "Failed to build services after $max_retries attempts"
}

# Start services with retry logic
start_services() {
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        log "Starting services (attempt $((retry_count + 1))/$max_retries)..."
        if sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE up -d"; then
            log "Services started successfully"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log "Start failed, cleaning up and retrying in 10 seconds..."
            sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE down || true
            sleep 10
        fi
    done
    
    error_exit "Failed to start services after $max_retries attempts"
}

# Build and start services
build_services
start_services

# Function to check if services are healthy
check_service_health() {
    local service=$1
    local max_retries=30
    local retry_count=0
    
    log "Checking health of service: $service"
    
    while [ $retry_count -lt $max_retries ]; do
        local status=$(sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -o "healthy")
        
        if [ "$status" = "healthy" ]; then
            log "Service $service is healthy"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        log "Service $service not healthy yet (attempt $retry_count/$max_retries)"
        sleep 10
    done
    
    log "Warning: Service $service did not become healthy after $max_retries attempts"
    return 1
}

# Check health of critical services
check_service_health "db"
check_service_health "redis"
check_service_health "api"
check_service_health "frontend"

# Verify all services are running
log "=== Current service status ==="
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps

# Function to check container logs
check_container_logs() {
    local container=$1
    log "=== Last 20 lines of $container logs ==="
    sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 $container || true
}

# Check logs for all services
for container in $(sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps --services); do
    check_container_logs $container
done

# Apply database schema and handle migrations
log "Initializing database schema..."
if ! sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma db push --accept-data-loss"; then
    log "Warning: Failed to push schema, trying alternative approach..."
    
    # Try to mark existing migrations as applied
    MIGRATIONS=$(sudo -u ubuntu bash -c "ls -1 /home/ubuntu/jamdungjobs/backend/prisma/migrations | grep -v migration_lock.toml | sort")
    for migration in $MIGRATIONS; do
        log "Marking migration $migration as applied..."
        sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma migrate resolve --applied $migration" || true
    done
    
    # Try pushing schema again
    sudo -u ubuntu bash -c "cd /home/ubuntu/jamdungjobs && docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma db push --accept-data-loss" || \
        error_exit "Failed to initialize database schema"

# Function to clean up Docker resources
cleanup_docker() {
    log "Cleaning up Docker resources..."
    
    # Stop and remove all containers
    log "Stopping and removing containers..."
    sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans --timeout 30 || true
    
    # Remove unused containers, networks, and images
    log "Pruning Docker system..."
    sudo -u ubuntu docker system prune -af --volumes || true
    
    # Remove dangling images
    log "Removing dangling images..."
    sudo -u ubuntu docker rmi $(sudo -u ubuntu docker images -f "dangling=true" -q) 2>/dev/null || true
    
    log "Docker cleanup completed"
}

# Clean up before starting services
cleanup_docker

# Start services with a clean state
log "Starting services with clean state..."
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE up --build -d

# Wait for services to be healthy
log "Waiting for services to become healthy..."
MAX_RETRIES=30
RETRY_COUNT=0
SERVICES_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "healthy"; then
        SERVICES_HEALTHY=true
        break
    fi
    log "Waiting for services to become healthy (attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$SERVICES_HEALTHY" = false ]; then
    log "Warning: Some services did not become healthy. Continuing anyway..."
    sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps
    sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50
fi

# Final status check
log "=== Final service status ==="
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps

# Check service logs for any errors
log "\n=== Service logs (last 20 lines) ==="
sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20

# Check database connection
log "\n=== Database connection test ==="
if sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE exec -T db pg_isready -U postgres; then
    log "Database connection successful"
else
    log "Warning: Could not connect to database"
fi

# Function to verify required environment variables
verify_environment() {
    log "Verifying environment configuration..."
    local missing_vars=()
    
    # List of required environment variables
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_EXPIRES_IN"
        "REDIS_URL"
        "NODE_ENV"
        "FRONTEND_URL"
        "API_URL"
        "CLOUDFLARE_ACCOUNT_TAG"
        "CLOUDFLARE_TUNNEL_ID"
        "CLOUDFLARE_TUNNEL_SECRET"
    )
    
    # Check each required variable
    for var in "$${required_vars[@]}"; do
        if [ -z "$${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    # Check if any variables are missing
    if [ $${#missing_vars[@]} -ne 0 ]; then
        log "✗ Missing required environment variables:"
        for var in "$${missing_vars[@]}"; do
            log "  - $var"
        done
        return 1
    else
        log "✓ All required environment variables are set"
        return 0
    fi
}

# Function to verify application health
verify_application_health() {
    log "Verifying application health..."
    local all_healthy=true
    
    # Check if API is responding
    local api_url="http://localhost:5000/health"
    log "Checking API health at $api_url..."
    
    if curl -s --fail --max-time 10 $api_url >/dev/null; then
        log "✓ API is responding successfully"
    else
        log "✗ API health check failed"
        all_healthy=false
        
        # Try to get more details about the failure
        log "API container status:"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps api || true
        log "API container logs (last 20 lines):"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 api || true
    fi
    
    # Check if frontend is serving
    local frontend_url="http://localhost:3000"
    log "Checking frontend at $frontend_url..."
    
    if curl -s --fail --max-time 10 $frontend_url >/dev/null; then
        log "✓ Frontend is serving successfully"
    else
        log "✗ Frontend is not responding"
        all_healthy=false
        
        # Try to get more details about the failure
        log "Frontend container status:"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps frontend || true
        log "Frontend container logs (last 20 lines):"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 frontend || true
    fi
    
    # Check database connection
    log "Verifying database connection..."
    if sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE exec -T db pg_isready -U postgres; then
        log "✓ Database connection successful"
    else
        log "✗ Could not connect to database"
        all_healthy=false
        
        # Check database container status
        log "Database container status:"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps db || true
        log "Database container logs (last 20 lines):"
        sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 db || true
    fi
    
    # Check Redis connection
    log "Verifying Redis connection..."
    if sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping | grep -q PONG; then
        log "✓ Redis connection successful"
    else
        log "✗ Could not connect to Redis"
        all_healthy=false
    fi
    
    # Check if all services are running
    log "\n=== Service Status ==="
    sudo -u ubuntu docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    if [ "$all_healthy" = true ]; then
        log "✓ All application components are healthy"
        return 0
    else
        log "✗ Some application components are not healthy"
        return 1
    fi
}

# Function to verify Cloudflare tunnel
verify_cloudflare_tunnel() {
    if [ -n "$CLOUDFLARE_TUNNEL_ID" ]; then
        log "Verifying Cloudflare tunnel..."
        
        # Install cloudflared if not installed
        if ! command -v cloudflared &> /dev/null; then
            log "Installing cloudflared..."
            curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
            chmod +x /usr/local/bin/cloudflared
        fi
        
        # Create systemd service for cloudflared
        log "Creating Cloudflare tunnel service..."
        cat > /etc/systemd/system/cloudflared.service <<SERVICE_EOL
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/cloudflared
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/ubuntu/cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOL

        # Enable and start the service
        systemctl daemon-reload
        systemctl enable cloudflared
        systemctl start cloudflared
        
        log "Cloudflare tunnel setup completed"
        
        # Check if the tunnel is connected with retries
        local max_retries=5
        local retry_count=0
        local tunnel_connected=false
        
        log "Verifying Cloudflare tunnel connection..."
        
        while [ $retry_count -lt $max_retries ]; do
            if curl -s http://localhost:8080/ready 2>/dev/null | grep -q '^\[\]'; then
                tunnel_connected=true
                break
            fi
            
            retry_count=$((retry_count + 1))
            log "Waiting for Cloudflare tunnel to connect (attempt $retry_count/$max_retries)..."
            sleep 5
        done
        
        if [ "$tunnel_connected" = true ]; then
            log "Cloudflare tunnel is running and connected"
            
            # Get tunnel info
            log "Tunnel information:"
            curl -s http://localhost:8080/status 2>/dev/null | jq '.' || true
            
            return 0
        else
            log "Warning: Cloudflare tunnel is not properly connected after $max_retries attempts"
            log "Check logs with: journalctl -u cloudflared -n 50 --no-pager"
            return 1
        fi
    fi
    
    log "Cloudflare tunnel verification skipped (no tunnel configured)"
    return 0
}

# Verify application health
verify_application_health

# Verify Cloudflare tunnel if configured
verify_cloudflare_tunnel || log "Warning: Cloudflare tunnel verification failed"

    # Print completion message
    log "=== Initialization completed successfully at $(date) ==="
    log "Log file: $LOG_FILE"
    log "==================================================="

    # Display important information
    echo ""
    echo "=== JamDung Jobs Deployment Summary ==="
    echo "API URL:      http://localhost:5000"
    echo "Frontend URL: http://localhost:3000"
    echo ""
    echo "To view logs: sudo tail -f $LOG_FILE"
    echo "To check services: cd /home/ubuntu/jamdungjobs && docker-compose ps"
    echo "To view service logs: cd /home/ubuntu/jamdungjobs && docker-compose logs -f"

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
