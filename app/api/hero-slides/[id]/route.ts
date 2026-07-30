import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { heroSlideSchema } from '@/lib/validation/schemas'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.heroSlide.findUnique({
      where: { id },
    })

    if (!item) {
      throw new NotFoundError('HeroSlide not found')
    }

    return NextResponse.json({ data: item })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to fetch hero slide', { error })
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
    const validated = heroSlideSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const existing = await prisma.heroSlide.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('HeroSlide not found')
    }

    const updated = await prisma.heroSlide.update({
      where: { id },
      data: validated.data,
    })

    logger.info('HeroSlide updated', { heroSlideId: updated.id })
    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to update hero slide', { error })
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
    const existing = await prisma.heroSlide.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('HeroSlide not found')
    }

    await prisma.heroSlide.delete({
      where: { id },
    })

    logger.info('HeroSlide deleted', { heroSlideId: id })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to delete hero slide', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
