import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Log the URLs for debugging
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);

// Initialize Prisma Client with DIRECT_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL, // Use DIRECT_URL instead of DATABASE_URL
    },
  },
});

class PrismaClientSingleton {
  constructor() {
    this.instance = prisma;
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.instance.$queryRaw`SELECT 1`;
      } catch (error) {
        console.error('Connection health check failed:', error);
        await this.resetConnection();
      }
    }, 30000); // Check every 30 seconds
  }

  async resetConnection() {
    try {
      await this.instance.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.instance.$connect();
    } catch (error) {
      console.error('Connection reset failed:', error);
    }
  }

  getInstance() {
    return this.instance;
  }
}

const prismaSingleton = new PrismaClientSingleton();
export default prismaSingleton.getInstance();