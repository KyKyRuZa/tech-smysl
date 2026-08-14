import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { blogPostSchema } from '@/lib/validation/schemas'
import { toSlug } from '@/lib/slug'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { blogPostSelect, ensureSlugUnique } from '@/lib/api/helpers'
import { validateBody } from '@/lib/auth/middleware'
import { upsertBlogPostTranslations } from '@/lib/api/translations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    if (all) {
      const auth = await requireAuth(req)
      if (auth instanceof NextResponse) return auth
    }
    const items = await prisma.blogPost.findMany({
      where: all ? {} : { published: true },
      orderBy: { publishedAt: 'desc' },
      select: blogPostSelect,
    })
    logger.info('BlogPosts fetched', { count: items.length, all })
    return NextResponse.json({ data: items })
  } catch (error) {
    logger.error('Failed to fetch blog posts', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req)
    if (payload instanceof NextResponse) return payload

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
    const validation = validateBody(blogPostSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const data = validation.data
    const { translations } = body as Record<string, unknown> & {
      translations?: {
        ru?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
        en?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
      }
    }
    const slug = data.slug?.trim() || (ru?.slug as string | undefined)?.trim() || toSlug(data.title || (ru?.title as string | undefined) || 'post')

    const slugCheck = await ensureSlugUnique('blogPost', slug)
    if (!slugCheck.unique) {
      return slugCheck.response
    }

    const { translations: _t, ...baseData } = merged as Record<string, unknown>

    const postData = {
      ...baseData,
      slug,
      title: (baseData.title as string | undefined) ?? (ru?.title as string | undefined),
      excerpt: (baseData.excerpt as string | undefined) ?? (ru?.excerpt as string | undefined),
      content: (baseData.content as string | undefined) ?? (ru?.content as string | undefined),
      tags: (baseData.tags as string[] | undefined) ?? (ru?.tags as string[] | undefined),
      authorId: payload.userId,
      publishedAt: data.published ? new Date() : null,
    }

    const created = await prisma.blogPost.create({
      data: postData as never,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertBlogPostTranslations(created.id, translations)
    }

    logger.info('BlogPost created', { blogPostId: created.id, slug })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to create blog post', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
