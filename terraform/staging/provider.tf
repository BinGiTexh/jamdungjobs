provider "aws" {
  region                  = "us-east-1"
  shared_config_files      = ["$HOME/.aws/config"]
  shared_credentials_files = ["$HOME/.aws/credentials"]
  profile                 = "personal"

  default_tags {
    tags = {
      Project     = "JamDungJobs"
      Environment = var.environment
      Terraform   = "true"
    }
  }
}
