import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getAdminBlogPosts = cache(async () =>
  prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })
)

export const getAdminProjects = cache(async () =>
  prisma.project.findMany({ orderBy: { order: 'asc' } })
)

export const getAdminReviews = cache(async () =>
  prisma.review.findMany({ orderBy: { order: 'asc' } })
)

export const getAdminHeroSlides = cache(async () =>
  prisma.heroSlide.findMany({ orderBy: { order: 'asc' } })
)

export const getAdminApplications = cache(async () =>
  prisma.application.findMany({ orderBy: { createdAt: 'desc' } })
)

export const getAdminApplicationsCount = cache(async () =>
  prisma.application.count()
)
