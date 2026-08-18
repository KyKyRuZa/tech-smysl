import { prisma } from '@/lib/prisma'
import { projectUpdateSchema } from '@/lib/validation/schemas'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud'
import { ensureSlugUnique } from '@/lib/api/helpers'
import { upsertProjectTranslations } from '@/lib/api/translations'
import { validateBody } from '@/lib/auth/middleware'
import { requireAuth } from '@/lib/auth/require-auth'
import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'

export const GET = createGetHandler(
  (id) => prisma.project.findUnique({ where: { id } }),
  'Project not found'
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
      slug: (body as Record<string, unknown>).slug ?? (ru?.slug as string | undefined),
      title: (body as Record<string, unknown>).title ?? (ru?.title as string | undefined),
      subtitle: (body as Record<string, unknown>).subtitle ?? (ru?.subtitle as string | undefined),
      description: (body as Record<string, unknown>).description ?? (ru?.description as string | undefined),
      content: (body as Record<string, unknown>).content ?? (ru?.content as string | undefined),
      useCases: (body as Record<string, unknown>).useCases ?? (ru?.useCases as string | undefined),
      benefits: (body as Record<string, unknown>).benefits ?? (ru?.benefits as string[] | undefined),
      tags: (body as Record<string, unknown>).tags ?? (ru?.tags as string[] | undefined),
    }
    const validation = validateBody(projectUpdateSchema, merged)
    if (!validation.success) {
      return validation.response
    }

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const data = validation.data
    const slug = data.slug?.trim()
    if (slug) {
      const slugCheck = await ensureSlugUnique('project', slug, id)
      if (!slugCheck.unique) {
        return slugCheck.response
      }
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
        en?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
      }
    }

    const updateData = {
      ...baseData,
      publishedAt: (baseData as { published?: boolean }).published ? new Date() : null,
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData as Prisma.ProjectUpdateInput,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertProjectTranslations(id, translations)
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const DELETE = createDeleteHandler({
  find: (id) => prisma.project.findUnique({ where: { id } }),
  delete: (id) => prisma.project.delete({ where: { id } }),
  notFoundMessage: 'Project not found',
  logKey: 'Project',
})
