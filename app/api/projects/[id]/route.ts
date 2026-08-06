import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validation/schemas'
import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api/crud'
import { ensureSlugUnique } from '@/lib/api/helpers'

export const GET = createGetHandler(
  (id) => prisma.project.findUnique({ where: { id } }),
  'Project not found'
)

export const PUT = createPutHandler({
  find: (id) => prisma.project.findUnique({ where: { id } }),
  update: (id, data) =>
    prisma.project.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null,
      },
    }),
  validate: projectSchema.safeParse,
  notFoundMessage: 'Project not found',
  logKey: 'Project',
  slugCheck: async (slug, id) => {
    const result = await ensureSlugUnique('project', slug, id)
    return result.unique ? null : result.response
  },
})

export const DELETE = createDeleteHandler({
  find: (id) => prisma.project.findUnique({ where: { id } }),
  delete: (id) => prisma.project.delete({ where: { id } }),
  notFoundMessage: 'Project not found',
  logKey: 'Project',
})
