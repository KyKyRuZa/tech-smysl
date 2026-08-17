import styles from './project-detail.module.css'
import { getLocalizedProjectBySlug, getLocalizedProjects } from '@/lib/i18n/queries'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { isValidLocale } from '@/lib/i18n/get-locale'
import { getTranslations } from '@/lib/i18n/translations'
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

  const allProjects = await getLocalizedProjects(locale)
  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null

  const t = getTranslations(locale)

  const benefits = project.benefits?.filter(Boolean) ?? []
  const tags = project.tags?.filter(Boolean) ?? []
  const useCases = project.useCases?.trim() ?? ''

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <Link href={`/${locale}`} className={styles.breadcrumbLink}>
                {t.projects.home}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
            </li>
            <li className={styles.breadcrumbItem}>
              <Link href={`/${locale}/projects`} className={styles.breadcrumbLink}>
                {t.breadcrumb.projectsList}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
            </li>
            <li className={styles.breadcrumbItem}>
              <span className={styles.breadcrumbCurrent}>{project.title}</span>
            </li>
          </ol>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{project.title}</h1>
          {project.subtitle && <p className={styles.subtitle}>{project.subtitle}</p>}
        </header>

        <div className={styles.main}>
          <div className={styles.viewer}>
            {project.imageUrl ? (
              <Image
                src={project.imageUrl}
                alt={project.title}
                className={styles.viewerImage}
                width={800}
                height={600}
                priority
              />
            ) : (
              <div className={styles.viewerPlaceholder}>
                <svg className={styles.viewerPlaceholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>{project.title}</span>
              </div>
            )}
          </div>

          <div className={styles.info}>
            {project.description && (
              <p className={styles.description}>{project.description}</p>
            )}

            {benefits.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Преимущества</h2>
                <ul className={styles.benefitsList}>
                  {benefits.map((benefit, index) => (
                    <li key={index} className={styles.benefitsListItem}>
                      <span className={styles.bullet} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {useCases && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Где применяется</h2>
                <p className={styles.useCases}>{useCases}</p>
              </div>
            )}

            {tags.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Теги</h2>
                <div className={styles.tagsList}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.navDots}>
          {prevProject && (
            <Link href={`/${locale}/projects/${prevProject.slug}`} className={`${styles.navDot} ${styles.navDotActive}`}>
              <svg className={styles.navDotIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
          {nextProject && (
            <Link href={`/${locale}/projects/${nextProject.slug}`} className={`${styles.navDot} ${styles.navDotActive}`}>
              <svg className={styles.navDotIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
