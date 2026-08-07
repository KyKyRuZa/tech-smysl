import { prisma } from '@/lib/prisma'
import { heroSlideUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api/crud'

export const GET = createGetHandler(
  (id) => prisma.heroSlide.findUnique({ where: { id } }),
  'HeroSlide not found'
)

export const PUT = createPutHandler({
  find: (id) => prisma.heroSlide.findUnique({ where: { id } }),
  update: (id, data) => prisma.heroSlide.update({ where: { id }, data }),
  validate: heroSlideUpdateSchema.safeParse,
  notFoundMessage: 'HeroSlide not found',
  logKey: 'HeroSlide',
})

export const DELETE = createDeleteHandler({
  find: (id) => prisma.heroSlide.findUnique({ where: { id } }),
  delete: (id) => prisma.heroSlide.delete({ where: { id } }),
  notFoundMessage: 'HeroSlide not found',
  logKey: 'HeroSlide',
})
