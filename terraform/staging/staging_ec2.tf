# Staging EC2 stack to run the Docker-Compose MVP
# ------------------------------------------------
# This file contains the EC2 instance configuration for the staging environment

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

# Use the AWS key pair for EC2 instance access
resource "aws_key_pair" "jamdung" {
  key_name   = var.ssh_key_name
  public_key = file(var.public_key_path)
}

# Security Group for EC2 Instance
resource "aws_security_group" "staging_ec2" {
  name        = "jamdung-${var.environment}-ec2-sg"
  description = "Security group for JamDung Jobs ${var.environment} EC2 instance"
  vpc_id      = aws_vpc.staging.id

  # SSH access from admin IP only
  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "jamdung-${var.environment}-ec2-sg"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Generate JWT signing key
resource "random_password" "jwt_key" {
  length  = 64
  special = false
}

# JWT Secret in AWS Secrets Manager
resource "aws_secretsmanager_secret" "jwt" {
  name_prefix = "jamdung-${var.environment}-jwt-"
  
  tags = {
    Name        = "jamdung-${var.environment}-jwt"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  
  # Force a new secret to be created each time
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jwt_value" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = random_password.jwt_key.result
}

# Cloudflare Tunnel configuration is in cloudflare.tf

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "jamdung-staging-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

# IAM policy for EC2 instance
resource "aws_iam_role_policy" "ec2_access" {
  name = "jamdung-ec2-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags",
          "ec2:DescribeInstanceStatus"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:ListSecrets"
        ]
        Resource = [
          "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:jamdung_${var.environment}_jwt-*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.init_scripts.arn}/*"
        ]
      }
    ]
  })
}

# IAM instance profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "jamdung-staging-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "staging" {
  ami                    = var.ec2_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.staging_public_a.id  # Reference the public subnet directly from VPC
  vpc_security_group_ids = [aws_security_group.staging_ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.jamdung.key_name
  
  # Root volume configuration
  root_block_device {
    volume_size = 30  # 30GB root volume
    volume_type = "gp3"
    encrypted   = true
    delete_on_termination = true
  }
  
  # Instance metadata options for better security
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
    http_put_response_hop_limit = 2
    http_protocol_ipv6 = "disabled"
  }
  
  # User data script with all required variables
  user_data_replace_on_change = true
  user_data = base64encode(templatefile("${path.module}/user_data/bootstrap.sh", {
    s3_bucket              = aws_s3_bucket.init_scripts.id
    s3_key                 = aws_s3_object.init_script.key
    environment            = var.environment
    db_password           = random_password.db_password.result
    jwt_secret_name      = aws_secretsmanager_secret.jwt.name
    jwt_secret           = random_password.jwt_key.result
    cloudflare_tunnel_id   = var.cloudflare_tunnel_id
    cloudflare_tunnel_secret = var.cloudflare_tunnel_secret
    cloudflare_account_tag = var.cloudflare_account_tag
    cloudflare_tunnel_token = var.cloudflare_tunnel_token
    cloudflare_domain      = var.cloudflare_domain
  }))
  
  # Resource tags
  tags = merge(
    {
      Name        = "jamdung-${var.environment}"
      Environment = var.environment
      Project     = "jamdung-jobs"
      ManagedBy   = "terraform"
    },
    var.tags
  )
  
  # Lifecycle configuration
  lifecycle {
    ignore_changes = [
      ami,
      user_data,
      ebs_optimized
    ]
  }
  
  # Timeouts
  timeouts {
    create = "15m"
    update = "10m"
    delete = "10m"
  }
}
