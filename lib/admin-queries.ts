import { prisma } from '@/lib/prisma'

export async function getAdminBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { translations: true },
  })
}

export async function getAdminProjects() {
  return prisma.project.findMany({
    orderBy: { order: 'asc' },
    include: { translations: true },
  })
}

export async function getAdminReviews() {
  return prisma.review.findMany({
    orderBy: { order: 'asc' },
    include: { translations: true },
  })
}

export async function getAdminHeroSlides() {
  return prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
    include: { translations: true },
  })
}

export async function getAdminApplications() {
  return prisma.application.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getAdminApplicationsCount() {
  return prisma.application.count()
}
