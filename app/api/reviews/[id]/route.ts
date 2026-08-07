import { prisma } from '@/lib/prisma'
import { reviewUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api/crud'

export const GET = createGetHandler(
  (id) => prisma.review.findUnique({ where: { id } }),
  'Review not found'
)

export const PUT = createPutHandler({
  find: (id) => prisma.review.findUnique({ where: { id } }),
  update: (id, data) => prisma.review.update({ where: { id }, data }),
  validate: reviewUpdateSchema.safeParse,
  notFoundMessage: 'Review not found',
  logKey: 'Review',
})

export const DELETE = createDeleteHandler({
  find: (id) => prisma.review.findUnique({ where: { id } }),
  delete: (id) => prisma.review.delete({ where: { id } }),
  notFoundMessage: 'Review not found',
  logKey: 'Review',
})
