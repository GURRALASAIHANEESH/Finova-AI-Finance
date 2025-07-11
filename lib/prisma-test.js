import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Test connection successful');
  } catch (error) {
    console.error('Test connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();