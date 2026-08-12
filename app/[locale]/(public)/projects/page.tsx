import styles from './page.module.css'
import { getLocalizedProjects } from '@/lib/i18n/queries'
import Image from 'next/image'
import Link from 'next/link'
import { getLocaleFromPath, isValidLocale } from '@/lib/i18n/get-locale'
import { getTranslations } from '@/lib/i18n/translations'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const t = getTranslations(locale)

  return {
    title: t.projects.title,
    description: locale === 'ru'
      ? '3D-визуализация, AR-решения и интерактивные установки от Tech Smysl.'
      : '3D visualization, AR solutions and interactive installations by Tech Smysl.',
    alternates: {
      canonical: `/${locale}/projects`,
      languages: {
        ru: '/ru/projects',
        en: '/en/projects',
      },
    },
  }
}

export default async function Projects({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  const t = getTranslations(locale)
  const projects = await getLocalizedProjects(locale)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.projects.title}</h1>
      {projects.length === 0 ? (
        <p className={styles.placeholder}>{t.projects.empty}</p>
      ) : (
        <ul className={styles.grid}>
          {projects.map((project) => (
            <li key={project.id} className={styles.card}>
              <Link href={`/${locale}/projects/${project.slug}`} className={styles.cardLink}>
                {project.imageUrl && (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    className={styles.cardImg}
                    width={800}
                    height={600}
                    loading="lazy"
                  />
                )}
                <h2 className={styles.cardTitle}>{project.title}</h2>
                {project.subtitle && <p className={styles.cardText}>{project.subtitle}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
