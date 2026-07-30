import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { blogPostSchema } from '@/lib/validation/schemas'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.blogPost.findUnique({
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
    })

    if (!item) {
      throw new NotFoundError('BlogPost not found')
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to fetch blog post', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(req)
    if (payload instanceof NextResponse) return payload

    const { id } = await params
    const body = await req.json()
    const validated = blogPostSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('BlogPost not found')
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: validated.data,
    })

    logger.info('BlogPost updated', { blogPostId: updated.id })
    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to update blog post', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(req)
    if (payload instanceof NextResponse) return payload

    const { id } = await params
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('BlogPost not found')
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    logger.info('BlogPost deleted', { blogPostId: id })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to delete blog post', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
