import Hero, { type HeroSlideData } from '@/components/sections/Hero'
import Directions, { type Project } from '@/components/sections/Directions'
import Process from '@/components/sections/Process'
// import CaseStudy from '@/components/sections/CaseStudy'
import Testimonials, { type Testimonial } from '@/components/sections/Testimonials'
import Articles, { type ArticleItem } from '@/components/sections/Articles'
// import CTA from '@/components/sections/CTA'
import ContactSection from './ContactSection'
import { getPublicHeroSlides, getPublicProjects, getPublicReviews, getPublicBlogPosts } from '@/lib/public-queries'

function estimateReadTime(content: string | null | undefined): string {
  const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} мин`
}

export default async function Home() {
  const [slides, projects, reviews, posts] = await Promise.all([
    getPublicHeroSlides(),
    getPublicProjects(),
    getPublicReviews(),
    getPublicBlogPosts(),
  ])

  const heroSlides: HeroSlideData[] = slides.map((s) => ({
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt ?? undefined,
    subtitle: s.subtitle ?? undefined,
  }))

  const projectItems: Project[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    bgImage: p.bgImage ?? undefined,
    published: p.published,
    order: p.order,
  }))

  const reviewItems: Testimonial[] = reviews.map((r) => ({
    headline: r.headline,
    body: r.body,
    author: r.author ?? '',
    role: r.role ?? '',
  }))

  const articleItems: ArticleItem[] = posts.map((post, i) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? '',
    readTime: estimateReadTime(post.content),
    link: `/blog`,
    order: i,
  }))

  return (
    <>
      <Hero slides={heroSlides} />
      <Directions projects={projectItems} />
      <Process />
      {/* <CaseStudy /> */}
      <Testimonials items={reviewItems} />
      <Articles items={articleItems} />
      {/* <CTA /> */}
      <ContactSection />
    </>
  )
}
