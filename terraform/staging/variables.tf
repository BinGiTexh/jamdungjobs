
# AWS Configuration
variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "profile" {
  type        = string
  description = "AWS profile to use for authentication"
  default     = "default"
}

# EC2 Configuration
variable "environment" {
  type        = string
  description = "Environment name (e.g., staging, production)"
  default     = "staging"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.medium"
}

variable "ec2_ami" {
  type        = string
  description = "AMI ID for the EC2 instance"
  default     = "ami-0fc5d935ebf8bc3bc" # Ubuntu 22.04 LTS
}

variable "ssh_key_name" {
  type        = string
  description = "Name of the EC2 key pair"
}

variable "public_key_path" {
  type        = string
  description = "Path to the public key file"
}

# VPC Configuration
variable "vpc_id" {
  type        = string
  description = "VPC ID where the instance will be launched"
  default     = ""  # Will be created by the VPC module
}

# Cloudflare Configuration
variable "cloudflare_tunnel_id" {
  type        = string
  description = "Cloudflare Tunnel ID"
}

variable "cloudflare_tunnel_secret" {
  type        = string
  description = "Cloudflare Tunnel Secret"
  sensitive   = true
}

variable "cloudflare_tunnel_token" {
  type        = string
  description = "Cloudflare Tunnel Token for authentication"
  sensitive   = true
}

variable "cloudflare_account_tag" {
  type        = string
  description = "Cloudflare Account Tag"
}

variable "cloudflare_domain" {
  type        = string
  description = "Base domain for Cloudflare routing"
  default     = "staging-jobs.bingitech.io"
}

# JWT Configuration
variable "jwt_secret_name" {
  type        = string
  description = "Name of the AWS Secrets Manager secret containing JWT secret"
  default     = "jamdung-staging-jwt"
}

# Security
variable "admin_cidr" {
  type        = string
  description = "CIDR block for admin access (SSH)"
  default     = "0.0.0.0/0"  # Restrict this in production!
}

# Database
variable "tags" {
  type        = map(string)
  description = "A map of tags to add to all resources"
  default     = {}
}

variable "db_password" {
  type        = string
  description = "Database password"
  sensitive   = true
  default     = "" # Will be generated if left empty
}
