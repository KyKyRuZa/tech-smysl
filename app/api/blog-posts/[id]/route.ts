import { prisma } from '@/lib/prisma'
import { blogPostUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { ensureSlugUnique } from '@/lib/api/helpers'
import { upsertBlogPostTranslations } from '@/lib/api/translations'
import { validateBody } from '@/lib/auth/middleware'
import { requireAuth } from '@/lib/auth/require-auth'
import { NextRequest, NextResponse } from 'next/server'

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json()
    const ru = (body as Record<string, unknown> & { translations?: { ru?: Record<string, unknown> } }).translations?.ru
    const merged = {
      ...body,
      slug: (body as Record<string, unknown>).slug ?? (ru?.slug as string | undefined),
      title: (body as Record<string, unknown>).title ?? (ru?.title as string | undefined),
      excerpt: (body as Record<string, unknown>).excerpt ?? (ru?.excerpt as string | undefined),
      content: (body as Record<string, unknown>).content ?? (ru?.content as string | undefined),
      tags: (body as Record<string, unknown>).tags ?? (ru?.tags as string[] | undefined),
    }
    const validation = validateBody(blogPostUpdateSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'BlogPost not found' }, { status: 404 })
    }

    const data = validation.data
    const slug = data.slug?.trim()
    if (slug) {
      const slugCheck = await ensureSlugUnique('blogPost', slug, id)
      if (!slugCheck.unique) {
        return slugCheck.response
      }
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
        en?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
      }
    }

    const updateData = {
      ...baseData,
      publishedAt: (baseData as { published?: boolean }).published ? new Date() : null,
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData as never,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertBlogPostTranslations(id, translations)
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const DELETE = createDeleteHandler({
  find: (id) => prisma.blogPost.findUnique({ where: { id } }),
  delete: (id) => prisma.blogPost.delete({ where: { id } }),
  notFoundMessage: 'BlogPost not found',
  logKey: 'BlogPost',
})
