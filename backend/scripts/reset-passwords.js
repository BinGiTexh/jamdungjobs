const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    // Reset employer password
    await prisma.user.update({
      where: { email: 'employer@test.com' },
      data: { passwordHash: await bcrypt.hash('password123', 10) }
    });

    // Reset jobseeker password
    await prisma.user.update({
      where: { email: 'jobseeker@test.com' },
      data: { passwordHash: await bcrypt.hash('password123', 10) }
    });

    console.log('Passwords reset successfully');
    console.log('\nUse these credentials to log in:');
    console.log('\nEmployer:');
    console.log('Email: employer@test.com');
    console.log('Password: password123');
    console.log('\nJobseeker:');
    console.log('Email: jobseeker@test.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
