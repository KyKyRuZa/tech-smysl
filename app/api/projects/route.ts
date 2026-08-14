import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { projectSchema } from '@/lib/validation/schemas'
import { toSlug } from '@/lib/slug'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { ensureSlugUnique } from '@/lib/api/helpers'
import { upsertProjectTranslations } from '@/lib/api/translations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    if (all) {
      const auth = await requireAuth(req)
      if (auth instanceof NextResponse) return auth
    }
    const items = await prisma.project.findMany({
      where: all ? {} : { published: true },
      orderBy: { order: 'asc' },
    })
    logger.info('Projects fetched', { count: items.length, all })
    return NextResponse.json({ data: items })
  } catch (error) {
    logger.error('Failed to fetch projects', { error })
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
      slug: (body as Record<string, unknown>).slug ?? (ru?.slug as string | undefined),
      title: (body as Record<string, unknown>).title ?? (ru?.title as string | undefined),
    }
    const validated = projectSchema.safeParse(merged)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validated.data
    const slug = data.slug?.trim() || (ru?.slug as string | undefined)?.trim() || toSlug(data.title || (ru?.title as string | undefined) || 'project')

    const slugCheck = await ensureSlugUnique('project', slug)
    if (!slugCheck.unique) {
      return slugCheck.response
    }

    const { translations, ...baseData } = merged as Record<string, unknown> & {
      translations?: {
        ru?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
        en?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
      }
    }

    const projectData = {
      ...baseData,
      slug,
      title: (baseData.title as string | undefined) ?? (ru?.title as string | undefined),
      subtitle: (baseData.subtitle as string | undefined) ?? (ru?.subtitle as string | undefined),
      description: (baseData.description as string | undefined) ?? (ru?.description as string | undefined),
      content: (baseData.content as string | undefined) ?? (ru?.content as string | undefined),
      useCases: (baseData.useCases as string | undefined) ?? (ru?.useCases as string | undefined),
      benefits: (baseData.benefits as string[] | undefined) ?? (ru?.benefits as string[] | undefined),
      tags: (baseData.tags as string[] | undefined) ?? (ru?.tags as string[] | undefined),
      publishedAt: data.published ? new Date() : null,
    }

    const created = await prisma.project.create({
      data: projectData as never,
    })

    if (translations && (translations.ru || translations.en)) {
      await upsertProjectTranslations(created.id, translations)
    }

    logger.info('Project created', { projectId: created.id, slug })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Failed to create project', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
