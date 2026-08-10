import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminHeroSlides, getAdminProjects, getAdminReviews, getAdminBlogPosts } from '@/lib/admin-queries'
import VisualEditor from '@/components/admin/VisualEditor'

export default async function EditPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const [slides, projects, reviews, posts] = await Promise.all([
    getAdminHeroSlides(),
    getAdminProjects(),
    getAdminReviews(),
    getAdminBlogPosts(),
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
