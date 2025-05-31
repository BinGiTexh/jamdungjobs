# RDS Variables
variable "vpc_id" {
  description = "VPC ID where RDS will be deployed"
  type        = string
}

variable "private_subnet_1" {
  description = "First private subnet ID for RDS"
  type        = string
}

variable "private_subnet_2" {
  description = "Second private subnet ID for RDS"
  type        = string
}

variable "app_security_group_id" {
  description = "Security group ID of the application that will connect to RDS"
  type        = string
}

variable "db_password" {
  description = "Password for the RDS master user"
  type        = string
  sensitive   = true
}