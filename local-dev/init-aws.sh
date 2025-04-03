#!/bin/bash
# local-dev/init-aws.sh
# This script initializes the LocalStack environment with required AWS resources

echo "Initializing LocalStack AWS environment..."

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q "\"s3\": \"running\""; do
  sleep 1
done
echo "LocalStack is ready!"

# Set AWS CLI to use LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export ENDPOINT_URL=http://localhost:4566

# Create S3 buckets
echo "Creating S3 buckets..."
awslocal s3 mb s3://local-jobs-bingitech-com-web
awslocal s3 mb s3://local-jobs-bingitech-com-files
awslocal s3 mb s3://local-jobs-bingitech-com-logs

# Enable website hosting for the web bucket
awslocal s3 website s3://local-jobs-bingitech-com-web --index-document index.html --error-document index.html

# Create DynamoDB tables
echo "Creating DynamoDB tables..."

# Users table
awslocal dynamodb create-table \
  --table-name local_Users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}"

# Jobs table
awslocal dynamodb create-table \
  --table-name local_Jobs \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=employerId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=EmployerIndex,KeySchema=[{AttributeName=employerId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    "IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}"

# Applications table
awslocal dynamodb create-table \
  --table-name local_Applications \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=jobId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=JobIndex,KeySchema=[{AttributeName=jobId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    "IndexName=UserIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    "IndexName=JobUserIndex,KeySchema=[{AttributeName=jobId,KeyType=HASH},{AttributeName=userId,KeyType=RANGE}],Projection={ProjectionType=ALL}"

# Analytics table
awslocal dynamodb create-table \
  --table-name local_Analytics \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
    AttributeName=page,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=PageIndex,KeySchema=[{AttributeName=page,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL}"

# Create sample data
echo "Creating sample data..."

# Create an employer user
awslocal dynamodb put-item \
  --table-name local_Users \
  --item '{
    "id": {"S": "employer1"},
    "name": {"S": "Tech Company Ltd"},
    "email": {"S": "employer@example.com"},
    "password": {"S": "password123"},
    "role": {"S": "employer"},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

# Create a candidate user
awslocal dynamodb put-item \
  --table-name local_Users \
  --item '{
    "id": {"S": "candidate1"},
    "name": {"S": "John Doe"},
    "email": {"S": "candidate@example.com"},
    "password": {"S": "password123"},
    "role": {"S": "candidate"},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

# Create sample job listings
awslocal dynamodb put-item \
  --table-name local_Jobs \
  --item '{
    "id": {"S": "job1"},
    "employerId": {"S": "employer1"},
    "companyName": {"S": "Tech Company Ltd"},
    "title": {"S": "Senior Developer"},
    "description": {"S": "We are looking for a senior developer to join our team."},
    "requirements": {"S": "5+ years of experience with JavaScript and Node.js"},
    "location": {"S": "Kingston, Jamaica"},
    "jobType": {"S": "Full-time"},
    "salary": {"S": "$60,000 - $80,000"},
    "status": {"S": "active"},
    "featured": {"BOOL": true},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

awslocal dynamodb put-item \
  --table-name local_Jobs \
  --item '{
    "id": {"S": "job2"},
    "employerId": {"S": "employer1"},
    "companyName": {"S": "Tech Company Ltd"},
    "title": {"S": "Marketing Manager"},
    "description": {"S": "Marketing manager needed for tech company."},
    "requirements": {"S": "3+ years experience in digital marketing"},
    "location": {"S": "Montego Bay, Jamaica"},
    "jobType": {"S": "Full-time"},
    "salary": {"S": "$45,000 - $55,000"},
    "status": {"S": "active"},
    "featured": {"BOOL": false},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

echo "LocalStack environment setup complete!"
