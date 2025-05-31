# RDS PostgreSQL Instance
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.environment}-postgres-subnet-group"
  subnet_ids = ["${var.private_subnet_1}", "${var.private_subnet_2}"]

  tags = {
    Name        = "PostgreSQL DB subnet group"
    Environment = var.environment
  }
}

resource "aws_security_group" "postgres" {
  name        = "${var.environment}-postgres-sg"
  description = "Security group for PostgreSQL RDS"
  vpc_id      = var.vpc_id

  # Allow inbound traffic from the application security group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "PostgreSQL Security Group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "${var.environment}-jamdungjobs-db"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.micro"  # Cheapest option for production
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "jamdungjobs"
  username = "jamdung"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.postgres.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name

  # Backup configuration
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Performance Insights (free for t3.micro)
  performance_insights_enabled = true
  performance_insights_retention_period = 7  # Free tier: 7 days retention

  # Enhanced monitoring (optional)
  monitoring_interval = 0  # Disabled to stay within free tier

  # Auto minor version upgrades
  auto_minor_version_upgrade = true
  
  # Multi-AZ (disabled to keep costs down)
  multi_az = false

  # Storage autoscaling
  max_allocated_storage = 100  # GB

  # Deletion protection
  deletion_protection = true

  # Enable encryption
  storage_encrypted = true

  skip_final_snapshot = false
  final_snapshot_identifier = "${var.environment}-jamdungjobs-final-snapshot"

  tags = {
    Name        = "JamdungJobs PostgreSQL"
    Environment = var.environment
  }
}
