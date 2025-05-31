# Final Console.log Cleanup Guide

## Remaining Files to Update

The following files still contain console.log statements that need to be updated:

1. `FindJobsModal.js` (lines 42, 137, 167)
2. `JobApplyPage.js` (line 41)
3. `CandidateDashboard.js` (lines 332, 344, 390, 458, 477, 509, 527, 602, 704, 710)
4. `CreateJobListing.js` (line 289)

## Update Process for Each File

### 1. FindJobsModal.js

1. Add the import:
   ```javascript
   import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
   ```

2. Replace console.log on line 42 with:
   ```javascript
   logDev('debug', 'Jobs modal initialized', {
     defaultFilters: sanitizeForLogging(filters),
     isAuthenticated: !!currentUser
   });
   ```

3. Replace console.log on line 137 with:
   ```javascript
   logDev('debug', 'Search query submitted', {
     query: filters.query,
     location: filters.location ? `${filters.location.name}, ${filters.location.parish || ''}` : null
   });
   ```

4. Replace console.log on line 167 with:
   ```javascript
   logError('Error fetching jobs', error, {
     module: 'FindJobsModal',
     function: 'handleSearch',
     filters: sanitizeForLogging(filters)
   });
   ```

5. Add development logging for search interactions:
   ```javascript
   // Add in handleFilterChange function
   logDev('debug', 'Search filter changed', {
     field,
     value: typeof value === 'object' ? sanitizeForLogging(value) : value
   });
   ```

### 2. JobApplyPage.js

1. Add the import:
   ```javascript
   import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';
   ```

2. Replace console.log on line 41 with:
   ```javascript
   logDev('debug', 'Job application page loaded', {
     jobId,
     userId: user?.id,
     referrer: location.state?.from || 'direct'
   });
   ```

3. Add error logging for job fetch:
   ```javascript
   // In the catch block
   logError('Error fetching job details', error, {
     module: 'JobApplyPage',
     function: 'fetchJobDetails',
     jobId,
     status: error.response?.status
   });
   ```

4. Add logging for application submission:
   ```javascript
   // When application is submitted successfully
   logDev('info', 'Job application submitted', {
     jobId,
     userId: user?.id,
     applicationId: data.id
   });
   ```

### 3. CandidateDashboard.js

1. Add the import:
   ```javascript
   import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
   ```

2. Replace console.logs with development logging:
   ```javascript
   // For location selection (line 332)
   logDev('debug', 'Selected Jamaica location', sanitizeForLogging({
     name: location.name,
     parish: location.parish,
     placeId: location.placeId
   }));

   // For token debugging (lines 344, 390, etc.)
   logDev('debug', 'Auth token status', {
     exists: !!token,
     length: token ? token.length : 0,
     // Don't log actual token content
   });

   // For resume operations (lines 458-477)
   logDev('debug', 'Resume operation', {
     operation: 'view',
     fileName: profile.resumeFileName,
     hasUrl: !!profile.resumeUrl
   });
   ```

3. Replace error logging with proper context:
   ```javascript
   // Replace console.error calls
   logError('Error in operation', error, {
     module: 'CandidateDashboard',
     function: 'functionName',
     userId: user?.id,
     operationType: 'specific operation',
     status: error.response?.status
   });
   ```

4. Add logging for dashboard interactions:
   ```javascript
   // Tab changes
   logDev('debug', 'Dashboard tab changed', {
     previousTab: tabValue,
     newTab: newValue,
     userId: user?.id
   });

   // Profile updates
   logDev('info', 'Profile updated', {
     userId: user?.id,
     updatedFields: Object.keys(editedProfile)
   });
   ```

### 4. CreateJobListing.js

1. Add the import:
   ```javascript
   import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
   ```

2. Replace console.log on line 289 with:
   ```javascript
   logDev('debug', 'Job listing form submitted', sanitizeForLogging({
     title: formData.title,
     company: formData.company,
     jobType: formData.jobType,
     hasSkills: formData.skills?.length > 0
   }));
   ```

3. Add error logging for job creation:
   ```javascript
   logError('Error creating job listing', error, {
     module: 'CreateJobListing',
     function: 'handleSubmit',
     userId: user?.id,
     companyId: formData.companyId,
     status: error.response?.status
   });
   ```

4. Add logging for form state changes:
   ```javascript
   // In handleChange or similar function
   logDev('debug', 'Job form field changed', {
     field,
     fieldType: typeof value,
     isArray: Array.isArray(value),
     arrayLength: Array.isArray(value) ? value.length : null
   });
   ```

## Final Verification

After updating these remaining files, run a final grep command to ensure no console.log statements remain:

```bash
grep -r "console\." --include="*.js" web-frontend/src
```

For any remaining instances, apply the same patterns as above based on whether they are:
1. Debug logs (use logDev)
2. Error logs (use logError)
3. Warnings (use logDev with 'warn' level)

This completes the console.log cleanup process!

