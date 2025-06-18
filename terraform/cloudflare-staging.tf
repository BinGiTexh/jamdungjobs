# Cloudflare provider configuration for staging-jobs.bingitech.io

# Configure the Cloudflare provider
# You'll need to set CLOUDFLARE_EMAIL and CLOUDFLARE_API_TOKEN environment variables
provider "cloudflare" {
  email     = var.cloudflare_email
  api_token = var.cloudflare_api_token
}

# Get the zone ID for bingitech.io
data "cloudflare_zones" "bingitech" {
  filter {
    name = "bingitech.io"
  }
}

# Create a DNS record for the staging environment
resource "cloudflare_record" "staging_jobs" {
  zone_id = data.cloudflare_zones.bingitech.zones[0].id
  name    = "staging-jobs"
  value   = aws_instance.staging.public_ip  # Reference to the EC2 instance's public IP
  type    = "A"
  ttl     = 300  # 5 minutes TTL for easier updates
  proxied = true  # Enable Cloudflare proxy for security and performance
}

# Output the staging URL
output "staging_jobs_url" {
  description = "URL for the staging environment"
  value       = "https://staging-jobs.bingitech.io"
}

# Add variables for Cloudflare credentials
variable "cloudflare_email" {
  description = "Email address for Cloudflare account"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "API token for Cloudflare"
  type        = string
  sensitive   = true
}
