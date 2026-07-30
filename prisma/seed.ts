import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'

async function main() {
  const email = 'admin@techsmysl.ru'
  const password = 'ge65penyxe2an4zf7c28m5t4rj'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    logger.info('Seed skipped: admin already exists', { email })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  })

  logger.info('Admin seeded', { email })
}

main()
  .catch((error) => {
    logger.error('Seed failed', { error })
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
