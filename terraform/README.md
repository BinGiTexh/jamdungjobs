# JamDung Jobs – Terraform Infrastructure

This directory now contains two deployment patterns:

1. **Static / Serverless prod** – existing `main.tf` provisions S3 + CloudFront for the React build and a Lambda / API Gateway backend.
2. **Docker-Compose staging** – new `staging_ec2.tf` spins up a single EC2 box that runs the full monolithic stack via `docker-compose.yml`. Ideal for QA.

---
## Prerequisites
* AWS CLI authenticated with profile `personal`  
  `aws configure --profile personal`
* Terraform ≥ 1.5 installed  
* A public / private SSH key-pair for emergency access (`ssh_key_name`).  
* Cloudflare tunnel already created; grab `cloudflare_tunnel_id` and place credentials JSON on your laptop (first run will guide you).

---
## Variables to supply
| Variable | Example | Purpose |
|----------|---------|---------|
| `ssh_key_name`        | `jamdung`            | EC2 key-pair in AWS |
| `public_key_path`     | `~/.ssh/id_rsa.pub`  | Local pub key file |
| `vpc_id`              | `vpc-abc123`         | VPC to deploy into |
| `public_subnet_id`    | `subnet-abc123`      | Subnet with IGW |
| `az`                  | `us-east-1a`         | Availability zone for EBS |
| `cloudflare_tunnel_id`| `my-tunnel-id`       | Existing CF tunnel |

Optional: `jwt_secret_name`, `ec2_ami`.

Create a **tfvars** file (e.g. `staging.auto.tfvars`):
```hcl
ssh_key_name        = "jamdung"
public_key_path     = "~/.ssh/id_rsa.pub"
vpc_id              = "vpc-0a1b2c3d4e"
public_subnet_id    = "subnet-0a1b2c3d4e"
az                  = "us-east-1a"
cloudflare_tunnel_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---
## One-time secret creation (AWS CLI)
```bash
aws --profile personal secretsmanager create-secret \
  --name jamdung_staging_jwt \
  --description "JWT signing key" \
  --secret-string "$(openssl rand -hex 48)"
```

---
## Deploy staging stack
```bash
cd terraform
terraform init
terraform workspace new staging || terraform workspace select staging
terraform apply -auto-approve -var-file=staging.auto.tfvars -profile personal
```
The user-data script will:
1. Install Docker & git
2. Clone the repo
3. Inject JWT secret into `.env`
4. `docker compose up -d`
5. Launch `cloudflared` so the service is instantly reachable via your Cloudflare tunnel URL.

---
## QA Test-Plan mail
Send an email to beta testers:
```text
Subject: Help Us Test JamDung Jobs (Staging)

Big up! We’re almost ready to launch JamDung Jobs and would love your feedback.

🔗 Staging site: https://staging.jobs.yourdomain.com
🗓️ Testing window: <date–date>

What to test
------------
* Job-seeker
  • Sign-up, complete profile, search, quick-apply
* Employer
  • Sign-up, create company, post job, review applications
* General
  • Mobile responsiveness, skill match scores, performance

How to report bugs (2 mins)
--------------------------
1. Open our short Google Form: https://forms.gle/<your-form>
2. Provide URL, steps, expected vs actual, screenshot.
3. Submit ✅ – Our AI assistant triages issues instantly.

We’ll push fixes daily; feel free to retest and re-submit anytime.

Respect & thanks,
BingiTech ⏤ JamDung Jobs team
```

Google Form tips
* Require “Page URL” (prefill via JS snippet) and “Severity”.
* Enable file uploads for screenshots (max 10 MB).
* Use an Apps Script trigger (`onFormSubmit`) that creates a GitHub issue titled `[QA] …` so fixes land in our kanban board.

---
## Confidence in MVP
Automated smoke tests + manual QA show:
* All critical REST endpoints for job-seeker & employer return 2xx.
* Logo upload & job creation issues fixed (whitelisting).
* Frontend reflects applied jobs & skill matches.
* JWT auth, CORS, and `/api` prefix verified.

Pending: notification feature & security hardening (already planned). Otherwise the stack is production-ready for a limited beta.
