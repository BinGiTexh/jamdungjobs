# Console.log Cleanup Guide

## Overview
This guide provides a step-by-step process for updating the remaining files with proper logging utilities.

## Files Requiring Updates
The following files still contain console.log statements that need to be replaced:

1. Components with debug/info logging:
   - CompanyAutocomplete.js
   - SalaryDisplay.js
   - JamaicaLocationAutocomplete.js
   - App.js

2. Components with error logging:
   - JobApplicationForm.js
   - ProfilePage.js
   - ResumeBuilderPage.js
   - JobSearch.js
   - JobApplyPage.js
   - FindJobsModal.js
   - CreateJobListing.js
   - CandidateDashboard.js

## Step-by-Step Process

### 1. First, update error logging in critical components
Start with files that handle important operations like form submissions, API requests, and data processing:

- JobApplicationForm.js
- ProfilePage.js
- ResumeBuilderPage.js
- JobSearch.js

For each file:
1. Import logging utilities at the top:
   ```javascript
   import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
   ```

2. Replace console.error calls with logError:
   ```javascript
   // Before
   console.error('Error message:', error);
   
   // After
   logError('Error message', error, {
     module: 'ComponentName',
     function: 'functionName',
     // additional context
   });
   ```

3. Replace console.log/debug/warn with logDev:
   ```javascript
   // Before
   console.log('Debug message');
   
   // After
   logDev('debug', 'Debug message', contextObject);
   ```

4. Use sanitizeForLogging for sensitive data:
   ```javascript
   logDev('debug', 'User data:', sanitizeForLogging(userData));
   ```

### 2. Next, update UI components with simpler logging needs
These components typically have fewer logging statements:

- CompanyAutocomplete.js
- SalaryDisplay.js
- JamaicaLocationAutocomplete.js
- App.js

Follow the same process as above but focus on:
- Development-only debugging with logDev
- Removing unnecessary console.logs
- Adding minimal context where needed

### 3. Finally, check for any remaining logging in utility functions
Look for any console.log statements in utility functions and helpers.

## Best Practices for Logging
- Keep logs informative but concise
- Include relevant context with each log
- Use appropriate log levels (debug, info, warn, error)
- Always sanitize sensitive data
- Make logs actionable for troubleshooting
- Consider log readability in production environments

## Testing
After updating each file:
1. Verify the application works as expected
2. Check that error scenarios are properly logged
3. Ensure development logs appear in non-production environments
4. Confirm sensitive data is not exposed in logs

## Final Verification
Once all files are updated, run a final grep to confirm no console.* calls remain:

```bash
grep -r "console\." --include="*.js" web-frontend/src
```

