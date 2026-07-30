import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { logger } from '@/lib/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

if (process.env.NODE_ENV !== 'production') {
  const prismaAny = prisma as unknown as {
    $on: (event: string, callback: (event: { query: string; duration: number; message?: string }) => void) => void
  }
  prismaAny.$on('query', (e) => {
    logger.debug('Prisma query', { query: e.query, duration: `${e.duration}ms` })
  })
  prismaAny.$on('error', (e) => {
    logger.error('Prisma error', { message: e.message })
  })
  prismaAny.$on('warn', (e) => {
    logger.warn('Prisma warning', { message: e.message })
  })
}
