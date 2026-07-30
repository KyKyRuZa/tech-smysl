import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { reviewSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { validateBody } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    const items = await prisma.review.findMany({
      where: all ? {} : { published: true },
      orderBy: { order: 'asc' },
    })
    logger.info('Reviews fetched', { count: items.length, all })
    return NextResponse.json({ data: items })
  } catch (error) {
    logger.error('Failed to fetch reviews', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req)
    if (payload instanceof NextResponse) return payload

    const body = await req.json()
    const validation = validateBody(reviewSchema, body)
    if (!validation.success) {
      return validation.response
    }

    const created = await prisma.review.create({
      data: validation.data,
    })

    logger.info('Review created', { reviewId: created.id })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create review', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
