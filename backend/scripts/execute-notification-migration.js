const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

async function executeMigration() {
  const prisma = new PrismaClient();
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'notification-migration-simplified.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');
    
    // Execute the SQL in a transaction
    await prisma.$transaction([
      prisma.$executeRawUnsafe(sql)
    ]);

    // Verify tables were created
    const tables = [
      'notifications',
      'message_threads',
      'messages',
      'thread_participants',
      'profile_views',
      'job_recommendations',
      'scheduled_reminders'
    ];

    for (const table of tables) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        );
      `;
      console.log(`Table ${table} exists: ${result[0].exists}`);
    }

    // Verify enums were created
    const enums = [
      'NotificationType',
      'NotificationStatus'
    ];

    for (const enumName of enums) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_type 
          WHERE typname = ${enumName.toLowerCase()}
        );
      `;
      console.log(`Enum ${enumName} exists: ${result[0].exists}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

executeMigration().catch(console.error);

