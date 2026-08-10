import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { cached } from '@/lib/cache'

export const getAdminBlogPosts = cache(async () =>
  cached('admin:blog-posts:all', () =>
    prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })
  )
)

export const getAdminProjects = cache(async () =>
  cached('admin:projects:all', () =>
    prisma.project.findMany({ orderBy: { order: 'asc' } })
  )
)

export const getAdminReviews = cache(async () =>
  cached('admin:reviews:all', () =>
    prisma.review.findMany({ orderBy: { order: 'asc' } })
  )
)

export const getAdminHeroSlides = cache(async () =>
  cached('admin:hero-slides:all', () =>
    prisma.heroSlide.findMany({ orderBy: { order: 'asc' } })
  )
)

export const getAdminApplications = cache(async () =>
  cached('admin:applications:all', () =>
    prisma.application.findMany({ orderBy: { createdAt: 'desc' } })
  )
)

export const getAdminApplicationsCount = cache(async () =>
  cached('admin:applications:count', () => prisma.application.count())
)
