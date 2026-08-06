import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import VisualEditor from '@/components/admin/VisualEditor'

export default async function EditPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const [slides, projects, reviews, posts] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { order: 'asc' } }),
    prisma.project.findMany({ orderBy: { order: 'asc' } }),
    prisma.review.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } }),
  ])

  return (
    <VisualEditor
      initialSlides={slides}
      initialProjects={projects}
      initialReviews={reviews}
      initialPosts={posts}
    />
  )
}
