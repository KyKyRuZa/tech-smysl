import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { reviewSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { validateBody } from '@/lib/auth/middleware'
import { upsertReviewTranslations } from '@/lib/api/translations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    if (all) {
      const auth = await requireAuth(req)
      if (auth instanceof NextResponse) return auth
    }
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
    const ru = (body as Record<string, unknown> & { translations?: { ru?: Record<string, unknown> } }).translations?.ru
    const merged = {
      ...body,
      headline: (body as Record<string, unknown>).headline ?? ru?.headline,
      body: (body as Record<string, unknown>).body ?? ru?.body,
      author: (body as Record<string, unknown>).author ?? ru?.author,
      role: (body as Record<string, unknown>).role ?? ru?.role,
    }
    const validation = validateBody(reviewSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { headline: string; body: string; author?: string; role?: string }
        en?: { headline: string; body: string; author?: string; role?: string }
      }
    }

    const created = await prisma.review.create({
      data: baseData as never,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertReviewTranslations(created.id, translations)
    }

    logger.info('Review created', { reviewId: created.id })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create review', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
