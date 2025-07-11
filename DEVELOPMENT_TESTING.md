# Development Testing Guide

## Test Account Credentials

For local development and testing purposes, the following test accounts are available:

### Job Seeker Accounts
- **Email**: jobseeker@test.com
- **Password**: password123
- **Role**: Job Seeker
- **Profile**: Experienced software developer

- **Email**: graduate@test.com  
- **Password**: password123
- **Role**: Job Seeker
- **Profile**: Recent graduate

### Employer Accounts
- **Email**: employer@test.com
- **Password**: password123
- **Role**: Employer
- **Company**: Test Tech Corp

### Usage Instructions

1. **Local Development Only**: These credentials are only valid in the local development environment
2. **Database Reset**: If you reset the database, run the user seeding script:
   ```bash
   docker-compose exec api node scripts/seed-test-users.js
   ```
3. **Password Updates**: If passwords don't work, update them:
   ```bash
   docker-compose exec api node -e "
   const { PrismaClient } = require('@prisma/client');
   const bcrypt = require('bcryptjs');
   const prisma = new PrismaClient();
   
   async function updatePasswords() {
     const password = await bcrypt.hash(process.env.TEST_PASSWORD || 'changeme123', 10);
     await prisma.user.updateMany({
       where: { email: { in: ['jobseeker@test.com', 'employer@test.com'] } },
       data: { passwordHash: password }
     });
     console.log('✅ Passwords updated');
     await prisma.\$disconnect();
   }
   updatePasswords();
   "
   ```

### Security Notes

- **Never commit credentials** to version control
- **These accounts are for testing only** and should not exist in production
- **Always use environment variables** for any configuration that varies between environments
- **Test credentials should be documented separately** from the application code

### Testing Scenarios

1. **Job Seeker Flow**: Use jobseeker@test.com to test job search, applications, and profile management
2. **Employer Flow**: Use employer@test.com to test job posting, candidate management, and billing
3. **Authentication Testing**: Test both valid and invalid login scenarios
4. **Role-based Access**: Verify that each role can only access appropriate features

### HEART Partnership Testing

For testing the HEART Trust partnership features:
- Use employer@test.com to test job posting with HEART certification requirements
- Use jobseeker@test.com to test job applications with HEART qualifications
- Test the analytics and tracking features that support the revenue sharing model