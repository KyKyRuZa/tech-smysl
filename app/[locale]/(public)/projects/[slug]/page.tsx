import styles from '../page.module.css'
import { getLocalizedProjectBySlug } from '@/lib/i18n/queries'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const project = await getLocalizedProjectBySlug(locale, slug)
  if (!project) return {}

  return {
    title: project.title,
    description: project.subtitle || project.description || undefined,
    alternates: {
      canonical: `/${locale}/projects/${project.slug}`,
      languages: {
        ru: `/ru/projects/${slug}`,
        en: `/en/projects/${slug}`,
      },
    },
  }
}

export default async function ProjectDetail({ params }: Props) {
  const { locale, slug } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  const project = await getLocalizedProjectBySlug(locale, slug)

  if (!project || !project.published) {
    notFound()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{project.title}</h1>
      {project.subtitle && <p className={styles.placeholder}>{project.subtitle}</p>}
      {project.imageUrl && (
        <Image
          src={project.imageUrl}
          alt={project.title}
          className={styles.cardImg}
          width={1200}
          height={600}
        />
      )}
      {project.content && <p className={styles.placeholder} style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{project.content}</p>}
    </div>
  )
}
