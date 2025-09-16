import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserNumber() {
  try {
    // Check if the userNumber column exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT "userNumber" FROM users LIMIT 1`;
      console.log('userNumber column already exists');
    } catch (error) {
      console.log('Adding userNumber column...');
      
      // Add the column using raw SQL
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "userNumber" INTEGER UNIQUE;
      `;
      
      console.log('userNumber column added');
    }
    
    // Create sequence and set default
    await prisma.$executeRaw`
      CREATE SEQUENCE IF NOT EXISTS user_number_seq START 1;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE users ALTER COLUMN "userNumber" SET DEFAULT nextval('user_number_seq');
    `;
    
    // Update existing users with user numbers
    const usersWithoutNumber: any[] = await prisma.$queryRaw`
      SELECT id FROM users WHERE "userNumber" IS NULL ORDER BY "createdAt" ASC;
    `;
    
    console.log(`Found ${usersWithoutNumber.length} users without userNumber`);
    
    // Assign numbers to existing users
    let counter = 1;
    for (const user of usersWithoutNumber) {
      await prisma.$executeRaw`
        UPDATE users SET "userNumber" = ${counter} WHERE id = ${user.id};
      `;
      counter++;
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserNumber();