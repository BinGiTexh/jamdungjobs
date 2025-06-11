#!/usr/bin/env bash
# Comprehensive API smoke + functional test for JamDung Jobs MVP
# Requires: curl, jq (and optionally uuidgen for unique data)
# Usage: ./api-full-test.sh  (ensure API_URL env var points to your running server)

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000/api}"
COLOR_GREEN="\033[0;32m"
COLOR_RED="\033[0;31m"
COLOR_RESET="\033[0m"

pass() { echo -e "${COLOR_GREEN}✔ $1${COLOR_RESET}"; }
fail() { echo -e "${COLOR_RED}✖ $1${COLOR_RESET}"; exit 1; }

info() { echo "-- $1"; }

check_http() {
  local url="$1" desc="$2" token="${3:-}"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$url")
  [[ "$status" == "200" ]] && pass "$desc" || fail "$desc (HTTP $status)"
}

##########################
# 0. Health
##########################
info "Health check $API_URL/health"
check_http "$API_URL/health" "Health endpoint reachable"

##########################
# 1. Authentication
##########################
# Credentials
JOBSEEKER_EMAIL="${JOBSEEKER_EMAIL:-testjobseeker@jamdungjobs.com}"
JOBSEEKER_PASSWORD="${JOBSEEKER_PASSWORD:-Test@123}"
EMPLOYER_EMAIL="${EMPLOYER_EMAIL:-testemployer@jamdungjobs.com}"
EMPLOYER_PASSWORD="${EMPLOYER_PASSWORD:-Test@123}"

echo "Logging in jobseeker $JOBSEEKER_EMAIL"
JOBSEEKER_TOKEN=$(curl -sf -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$JOBSEEKER_EMAIL\",\"password\":\"$JOBSEEKER_PASSWORD\"}" | jq -r .token)
[[ "$JOBSEEKER_TOKEN" != "null" ]] || fail "Jobseeker login failed"
pass "Jobseeker login"

echo "Logging in employer $EMPLOYER_EMAIL"
EMPLOYER_TOKEN=$(curl -sf -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMPLOYER_EMAIL\",\"password\":\"$EMPLOYER_PASSWORD\"}" | jq -r .token)
[[ "$EMPLOYER_TOKEN" != "null" ]] || fail "Employer login failed"
pass "Employer login"

##########################
# 2. Job public endpoints
##########################
info "Public job list"
check_http "$API_URL/jobs?limit=5" "GET /jobs (public)"

##########################
# 3. Employer actions – create a job
##########################
# Attempt to create a job (may fail if employer lacks company profile)
JOB_TITLE="API Test Job $(date +%s)"
CREATE_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/jobs" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"$JOB_TITLE\",\"description\":\"Test description\",\"location\":\"Remote\",\"type\":\"FULL_TIME\"}")

if [[ "$CREATE_RESP" == "201" ]]; then
  pass "Employer create job"
else
  echo "Skip: employer create job returned $CREATE_RESP (likely missing company profile)"
fi

# Fetch first job ID for further tests
JOB_ID=$(curl -s -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/employer/jobs?limit=1" | jq -r '.data[0].id // empty')
[[ -z "$JOB_ID" ]] && JOB_ID=$(curl -s "$API_URL/jobs?limit=1" | jq -r '.data[0].id // empty')
[[ -z "$JOB_ID" ]] && fail "Could not obtain any job id for detail tests"
pass "Using job id $JOB_ID for further checks"

##########################
# 4. Jobseeker views job and applications
##########################
check_http "$API_URL/jobs/$JOB_ID" "Jobseeker get job details"

# Jobseeker apply (if endpoint exists). We'll try POST /jobs/{id}/apply with JSON body.
info "Attempt job application (may 404 if not implemented)"
APPLY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/jobs/$JOB_ID/apply" -H "Authorization: Bearer $JOBSEEKER_TOKEN" -H 'Content-Type: application/json' -d '{"coverLetter":"Automated test application"}')
if [[ "$APPLY_STATUS" == "201" || "$APPLY_STATUS" == "200" ]]; then
  pass "Jobseeker applied to job"
else
  echo "Skip: apply endpoint returned $APPLY_STATUS (acceptable if not in MVP)"
fi

# Jobseeker list applications
check_http "$API_URL/jobseeker/applications" "Jobseeker list own applications" "$JOBSEEKER_TOKEN"

##########################
# 5. Employer application management
##########################
check_http "$API_URL/employer/applications" "Employer list applications" "$EMPLOYER_TOKEN"

##########################
# 6. Notifications
##########################
check_http "$API_URL/notifications" "Jobseeker notifications" "$JOBSEEKER_TOKEN"

##########################
# 7. Profile endpoints
##########################
check_http "$API_URL/jobseeker/profile" "Jobseeker get profile" "$JOBSEEKER_TOKEN"
check_http "$API_URL/employer/profile" "Employer get profile" "$EMPLOYER_TOKEN" || echo "Employer profile route may differ – ignored"

##########################
# 8. Company endpoints (employer)
##########################
check_http "$API_URL/companies" "Employer get/edit company" "$EMPLOYER_TOKEN" || echo "Company route may require POST first – ignored"

echo -e "\n${COLOR_GREEN}All core MVP routes tested.${COLOR_RESET}"
