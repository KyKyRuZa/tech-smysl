import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { cached } from '@/lib/cache'

const isDev = process.env.NODE_ENV !== 'production'

export const getPublicHeroSlides = cache(async () =>
  cached('public:hero-slides:all', () =>
    prisma.heroSlide.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      select: { imageUrl: true, imageAlt: true, subtitle: true },
    }),
    isDev ? 60_000 : 20 * 60_000
  )
)

export const getPublicProjects = cache(async () =>
  cached('public:projects:all', () =>
    prisma.project.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
    isDev ? 60_000 : 20 * 60_000
  )
)

export const getPublicReviews = cache(async () =>
  cached('public:reviews:all', () =>
    prisma.review.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
    isDev ? 60_000 : 20 * 60_000
  )
)

export const getPublicBlogPosts = cache(async () =>
  cached('public:blog-posts:all', () =>
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    isDev ? 60_000 : 5 * 60_000
  )
)

export const getPublicProjectBySlug = cache(async (slug: string) =>
  cached(`public:project:${slug}`, () =>
    prisma.project.findUnique({
      where: { slug },
    }),
    isDev ? 60_000 : 20 * 60_000
  )
)

export const getSitemapProjects = cache(async () =>
  cached('sitemap:projects', () =>
    prisma.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    isDev ? 60_000 : 20 * 60_000
  )
)

export const getSitemapBlogPosts = cache(async () =>
  cached('sitemap:blog-posts', () =>
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    isDev ? 60_000 : 5 * 60_000
  )
)
