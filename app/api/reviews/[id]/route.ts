import { prisma } from '@/lib/prisma'
import { reviewUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { upsertReviewTranslations } from '@/lib/api/translations'
import { validateBody } from '@/lib/auth/middleware'
import { requireAuth } from '@/lib/auth/require-auth'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const GET = createGetHandler(
  (id) => prisma.review.findUnique({ where: { id } }),
  'Review not found'
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
      headline: (body as Record<string, unknown>).headline ?? ru?.headline,
      body: (body as Record<string, unknown>).body ?? ru?.body,
      author: (body as Record<string, unknown>).author ?? ru?.author,
      role: (body as Record<string, unknown>).role ?? ru?.role,
    }
    const validation = validateBody(reviewUpdateSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const existing = await prisma.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { headline: string; body: string; author?: string; role?: string }
        en?: { headline: string; body: string; author?: string; role?: string }
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: baseData as never,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertReviewTranslations(id, translations)
    }

    revalidatePath('/admin/reviews')
    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const DELETE = createDeleteHandler({
  find: (id) => prisma.review.findUnique({ where: { id } }),
  delete: (id) => prisma.review.delete({ where: { id } }),
  notFoundMessage: 'Review not found',
  logKey: 'Review',
})
