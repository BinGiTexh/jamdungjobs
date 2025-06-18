# Cloudflare Tunnel configuration for JamDung Jobs

# Cloudflare Tunnel token for authentication
resource "random_password" "db_password" {
  length  = 32
  special = false
}

# JWT secret for authentication
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Store secrets in AWS Secrets Manager
resource "aws_secretsmanager_secret" "jamdung_secrets" {
  name = "jamdung-staging-secrets"
  
  tags = {
    Environment = "staging"
    Application = "jamdung-jobs"
  }
}

resource "aws_secretsmanager_secret_version" "jamdung_secrets" {
  secret_id = aws_secretsmanager_secret.jamdung_secrets.id
  secret_string = jsonencode({
    db_password       = random_password.db_password.result
    jwt_secret        = random_password.jwt_secret.result
    cloudflare_token  = var.cloudflare_tunnel_token
  })
}
