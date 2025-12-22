
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
    return new PrismaClient({
        // @ts-ignore - Required for Prisma 7 with Accelerate URLs
        accelerateUrl: process.env.DATABASE_URL
    })
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
