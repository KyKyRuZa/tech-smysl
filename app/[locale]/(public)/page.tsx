import Hero, { type HeroSlideData } from '@/components/sections/Hero'
import Directions, { type Project } from '@/components/sections/Directions'
import Process from '@/components/sections/Process'
// import CaseStudy from '@/components/sections/CaseStudy'
import Testimonials, { type Testimonial } from '@/components/sections/Testimonials'
import Articles, { type ArticleItem } from '@/components/sections/Articles'
// import CTA from '@/components/sections/CTA'
import ContactSection from './ContactSection'
import { getLocalizedHeroSlides, getLocalizedProjects, getLocalizedReviews, getLocalizedBlogPosts } from '@/lib/i18n/queries'
import { getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { getTranslations } from '@/lib/i18n/translations'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

function estimateReadTime(content: string | null | undefined): string {
  const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} мин`
}

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const titles: Record<string, string> = {
    ru: 'Тех Смысл — IT-разработка, 3D-визуализация и AR',
    en: 'Tech Smysl — IT Development, 3D Visualization and AR',
  }

  return {
    title: titles[locale] ?? 'Tech Smysl',
    description: locale === 'ru'
      ? 'IT-компания полного цикла: разработка сайтов, мобильных приложений, 3D-визуализации и AR-решений. +30 проектов в год, 99,9% аптайм.'
      : 'Full-cycle IT company: websites, mobile apps, 3D visualization and AR solutions. +30 projects yearly, 99.9% uptime.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ru: '/ru',
        en: '/en',
      },
    },
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  const t = getTranslations(locale)

  const [slides, projects, reviews, posts] = await Promise.all([
    getLocalizedHeroSlides(locale),
    getLocalizedProjects(locale),
    getLocalizedReviews(locale),
    getLocalizedBlogPosts(locale),
  ])

  const heroSlides: HeroSlideData[] = slides.map((s) => ({
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    subtitle: s.subtitle,
  }))

  const projectItems: Project[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle,
    imageUrl: p.imageUrl,
    bgImage: p.bgImage,
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
    link: `/${locale}/blog/${post.slug}`,
    order: i,
  }))

  return (
    <>
      <Hero
        slides={heroSlides}
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        ctaText={t.hero.cta}
        microNote={t.hero.microNote}
        locale={locale}
      />
      <Directions
        projects={projectItems}
        title={t.directions.title}
        subtitle={t.directions.subtitle}
        allProjectsText={t.directions.allProjects}
        emptyText={t.directions.empty}
        prevAria={t.directions.prev}
        nextAria={t.directions.next}
        locale={locale}
      />
      <Process
        title={t.process.title}
        subtitle={t.process.subtitle}
        steps={t.process.steps}
      />
      {/* <CaseStudy /> */}
      <Testimonials
        items={reviewItems}
        title={t.testimonials.title}
        titleLine2={t.testimonials.titleLine2}
        note={t.testimonials.note}
        allReviewsText={t.testimonials.allReviews}
        emptyText={t.testimonials.empty}
      />
      <Articles
        items={articleItems}
        title={t.articles.title}
        subtitle={t.articles.subtitle}
        emptyText={t.articles.empty}
        readMoreText={t.articles.readMore}
        readMoreLink={`/${locale}/blog`}
      />
      {/* <CTA /> */}
      <ContactSection locale={locale} />
    </>
  )
}
