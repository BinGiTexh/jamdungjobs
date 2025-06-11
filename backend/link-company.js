const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create company and link it to the employer
  const company = await prisma.company.create({
    data: {
      name: "Test Company",
      description: "A test company for development",
      location: "Kingston, Jamaica",
      employees: {
        connect: {
          id: "49a16ed4-7564-4159-a277-c2c809eb5e74"
        }
      }
    }
  });
  console.log('Company created:', company);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

