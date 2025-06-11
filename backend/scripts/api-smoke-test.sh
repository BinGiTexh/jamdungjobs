#!/usr/bin/env bash
# Simple curl-based smoke test for JamDung Jobs API.
# Requires jq.

set -euo pipefail
API_URL="${API_URL:-http://localhost:5000/api}"

# Credentials (adjust or export env vars before running)
JOBSEEKER_EMAIL="${JOBSEEKER_EMAIL:-testjobseeker@jamdungjobs.com}"
JOBSEEKER_PASSWORD="${JOBSEEKER_PASSWORD:-Test@123}"
EMPLOYER_EMAIL="${EMPLOYER_EMAIL:-testemployer@jamdungjobs.com}"
EMPLOYER_PASSWORD="${EMPLOYER_PASSWORD:-Test@123}"

echo "===> Health check"
curl -sf "$API_URL/health" | jq .

echo "===> Login as jobseeker"
JOBSEEKER_TOKEN=$(curl -sf -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$JOBSEEKER_EMAIL\",\"password\":\"$JOBSEEKER_PASSWORD\"}" | jq -r .token)

echo "Jobseeker JWT: ${JOBSEEKER_TOKEN:0:20}…"

echo "===> Login as employer"
EMPLOYER_TOKEN=$(curl -sf -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMPLOYER_EMAIL\",\"password\":\"$EMPLOYER_PASSWORD\"}" | jq -r .token)

echo "Employer JWT: ${EMPLOYER_TOKEN:0:20}…"

echo "===> Public job list"
curl -sf "$API_URL/jobs?limit=3" | jq '.data | length'

echo "===> Jobseeker – list own applications"
curl -sf "$API_URL/jobseeker/applications?limit=3" -H "Authorization: Bearer $JOBSEEKER_TOKEN" | jq '.applications | length'

echo "===> Employer – list applications to their jobs"
curl -sf "$API_URL/employer/applications?limit=3" -H "Authorization: Bearer $EMPLOYER_TOKEN" | jq '.applications | length'

echo "===> Notifications"
curl -sf "$API_URL/notifications?limit=3" -H "Authorization: Bearer $JOBSEEKER_TOKEN" | jq '.data? // .notifications?'

echo "All basic endpoint checks passed ✔"
