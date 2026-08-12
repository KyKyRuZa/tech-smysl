import { MetadataRoute } from 'next'
import { getSitemapProjects, getSitemapBlogPosts } from '@/lib/public-queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

  const [projects, blogPosts] = await Promise.all([
    getSitemapProjects(),
    getSitemapBlogPosts(),
  ])

  const routes = [
    '',
    '/about',
    '/services',
    '/blog',
    '/projects',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...projectUrls, ...blogUrls]
}
