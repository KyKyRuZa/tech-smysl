import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { heroSlideSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    const items = await prisma.heroSlide.findMany({
      where: all ? {} : { published: true },
      orderBy: { order: 'asc' },
    })
    logger.info('HeroSlides fetched', { count: items.length, all })
    return NextResponse.json({ data: items })
  } catch (error) {
    logger.error('Failed to fetch hero slides', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req)
    if (payload instanceof NextResponse) return payload

    const body = await req.json()
    const validated = heroSlideSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const created = await prisma.heroSlide.create({
      data: validated.data,
    })

    logger.info('HeroSlide created', { heroSlideId: created.id })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create hero slide', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
