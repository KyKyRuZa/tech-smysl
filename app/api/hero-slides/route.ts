import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { heroSlideSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { validateBody } from '@/lib/auth/middleware'
import { upsertHeroSlideTranslations } from '@/lib/api/translations'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    if (all) {
      const auth = await requireAuth(req)
      if (auth instanceof NextResponse) return auth
    }
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
    const ru = (body as Record<string, unknown> & { translations?: { ru?: Record<string, unknown> } }).translations?.ru
    const merged = {
      ...body,
      title: (body as Record<string, unknown>).title ?? ru?.title,
      subtitle: (body as Record<string, unknown>).subtitle ?? ru?.subtitle,
      ctaText: (body as Record<string, unknown>).ctaText ?? ru?.ctaText,
      imageAlt: (body as Record<string, unknown>).imageAlt ?? ru?.imageAlt,
    }
    const validation = validateBody(heroSlideSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
        en?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
      }
    }

    const created = await prisma.heroSlide.create({
      data: baseData as Prisma.HeroSlideCreateInput,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertHeroSlideTranslations(created.id, translations)
    }

    logger.info('HeroSlide created', { heroSlideId: created.id })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create hero slide', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
