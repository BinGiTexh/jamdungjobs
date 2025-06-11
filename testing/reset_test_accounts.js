/**
 * JamDung Jobs - Test Account Reset Script
 * 
 * This script directly resets the test account passwords in the database
 * to resolve authentication issues with the test accounts.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Test account credentials
const TEST_ACCOUNTS = {
  jobSeeker: {
    email: 'testjobseeker@jamdungjobs.com',
    password: 'Test@123',
    role: 'JOBSEEKER'
  },
  employer: {
    email: 'testemployer@jamdungjobs.com',
    password: 'Test@123',
    role: 'EMPLOYER'
  }
};

// Function to reset a test account
async function resetTestAccount(email, password, role) {
  try {
    console.log(`Attempting to reset account: ${email}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`Creating new user: ${email}`);
      // Create the user if it doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: role === 'JOBSEEKER' ? 'Test' : 'Test',
          lastName: role === 'JOBSEEKER' ? 'JobSeeker' : 'Employer',
          role
        }
      });
      
      console.log(`✅ Successfully created user: ${email}`);
    } else {
      console.log(`Updating existing user: ${email}`);
      // Update the existing user's password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword
        }
      });
      
      console.log(`✅ Successfully updated password for: ${email}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to reset account ${email}:`, error);
    return false;
  }
}

// Main function to reset test accounts
async function resetTestAccounts() {
  console.log('🔄 Resetting test accounts for JamDung Jobs...');
  
  try {
    // Reset job seeker account
    await resetTestAccount(
      TEST_ACCOUNTS.jobSeeker.email,
      TEST_ACCOUNTS.jobSeeker.password,
      TEST_ACCOUNTS.jobSeeker.role
    );
    
    // Reset employer account
    await resetTestAccount(
      TEST_ACCOUNTS.employer.email,
      TEST_ACCOUNTS.employer.password,
      TEST_ACCOUNTS.employer.role
    );
    
    // Save test account credentials to a file
    const credentialsData = {
      jobSeeker: {
        email: TEST_ACCOUNTS.jobSeeker.email,
        password: TEST_ACCOUNTS.jobSeeker.password
      },
      employer: {
        email: TEST_ACCOUNTS.employer.email,
        password: TEST_ACCOUNTS.employer.password
      },
      apiUrl: 'http://localhost:5000/api'
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test_credentials.json'),
      JSON.stringify(credentialsData, null, 2)
    );
    
    console.log('✅ Test credentials saved to test_credentials.json');
    console.log('🎉 Test account reset complete!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the reset
resetTestAccounts().catch(error => {
  console.error('❌ Reset failed:', error);
  prisma.$disconnect();
});
