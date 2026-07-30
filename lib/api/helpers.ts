import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export function getSearchParams(req: NextRequest) {
  return new URL(req.url).searchParams
}

export const blogPostSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  imageUrl: true,
  published: true,
  publishedAt: true,
  tags: true,
  createdAt: true,
  author: { select: { email: true } },
} as const

export async function ensureSlugUnique(
  model: 'project' | 'blogPost',
  slug: string,
  excludeId?: string
): Promise<{ unique: true } | { unique: false; response: NextResponse }> {
  const where: Record<string, unknown> = { slug }
  if (excludeId) {
    where.NOT = { id: excludeId }
  }

  const existing = model === 'project'
    ? await prisma.project.findFirst({ where })
    : await prisma.blogPost.findFirst({ where })

  if (existing) {
    return {
      unique: false,
      response: NextResponse.json(
        { error: `${model === 'project' ? 'Project' : 'BlogPost'} with this slug already exists` },
        { status: 409 }
      ),
    }
  }

  return { unique: true }
}
