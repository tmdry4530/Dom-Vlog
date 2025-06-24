import { PrismaClient } from '@/lib/generated/prisma';

// Prisma 클라이언트 싱글톤 패턴 구현
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Prisma 연결 확인 함수
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

// Prisma 연결 해제 함수
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}
