import { prisma } from '@/lib/prisma'
import { cached } from '@/lib/cache'

const isDev = process.env.NODE_ENV !== 'production'

export async function getLocalizedHeroSlides(locale: string) {
  const cacheKey = `public:hero-slides:${locale}`
  return cached(
    cacheKey,
    async () => {
      const slides = await prisma.heroSlide.findMany({
        where: { published: true },
        include: {
          translations: {
            where: { locale },
            select: {
              title: true,
              subtitle: true,
              ctaText: true,
              imageAlt: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })

      return slides.map((slide) => {
        const t = slide.translations[0]
        return {
          id: slide.id,
          imageUrl: slide.imageUrl,
          ctaLink: slide.ctaLink,
          order: slide.order,
          published: slide.published,
          title: t?.title ?? undefined,
          subtitle: t?.subtitle ?? undefined,
          ctaText: t?.ctaText ?? undefined,
          imageAlt: t?.imageAlt ?? undefined,
        }
      })
    },
    isDev ? 60_000 : 20 * 60_000
  )
}

export async function getLocalizedProjects(locale: string) {
  const cacheKey = `public:projects:${locale}`
  return cached(
    cacheKey,
    async () => {
      const projects = await prisma.project.findMany({
        where: { published: true },
        include: {
          translations: {
            where: { locale },
            select: {
              slug: true,
              title: true,
              subtitle: true,
              description: true,
              content: true,
              useCases: true,
              benefits: true,
              tags: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })

      return projects.map((project) => {
        const t = project.translations[0]
        return {
          id: project.id,
          slug: t?.slug ?? undefined,
          title: t?.title ?? undefined,
          subtitle: t?.subtitle ?? undefined,
          description: t?.description ?? undefined,
          content: t?.content ?? undefined,
          useCases: t?.useCases ?? undefined,
          benefits: t?.benefits ?? [],
          tags: t?.tags ?? [],
          imageUrl: project.imageUrl ?? undefined,
          bgImage: project.bgImage ?? undefined,
          heroImage: project.heroImage ?? undefined,
          published: project.published,
          order: project.order,
        }
      })
    },
    isDev ? 60_000 : 20 * 60_000
  )
}

export async function getLocalizedProjectBySlug(locale: string, slug: string) {
  const cacheKey = `public:project:${locale}:${slug}`
  return cached(
    cacheKey,
    async () => {
      const project = await prisma.project.findFirst({
        where: {
          published: true,
          translations: {
            some: {
              locale,
              slug,
            },
          },
        },
        include: {
          translations: {
            where: { locale },
            select: {
              slug: true,
              title: true,
              subtitle: true,
              description: true,
              content: true,
              useCases: true,
              benefits: true,
              tags: true,
            },
          },
        },
      })

      if (!project) return null

      const t = project.translations[0]
      return {
        id: project.id,
        slug: t?.slug ?? slug,
        title: t?.title ?? undefined,
        subtitle: t?.subtitle ?? undefined,
        description: t?.description ?? undefined,
        content: t?.content ?? undefined,
        useCases: t?.useCases ?? undefined,
        benefits: t?.benefits ?? [],
        tags: t?.tags ?? [],
        imageUrl: project.imageUrl ?? undefined,
        bgImage: project.bgImage ?? undefined,
        heroImage: project.heroImage ?? undefined,
        published: project.published,
        order: project.order,
      }
    },
    isDev ? 60_000 : 20 * 60_000
  )
}

export async function getLocalizedReviews(locale: string) {
  const cacheKey = `public:reviews:${locale}`
  return cached(
    cacheKey,
    async () => {
      const reviews = await prisma.review.findMany({
        where: { published: true },
        include: {
          translations: {
            where: { locale },
            select: {
              headline: true,
              body: true,
              author: true,
              role: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })

      return reviews.map((review) => {
        const t = review.translations[0]
        return {
          id: review.id,
          headline: t?.headline ?? '',
          body: t?.body ?? '',
          author: t?.author ?? '',
          role: t?.role ?? '',
          avatarUrl: review.avatarUrl ?? undefined,
          rating: review.rating,
          order: review.order,
          published: review.published,
        }
      })
    },
    isDev ? 60_000 : 20 * 60_000
  )
}

export async function getLocalizedBlogPosts(locale: string) {
  const cacheKey = `public:blog-posts:${locale}`
  return cached(
    cacheKey,
    async () => {
      const posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          translations: {
            some: {
              locale,
            },
          },
        },
        include: {
          translations: {
            where: { locale },
            select: {
              slug: true,
              title: true,
              excerpt: true,
              content: true,
              tags: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      })

      return posts.map((post) => {
        const t = post.translations[0]
        return {
          id: post.id,
          slug: t?.slug ?? undefined,
          title: t?.title ?? undefined,
          excerpt: t?.excerpt ?? undefined,
          content: t?.content ?? undefined,
          tags: t?.tags ?? [],
          imageUrl: post.imageUrl ?? undefined,
          published: post.published,
          publishedAt: post.publishedAt,
        }
      })
    },
    isDev ? 60_000 : 5 * 60_000
  )
}

export async function getLocalizedBlogPostBySlug(locale: string, slug: string) {
  const cacheKey = `public:blog-post:${locale}:${slug}`
  return cached(
    cacheKey,
    async () => {
      const post = await prisma.blogPost.findFirst({
        where: {
          published: true,
          translations: {
            some: {
              locale,
              slug,
            },
          },
        },
        include: {
          translations: {
            where: { locale },
            select: {
              slug: true,
              title: true,
              excerpt: true,
              content: true,
              tags: true,
            },
          },
        },
      })

      if (!post) return null

      const t = post.translations[0]
      return {
        id: post.id,
        slug: t?.slug ?? slug,
        title: t?.title ?? undefined,
        excerpt: t?.excerpt ?? undefined,
        content: t?.content ?? undefined,
        tags: t?.tags ?? [],
        imageUrl: post.imageUrl ?? undefined,
        published: post.published,
        publishedAt: post.publishedAt,
      }
    },
    isDev ? 60_000 : 5 * 60_000
  )
}

export async function getSitemapProjects(locale: string) {
  const cacheKey = `sitemap:projects:${locale}`
  return cached(
    cacheKey,
    async () => {
      return prisma.project.findMany({
        where: {
          published: true,
          translations: {
            some: {
              locale,
            },
          },
        },
        select: {
          id: true,
          updatedAt: true,
          translations: {
            where: { locale },
            select: {
              slug: true,
            },
          },
        },
      })
    },
    isDev ? 60_000 : 20 * 60_000
  )
}

export async function getSitemapBlogPosts(locale: string) {
  const cacheKey = `sitemap:blog-posts:${locale}`
  return cached(
    cacheKey,
    async () => {
      return prisma.blogPost.findMany({
        where: {
          published: true,
          translations: {
            some: {
              locale,
            },
          },
        },
        select: {
          id: true,
          updatedAt: true,
          translations: {
            where: { locale },
            select: {
              slug: true,
            },
          },
        },
      })
    },
    isDev ? 60_000 : 5 * 60_000
  )
}
