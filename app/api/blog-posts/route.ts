import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { blogPostSchema } from '@/lib/validation/schemas'
import { toSlug } from '@/lib/slug'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { blogPostSelect, ensureSlugUnique } from '@/lib/api/helpers'
import { validateBody } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
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
    const validation = validateBody(blogPostSchema, body)
    if (!validation.success) {
      return validation.response
    }

    const data = validation.data
    const slug = data.slug?.trim() || toSlug(data.title)

    const slugCheck = await ensureSlugUnique('blogPost', slug)
    if (!slugCheck.unique) {
      return slugCheck.response
    }

    const created = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        authorId: payload.userId,
        publishedAt: data.published ? new Date() : null,
      },
    })

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
