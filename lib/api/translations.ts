import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

function cleanPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  )
}

export async function upsertHeroSlideTranslations(slideId: string, data: {
  ru?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
  en?: { title?: string; subtitle?: string; ctaText?: string; imageAlt?: string }
}) {
  for (const [locale, translation] of Object.entries(data)) {
    if (!translation) continue
    const payload = { ...cleanPayload(translation as Record<string, unknown>), locale, slideId } as unknown as Prisma.HeroSlideTranslationCreateInput
    if (!Object.keys(payload).length) continue
    await prisma.heroSlideTranslation.upsert({
      where: { locale_slideId: { locale, slideId } },
      update: payload,
      create: payload,
    })
  }
}

export async function upsertProjectTranslations(projectId: string, data: {
  ru?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
  en?: { slug: string; title: string; subtitle?: string; description?: string; content?: string; useCases?: string; benefits: string[]; tags: string[] }
}) {
  for (const [locale, translation] of Object.entries(data)) {
    if (!translation) continue
    const payload = { ...cleanPayload(translation as Record<string, unknown>), locale, projectId } as unknown as Prisma.ProjectTranslationCreateInput
    if (!Object.keys(payload).length) continue
    await prisma.projectTranslation.upsert({
      where: { locale_projectId: { locale, projectId } },
      update: payload,
      create: payload,
    })
  }
}

export async function upsertReviewTranslations(reviewId: string, data: {
  ru?: { headline: string; body: string; author?: string; role?: string }
  en?: { headline: string; body: string; author?: string; role?: string }
}) {
  for (const [locale, translation] of Object.entries(data)) {
    if (!translation) continue
    const payload = { ...cleanPayload(translation as Record<string, unknown>), locale, reviewId } as unknown as Prisma.ReviewTranslationCreateInput
    if (!Object.keys(payload).length) continue
    await prisma.reviewTranslation.upsert({
      where: { locale_reviewId: { locale, reviewId } },
      update: payload,
      create: payload,
    })
  }
}

export async function upsertBlogPostTranslations(postId: string, data: {
  ru?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
  en?: { slug: string; title: string; excerpt?: string; content: string; tags: string[] }
}) {
  for (const [locale, translation] of Object.entries(data)) {
    if (!translation) continue
    const payload = { ...cleanPayload(translation as Record<string, unknown>), locale, postId } as unknown as Prisma.BlogPostTranslationCreateInput
    if (!Object.keys(payload).length) continue
    await prisma.blogPostTranslation.upsert({
      where: { locale_postId: { locale, postId } },
      update: payload,
      create: payload,
    })
  }
}
