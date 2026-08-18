import { MetadataRoute } from 'next'
import { getSitemapProjects, getSitemapBlogPosts } from '@/lib/i18n/queries'
import { locales } from '@/lib/i18n/get-locale'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

  const [ruProjects, enProjects, ruPosts, enPosts] = await Promise.all([
    getSitemapProjects('ru'),
    getSitemapProjects('en'),
    getSitemapBlogPosts('ru'),
    getSitemapBlogPosts('en'),
  ])

  const staticRoutes = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: locale === 'ru' ? 1 : 0.8,
    },
    {
      url: `${baseUrl}/${locale}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ])

  const projectUrls = [
    ...ruProjects.map((project) => {
      const t = project.translations[0]
      return {
        url: `${baseUrl}/ru/projects/${t?.slug ?? ''}`,
        lastModified: project.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    }),
    ...enProjects.map((project) => {
      const t = project.translations[0]
      return {
        url: `${baseUrl}/en/projects/${t?.slug ?? ''}`,
        lastModified: project.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    }),
  ]

  const blogUrls = [
    ...ruPosts.map((post) => {
      const t = post.translations[0]
      return {
        url: `${baseUrl}/ru/blog/${t?.slug ?? ''}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    }),
    ...enPosts.map((post) => {
      const t = post.translations[0]
      return {
        url: `${baseUrl}/en/blog/${t?.slug ?? ''}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    }),
  ]

  return [...staticRoutes, ...projectUrls, ...blogUrls]
}
