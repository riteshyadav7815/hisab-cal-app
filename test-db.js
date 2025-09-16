const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the database connection
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Database connection successful');
    console.log('Found users:', users.length);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();