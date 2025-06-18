# JamDung Jobs Staging Environment

This directory contains the Terraform configuration for deploying the JamDung Jobs staging environment on AWS EC2 with Cloudflare Tunnel.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform v1.0+ installed
3. Cloudflare account with a zone for `bingitech.io`
4. Cloudflare Tunnel created in the Cloudflare dashboard

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/BinGiTexh/jamdungjobs.git
   cd jamdungjobs/terraform/staging
   ```

2. **Create a `terraform.tfvars` file**
   Copy the example configuration and update with your values:
   ```hcl
   cp terraform.tfvars.example terraform.tfvars
   ```

3. **Update the following variables in `terraform.tfvars`**:
   - `aws_region`: AWS region (default: us-east-1)
   - `profile`: AWS profile name
   - `ssh_key_name`: Name of your EC2 key pair
   - `public_key_path`: Path to your public key file
   - `vpc_id`: Your VPC ID
   - `public_subnet`: Public subnet ID
   - `cloudflare_tunnel_id`: Your Cloudflare Tunnel ID
   - `cloudflare_tunnel_secret`: Your Cloudflare Tunnel Secret
   - `cloudflare_tunnel_token`: Your Cloudflare Tunnel Token
   - `cloudflare_account_tag`: Your Cloudflare Account Tag
   - `admin_cidr`: Your IP address with /32 suffix for SSH access

## Deployment

1. **Initialize Terraform**
   ```bash
   terraform init
   ```

2. **Review the execution plan**
   ```bash
   terraform plan
   ```

3. **Apply the configuration**
   ```bash
   terraform apply
   ```

4. **Access the application**
   - Frontend: https://staging-jobs.bingitech.io
   - API: https://api.staging-jobs.bingitech.io

## Cloudflare Tunnel Setup

1. Create a new tunnel in the Cloudflare dashboard
2. Copy the tunnel credentials (ID, secret, and token)
3. Update the `terraform.tfvars` file with these values
4. The tunnel will be automatically configured on the EC2 instance

## Monitoring

- **CloudWatch Logs**: View application logs in CloudWatch
- **Cloudflare Analytics**: Monitor traffic and performance in the Cloudflare dashboard
- **EC2 Instance**: SSH into the instance for troubleshooting

## Clean Up

To destroy all resources:

```bash
terraform destroy
```

## Security Notes

- Always restrict `admin_cidr` to your IP address in production
- Rotate database passwords and JWT secrets regularly
- Enable Cloudflare security features (WAF, Rate Limiting, etc.)
- Monitor Cloudflare Tunnel logs for any suspicious activity
