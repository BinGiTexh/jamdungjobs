#!/usr/bin/env bash
# Scenario: Employer creates company + job, Jobseeker searches & applies, Employer sees notification
set -euo pipefail
API_URL=${API_URL:-http://localhost:5000/api}
JOBSEEKER_EMAIL="${JOBSEEKER_EMAIL:-testjobseeker@jamdungjobs.com}"
JOBSEEKER_PASSWORD="${JOBSEEKER_PASSWORD:-Test@123}"
EMPLOYER_EMAIL="${EMPLOYER_EMAIL:-testemployer@jamdungjobs.com}"
EMPLOYER_PASSWORD="${EMPLOYER_PASSWORD:-Test@123}"

cyan='\033[0;36m'; green='\033[0;32m'; red='\033[0;31m'; reset='\033[0m'
log(){ echo -e "${cyan}-- $*${reset}"; }
pass(){ echo -e "${green}✔ $*${reset}"; }
fail(){ echo -e "${red}✖ $*${reset}"; exit 1; }

json() { jq -c "."; }

wait_health() {
  echo "Waiting for API to be healthy ..."
  for i in {1..60}; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health") || true
    if [[ "$code" == "200" ]]; then return 0; fi
    sleep 1
  done
  echo "API not healthy after wait" >&2; exit 1
}

wait_health

log "Login employer $EMPLOYER_EMAIL"
for i in {1..60}; do
  RAW=$(curl -s -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMPLOYER_EMAIL\",\"password\":\"$EMPLOYER_PASSWORD\"}")
  if echo "$RAW" | jq -e '.token' >/dev/null 2>&1; then break; fi
  echo "Employer login retry $i ..."; sleep 1;
done
if command -v jq >/dev/null 2>&1; then
  EMPLOYER_TOKEN=$(echo "$RAW" | jq -r .token)
else
  EMPLOYER_TOKEN=$(echo "$RAW" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
fi
[[ $EMPLOYER_TOKEN == null ]] && fail "Employer login failed"
pass "Employer authenticated"

log "Ensure employer has a company"
COMPANY_NAME="JamDung Test Co"
LOGO_URL="https://picsum.photos/seed/logo/300"

COMPANY_COUNT=$(curl -s -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/companies" | jq '.data|length')
if [ "$COMPANY_COUNT" -eq 0 ]; then
  COMPANY_NAME="$COMPANY_NAME $(date +%s)"
  curl -sf -X POST "$API_URL/companies" -H "Authorization: Bearer $EMPLOYER_TOKEN" -H 'Content-Type: application/json' -d "{\"name\":\"$COMPANY_NAME\",\"location\":\"Kingston\",\"industry\":\"IT\"}" | json
  pass "Company $COMPANY_NAME created"
else
  COMPANY_ID=$(curl -sf -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/companies" | jq -r '.data[0].id')
  pass "Company already exists"
fi

log "Upload company logo"
curl -sf -X PUT "$API_URL/companies/$COMPANY_ID" -H "Authorization: Bearer $EMPLOYER_TOKEN" -H 'Content-Type: application/json' -d "{\"logo_url\":\"$LOGO_URL\",\"description\":\"Updated via script\"}" | json
CHECK_LOGO=$(curl -sf -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/companies/$COMPANY_ID" | jq -r .data.logoUrl)
[[ "$CHECK_LOGO" == "$LOGO_URL" ]] && pass "Company logo set" || fail "Company logo not updated"

JOB_TITLE="Flow Test Job $(date +%s)"
log "Create job $JOB_TITLE"
JOB_ID=$(curl -sf -X POST "$API_URL/jobs" -H "Authorization: Bearer $EMPLOYER_TOKEN" -H 'Content-Type: application/json' -d "{\"title\":\"$JOB_TITLE\",\"description\":\"Integration test job\",\"location\":\"Remote\",\"type\":\"FULL_TIME\"}" | jq -r .id)
[[ -z $JOB_ID || $JOB_ID == null ]] && fail "Job creation failed"
pass "Job created with id $JOB_ID"

log "Login jobseeker $JOBSEEKER_EMAIL"
for i in {1..60}; do
  RAW_S=$(curl -s -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$JOBSEEKER_EMAIL\",\"password\":\"$JOBSEEKER_PASSWORD\"}")
  if echo "$RAW_S" | jq -e '.token' >/dev/null 2>&1; then break; fi
  echo "Jobseeker login retry $i ..."; sleep 1;
done
if command -v jq >/dev/null 2>&1; then
  JOBSEEKER_TOKEN=$(echo "$RAW_S" | jq -r .token)
else
  JOBSEEKER_TOKEN=$(echo "$RAW_S" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
fi
[[ $JOBSEEKER_TOKEN == null ]] && fail "Jobseeker login failed"
pass "Jobseeker authenticated"

RESUME_URL="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
PHOTO_URL="https://picsum.photos/seed/avatar/300"
log "Upload resume and photo to jobseeker profile"
curl -sf -X PUT "$API_URL/jobseeker/profile" -H "Authorization: Bearer $JOBSEEKER_TOKEN" -H 'Content-Type: application/json' -d "{\"resume_url\":\"$RESUME_URL\",\"photo_url\":\"$PHOTO_URL\",\"resume_file_name\":\"dummy.pdf\"}" | json
VERIFY_RESUME=$(curl -sf -H "Authorization: Bearer $JOBSEEKER_TOKEN" "$API_URL/jobseeker/profile" | jq -r .data.candidateProfile.resumeUrl)
[[ "$VERIFY_RESUME" == "$RESUME_URL" ]] && pass "Resume uploaded" || fail "Resume not set"

log "Search for the job title"
SEARCH_JSON=$(curl -sfG --data-urlencode "search=$JOB_TITLE" "$API_URL/jobs")
SEARCH_HIT=$(echo "$SEARCH_JSON" | jq -r '.data[0].id')

if [[ "$SEARCH_HIT" == "null" || -z "$SEARCH_HIT" ]]; then
  echo "$SEARCH_JSON" | jq > /dev/stderr
  fail "Job not found in search response"
fi
[[ $SEARCH_HIT != $JOB_ID ]] && fail "Job not found in search"
pass "Job visible to jobseeker"

log "Jobseeker applies"
APPLY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/jobs/$JOB_ID/apply" -H "Authorization: Bearer $JOBSEEKER_TOKEN" -H 'Content-Type: application/json' -d '{"coverLetter":"Automated test application"}')
[[ $APPLY_STATUS == 201 || $APPLY_STATUS == 200 ]] || fail "Application failed status $APPLY_STATUS"
pass "Application submitted"

log "Employer checks applications"
COUNT=$(curl -sf -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/employer/applications?limit=1" | jq -r '.total')
[[ $COUNT -gt 0 ]] && pass "Employer sees at least 1 application" || fail "No applications found"

log "Employer notifications"
NOTIF_COUNT=$(curl -sf -H "Authorization: Bearer $EMPLOYER_TOKEN" "$API_URL/notifications" | jq '.data|length')
[[ $NOTIF_COUNT -gt 0 ]] && pass "Notifications received ($NOTIF_COUNT)" || fail "No notifications"

echo -e "${green}Flow test completed successfully${reset}"
