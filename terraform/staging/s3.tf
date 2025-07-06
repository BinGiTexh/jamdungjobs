# S3 bucket for storing initialization scripts
resource "aws_s3_bucket" "init_scripts" {
  bucket = "jamdung-staging-init-scripts-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "jamdung-staging-init-scripts"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Random ID for bucket suffix to ensure uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "init_scripts" {
  bucket = aws_s3_bucket.init_scripts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "init_scripts" {
  bucket = aws_s3_bucket.init_scripts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "init_scripts" {
  bucket = aws_s3_bucket.init_scripts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload the init script to S3
resource "aws_s3_object" "init_script" {
  bucket = aws_s3_bucket.init_scripts.id
  key    = "scripts/init.sh"
  source = "${path.module}/user_data/init.sh"
  etag   = filemd5("${path.module}/user_data/init.sh")

  tags = {
    Name        = "init-script"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

