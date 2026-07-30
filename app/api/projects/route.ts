import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/require-auth'
import { projectSchema } from '@/lib/validation/schemas'
import { toSlug } from '@/lib/slug'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { ensureSlugUnique } from '@/lib/api/helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
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
    const validated = projectSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validated.data
    const slug = data.slug?.trim() || toSlug(data.title)

    const slugCheck = await ensureSlugUnique('project', slug)
    if (!slugCheck.unique) {
      return slugCheck.response
    }

    const created = await prisma.project.create({
      data: {
        ...data,
        slug,
      },
    })

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
