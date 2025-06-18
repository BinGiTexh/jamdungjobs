# JamDung Jobs – QA Tester Pack

Welcome, testers! This guide walks you through the key user journeys to validate in the **JamDung Jobs** MVP, plus a survey you should complete once finished. Your feedback will be converted into GitHub issues for the dev team.

---
## 1. Getting Started

### 1.1 Spin-up / Access
Choose one:
1. **Staging URL** – `https://staging.jamdungjobs.com`  *(if provided)*
2. **Local Docker** – in the project root:
   ```bash
   docker compose up -d
   ```
   Visit `http://localhost:3000` for the front-end and `http://localhost:4000/health` for the API health check.

> The first load may take a minute while containers build.

### 1.2 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Job Seeker | seeker@test.com | Password123! |
| Employer   | employer@test.com | Password123! |

Feel free to register your own accounts as well.

---
## 2. Core Flows to Test

### 2.1 Job Seeker
1. **Register / Log in**
2. **Complete Profile** – add bio, address, skills, and upload a resume.
3. **Search Jobs**
   - Use keyword
   - Filter by location (Google Places autocomplete)
   - Select skills to view matching-score sort
4. **Apply**
   - Standard application (fill cover letter, choose resume)
   - **Quick Apply** button
5. **Track Applications**
   - Open *Applications List*, confirm status updates when employer changes them.
6. **Mobile Check** – repeat a few steps on a phone-sized viewport.

### 2.2 Employer
1. **Register / Log in** (or use account above)
2. **Complete Company Profile** – name, website, parish, description.
3. **Post a Job**
   - Use the *Job Description Builder* with templates.
4. **Edit & Manage Job** – update salary, requirements, close posting.
5. **Review Applications**
   - Open *Applications Review* dashboard.
   - Change status (Applied → Reviewing → Interview etc.)
   - Download applicant resumes.
6. **Analytics Placeholder** – note that detailed analytics charts are **not yet implemented**.

---
## 3. What to Verify
- Correct navigation and page loads
- Form validation & helpful error messages
- Resume uploads/downloads work
- Skill-match score appears and sorts results
- Status changes persist after refresh
- Basic responsiveness (desktop ≥1024 px, tablet ~768 px, mobile ≤425 px)

---
## 4. Survey – Please Complete
Copy the markdown block below, fill it out, and submit it **as a new GitHub issue** using the `QA Feedback` label, or via the Google Form if provided.

<details><summary>Markdown Template</summary>

```markdown
### Tester Info
*Name*:
*Email*:
*Role Tested*: [  ] Job Seeker [  ] Employer [  ] Both
*Device / Browser*:

### Flow Checklist
| Flow | Worked? | Notes |
|------|---------|-------|
| Registration & Login | ✅ / ⚠️ / ❌ | |
| Profile Completion | ✅ / ⚠️ / ❌ | |
| Job Search & Filters | ✅ / ⚠️ / ❌ | |
| Skill-Match Scoring | ✅ / ⚠️ / ❌ | |
| Job Application (standard) | ✅ / ⚠️ / ❌ | |
| Quick Apply | ✅ / ⚠️ / ❌ | |
| Application Tracking | ✅ / ⚠️ / ❌ | |
| Job Posting (employer) | ✅ / ⚠️ / ❌ | |
| Application Review (employer) | ✅ / ⚠️ / ❌ | |
| Mobile Responsiveness | ✅ / ⚠️ / ❌ | |

### Ratings (1 = Poor, 5 = Excellent)
| Area | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| Overall UX | | | | | |
| Performance | | | | | |
| Visual Design | | | | | |
| Ease of Use | | | | | |

### Bugs / Issues
1.
2.
3.

### Suggestions / Enhancements
*
```
</details>

---
## 5. After Submission – Automated Processing
A GitHub Actions bot watches for issues with the `QA Feedback` label and will:
1. Parse your checklist & ratings.
2. Create individual GitHub issues for each problem found.
3. Assign labels (`bug`, `enhancement`, `priority:high`, etc.)
4. Notify the dev team (including Cascade) to start fixes.

*No extra action is needed once you file the survey issue.*

---
Thank you for helping improve **JamDung Jobs**—together we make job hunting in Jamaica better for everyone!
