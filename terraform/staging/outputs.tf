output "staging_vpc_id" {
  description = "ID of the staging VPC"
  value       = aws_vpc.staging.id
}

output "staging_public_subnet_id" {
  description = "Public subnet used by EC2"
  value       = aws_subnet.staging_public_a.id
}

output "staging_ec2_public_ip" {
  description = "Public IP for SSH access (restricted to admin CIDR)"
  value       = aws_instance.staging.public_ip
}

output "cloudflare_tunnel_connection_instructions" {
  description = "Instructions for connecting to the Cloudflare Tunnel"
  value = <<-EOT
    
    Cloudflare Tunnel Connection Instructions:
    =========================================
    
    Your application is accessible via the following URLs:
    - Frontend: https://${var.cloudflare_domain}
    - API: https://api.${var.cloudflare_domain}
    
    To connect to the instance via SSH (restricted to admin CIDR):
    ssh -i your-key.pem ubuntu@${aws_instance.staging.public_ip}
    
    Cloudflare Tunnel Status:
    - Tunnel ID: ${var.cloudflare_tunnel_id}
    - Domain: ${var.cloudflare_domain}
    
    Note: The instance is not publicly accessible except through the Cloudflare Tunnel.
    All traffic is routed through Cloudflare's global network for security.
    
    To view logs:
    ssh -i your-key.pem ubuntu@${aws_instance.staging.public_ip} "journalctl -u cloudflared -f"
    
    To check application status:
    ssh -i your-key.pem ubuntu@${aws_instance.staging.public_ip} "docker ps"
    
    EOT
  
  # This output is sensitive as it contains connection details
  sensitive = true
}
