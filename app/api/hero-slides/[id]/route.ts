import { prisma } from '@/lib/prisma'
import { heroSlideUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { upsertHeroSlideTranslations } from '@/lib/api/translations'
import { validateBody } from '@/lib/auth/middleware'
import { requireAuth } from '@/lib/auth/require-auth'
import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'

export const GET = createGetHandler(
  (id) => prisma.heroSlide.findUnique({ where: { id } }),
  'HeroSlide not found'
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
      title: (body as Record<string, unknown>).title ?? (ru?.title as string | undefined),
      subtitle: (body as Record<string, unknown>).subtitle ?? (ru?.subtitle as string | undefined),
      ctaText: (body as Record<string, unknown>).ctaText ?? (ru?.ctaText as string | undefined),
      imageAlt: (body as Record<string, unknown>).imageAlt ?? (ru?.imageAlt as string | undefined),
    }
    const validation = validateBody(heroSlideUpdateSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const existing = await prisma.heroSlide.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'HeroSlide not found' }, { status: 404 })
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
        en?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
      }
    }

    const updated = await prisma.heroSlide.update({
      where: { id },
      data: baseData as Prisma.HeroSlideUpdateInput,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertHeroSlideTranslations(id, translations)
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const DELETE = createDeleteHandler({
  find: (id) => prisma.heroSlide.findUnique({ where: { id } }),
  delete: (id) => prisma.heroSlide.delete({ where: { id } }),
  notFoundMessage: 'HeroSlide not found',
  logKey: 'HeroSlide',
})
