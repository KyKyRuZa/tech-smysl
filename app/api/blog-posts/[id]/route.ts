import { prisma } from '@/lib/prisma'
import { blogPostSchema } from '@/lib/validation/schemas'
import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api/crud'

export const GET = createGetHandler(
  (id) =>
    prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        published: true,
        publishedAt: true,
        tags: true,
        createdAt: true,
        author: { select: { email: true } },
      },
    }),
  'BlogPost not found'
)

export const PUT = createPutHandler({
  find: (id) => prisma.blogPost.findUnique({ where: { id } }),
  update: (id, data) => prisma.blogPost.update({ where: { id }, data }),
  validate: blogPostSchema.safeParse,
  notFoundMessage: 'BlogPost not found',
  logKey: 'BlogPost',
})

export const DELETE = createDeleteHandler({
  find: (id) => prisma.blogPost.findUnique({ where: { id } }),
  delete: (id) => prisma.blogPost.delete({ where: { id } }),
  notFoundMessage: 'BlogPost not found',
  logKey: 'BlogPost',
})
