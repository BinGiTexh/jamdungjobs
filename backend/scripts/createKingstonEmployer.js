const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'employer@kingstontech.jm';
    const plainPassword = 'Password123!';

    // Ensure company exists
    const company = await prisma.company.findFirst({ where: { name: 'Kingston Tech' } });
    if (!company) {
      throw new Error('Company "Kingston Tech" not found. Run seed first.');
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`User ${email} already exists. Nothing to do.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'EMPLOYER',
        firstName: 'Kingston',
        lastName: 'Tech',
        companyId: company.id
      },
    });

    console.log('Created employer user for Kingston Tech');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
