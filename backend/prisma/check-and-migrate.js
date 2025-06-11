const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function checkAndMigrateTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database connection...');
    await prisma.$connect();
    
    console.log('Running database migrations...');
    execSync('npx prisma migrate dev --name init_schema', { stdio: 'inherit' });
    
    console.log('Verifying table existence...');
    // Test queries to verify tables exist
    await prisma.notification.findFirst();
    await prisma.scheduledReminder.findFirst();
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndMigrateTables();

