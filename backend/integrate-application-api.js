/**
 * Integration script for Application Management API
 * 
 * This script shows how to integrate the application management API into the main server.js file
 */

// Add this near the top of your server.js file where other requires are
const applicationManagementRoutes = require('./application-management-api');

// Add this where you set up your routes
app.use('/api', applicationManagementRoutes);

/**
 * Example curl commands for testing:
 * 
 * 1. List all applications for an employer:
 * curl -X GET "http://localhost:5000/api/employer/applications" -H "Authorization: Bearer YOUR_EMPLOYER_JWT_TOKEN"
 * 
 * 2. Get application details:
 * curl -X GET "http://localhost:5000/api/employer/applications/APPLICATION_ID" -H "Authorization: Bearer YOUR_EMPLOYER_JWT_TOKEN"
 * 
 * 3. Update application status:
 * curl -X PATCH "http://localhost:5000/api/employer/applications/APPLICATION_ID/status" \
 *   -H "Authorization: Bearer YOUR_EMPLOYER_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"status": "SHORTLISTED"}'
 * 
 * 4. List all applications for a job seeker:
 * curl -X GET "http://localhost:5000/api/jobseeker/applications" -H "Authorization: Bearer YOUR_JOBSEEKER_JWT_TOKEN"
 */
