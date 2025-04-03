# BingiTech Job Board - Local Development Guide

This guide will help you set up a local development environment that closely mirrors the AWS production environment. Using Docker Compose, we'll create a self-contained environment that simulates all the necessary AWS services without incurring any cloud costs.

## Overview

The local development environment consists of:

1. **LocalStack** - Emulates AWS services (S3, DynamoDB, Lambda, API Gateway, etc.)
2. **MongoDB** - Local database as an alternative to DynamoDB
3. **Express API Server** - Runs your backend code locally
4. **React Development Server** - Runs your frontend with hot reloading

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Git

## Directory Structure

Set up your project with the following structure:

```
bingitech-job-board/
├── .github/
│   └── workflows/
│       └── terraform-deploy.yml
├── terraform/
│   └── main.tf
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── backend/
│   ├── index.js
│   ├── analytics.js
│   └── package.json
├── local-dev/
│   ├── init-aws.sh
│   ├── backend-adapter.js
│   ├── Dockerfile.api
│   └── Dockerfile.frontend
└── docker-compose.yml
```

## Setup Instructions

### 1. Clone Your Repository

```bash
git clone https://github.com/your-username/bingitech-job-board.git
cd bingitech-job-board
```

### 2. Create Local Development Files

Create a `local-dev` directory and add the necessary files:

```bash
mkdir -p local-dev
# Copy the files provided in this guide to the local-dev directory
```

### 3. Set Up Docker Compose

Create a `docker-compose.yml` file in the root directory of your project:

```bash
# Copy the docker-compose.yml file provided in this guide
```

### 4. Prepare Your Backend

Ensure your backend code is in the `backend` directory:

```bash
# If starting with the code provided in the guide
mkdir -p backend
cp -r your-existing-backend/* backend/
```

### 5. Prepare Your Frontend

Ensure your frontend code is in the `frontend` directory:

```bash
# If starting with the code provided in the guide
mkdir -p frontend
cp -r your-existing-frontend/* frontend/
```

### 6. Start the Local Environment

```bash
docker-compose up
```

This will:
- Start LocalStack (AWS emulator)
- Start MongoDB
- Start your backend API server
- Start your frontend development server

## Accessing the Local Environment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **LocalStack Dashboard**: http://localhost:4566

## Testing with the Local Environment

### Login Credentials

The local environment is pre-configured with test accounts:

- **Employer**:
  - Email: employer@example.com
  - Password: password123

- **Candidate**:
  - Email: candidate@example.com
  - Password: password123

### Authentication

For API testing, use the token `dev-token` in your Authorization header:

```
Authorization: Bearer dev-token
```

To specify a role for testing, add the following header:

```
X-User-Role: employer
```

Valid roles are `employer` and `candidate`.

## Developer Workflow

1. **Frontend Development**:
   - Edit files in the `frontend/src` directory
   - Changes will automatically reload in the browser

2. **Backend Development**:
   - Edit files in the `backend` directory
   - The server will automatically restart when files change

3. **Testing Database Changes**:
   - MongoDB data is persisted across restarts in `./local-dev/mongodb`
   - You can use MongoDB Compass to connect to `mongodb://jobboard:jobboard@localhost:27017/jobboard?authSource=admin`

4. **Testing File Uploads**:
   - Files are stored in `./local-dev/uploads`
   - They are accessible via `http://localhost:5000/uploads/filename`

## Working with LocalStack

### AWS CLI with LocalStack

To use AWS CLI with LocalStack, prefix commands with `awslocal` or add `--endpoint-url=http://localhost:4566`:

```bash
# Using awslocal (if installed)
awslocal s3 ls

# Using standard AWS CLI
aws --endpoint-url=http://localhost:4566 s3 ls
```

### Viewing LocalStack Resources

```bash
# List S3 buckets
awslocal s3 ls

# List DynamoDB tables
awslocal dynamodb list-tables

# Describe a specific table
awslocal dynamodb describe-table --table-name local_Users
```

## Troubleshooting

### Container Startup Issues

If containers fail to start:

```bash
# View logs
docker-compose logs

# Restart specific service
docker-compose restart api
```

### Database Connection Issues

If the API can't connect to MongoDB:

```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb
```

### Resetting the Environment

To completely reset the environment:

```bash
# Stop all containers
docker-compose down

# Remove volumes (will delete all data)
docker-compose down -v

# Restart
docker-compose up
```

## Syncing with AWS Production

### Importing Production Data

For testing with production-like data:

1. Export data from DynamoDB in production
2. Convert to MongoDB format (script provided in `local-dev/convert-dynamo-to-mongo.js`)
3. Import to local MongoDB

### Testing with Production S3 Files

To test with files from production:

1. Configure AWS credentials for your production account
2. Use the AWS CLI to download files and upload them to LocalStack:

```bash
# Download from production
aws s3 sync s3://prod-jobs-bingitech-com-files ./temp-files

# Upload to LocalStack
awslocal s3 sync ./temp-files s3://local-jobs-bingitech-com-files
```

## Performance Optimization

- **Mount Volumes as Read-Only** when possible for better performance
- **Limit Services** - If you're only working on the frontend, you can run just the frontend service
- **Increase Docker Resources** - Allocate more CPU/memory to Docker in Docker Desktop settings

## Transitioning to Production

When you're ready to deploy to AWS:

1. Ensure your code works with the AWS services (not just the local adapters)
2. Run the Terraform deployment as described in the Terraform Deployment Guide
3. Use the GitHub Actions workflow for continuous deployment

---

By following this guide, you'll have a complete local development environment that closely mirrors your AWS production setup, allowing for faster development and testing without incurring AWS costs.



Benefits of This Approach

Cost Savings: No AWS charges during development
Speed: Faster development cycles with local services
Consistency: Environment closely matches production
Isolation: Separate from production environments
Convenience: Pre-configured test accounts and data


How to Use It

Create a local-dev directory in your project
Add the provided files to this directory
Place the docker-compose.yml file in your project root
Run docker-compose up

Once running, you can access:

Frontend at http://localhost:3000
Backend API at http://localhost:5000
Test with pre-configured users (employer@example.com/password123)
